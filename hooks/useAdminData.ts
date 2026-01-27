import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { TipRecord } from '@/types';
import { getTips, getTipsStats, exportTipsCSV, TipsFilter } from '@/app/actions/tips';
import { getAllWaiters, Waiter } from '@/app/actions/waiters';
import { getTipPercentages } from '@/app/actions/settings';

/**
 * Hook personalizado para gestionar la lógica de datos del Panel de Administración.
 * Centraliza el estado, la carga de datos y las operaciones de exportación.
 *
 * @returns Objeto con estados y funciones para el Panel Admin.
 */
export function useAdminData() {
  const [tips, setTips] = useState<TipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<TipsFilter>({});

  // Estados adicionales para centralización
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [percentages, setPercentages] = useState<number[]>([0, 0, 0]);
  const [loadingWaiters, setLoadingWaiters] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Controladores de carga única (caché)
  const hasLoadedWaiters = useRef(false);
  const hasLoadedSettings = useRef(false);

  /**
   * Utilidad simple de debounce para limitar la frecuencia de ejecución de funciones.
   * Útil para evitar peticiones excesivas durante la escritura en campos de búsqueda.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
    let timeout: NodeJS.Timeout;
    return function (this: unknown, ...args: Parameters<T>) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Estados para métricas
  const [stats, setStats] = useState({
    totalTips: 0,
    avgPercentage: 0,
    topWaiter: '-',
  });

  /**
   * Carga los datos de propinas y estadísticas actuales desde el servidor.
   */
  const fetchTips = useCallback(async () => {
    setLoading(true);
    try {
      let dataRes, statsRes;

      try {
        dataRes = await getTips(page, 10, filters);
      } catch (err) {
        console.error('Error fetching tips:', err);
        dataRes = { data: [], total: 0, pages: 0, currentPage: 1 };
      }

      try {
        statsRes = await getTipsStats(filters);
      } catch (err) {
        console.error('Error fetching stats:', err);
        statsRes = { totalTips: 0, avgPercentage: 0, topWaiter: '-' };
      }

      setTips(dataRes.data);
      setTotalPages(dataRes.pages);
      setStats(statsRes);
    } catch (error) {
      console.error('Error al cargar datos (Hook General):', error);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  /**
   * Carga la lista de meseros. Solo ejecuta la petición si no se han cargado antes
   * o si se fuerza el refresco.
   */
  const fetchWaiters = useCallback(
    async (force = false) => {
      if (hasLoadedWaiters.current && !force && waiters.length > 0) return;

      setLoadingWaiters(true);
      try {
        const data = await getAllWaiters();
        setWaiters(data);
        hasLoadedWaiters.current = true;
      } catch (error) {
        console.error('Error loading waiters:', error);
        toast.error('Error al cargar meseros');
      } finally {
        setLoadingWaiters(false);
      }
    },
    [waiters.length]
  );

  /**
   * Carga la configuración de porcentajes.
   */
  const fetchSettings = useCallback(async (force = false) => {
    if (hasLoadedSettings.current && !force) return;

    setLoadingSettings(true);
    try {
      const data = await getTipPercentages();
      setPercentages(data);
      hasLoadedSettings.current = true;
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Error al cargar configuración');
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  /**
   * Actualiza el rango de fechas para el filtrado.
   */
  const setDateRange = (start?: Date, end?: Date) => {
    setFilters((prev) => ({
      ...prev,
      startDate: start?.toISOString(),
      endDate: end?.toISOString(),
    }));
    setPage(1);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetSearch = useCallback(
    debounce((term: string) => {
      setFilters((prev) => ({ ...prev, search: term }));
      setPage(1);
    }, 500),
    []
  );

  const handleSearchChange = (term: string) => {
    debouncedSetSearch(term);
  };

  /**
   * Exporta los datos a CSV.
   */
  const exportCSV = async () => {
    try {
      toast.loading('Generando reporte completo...');
      const allTips = await exportTipsCSV(filters);

      if (allTips.length === 0) {
        toast.dismiss();
        toast.info('No hay datos para exportar');
        return;
      }

      const headers = ['Fecha', 'Mesa', 'Mesero', 'Propina (%)', 'IP Origen', 'Dispositivo'];
      const rows = allTips.map((tip) => [
        new Date(tip.createdAt).toLocaleString(),
        tip.tableNumber,
        tip.waiterName,
        tip.tipPercentage.toString(),
        tip.ipAddress || '-',
        tip.userAgent || '-',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `reporte-propinas-${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss();
      toast.success('Reporte descargado');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.dismiss();
      toast.error('Error al generar el reporte');
    }
  };

  return {
    tips,
    loading,
    stats,
    fetchTips,
    exportCSV,
    page,
    setPage,
    totalPages,
    setDateRange,
    setSearch: handleSearchChange,
    filters,
    // Nuevos estados y funciones
    waiters,
    setWaiters,
    loadingWaiters,
    fetchWaiters,
    percentages,
    setPercentages,
    loadingSettings,
    fetchSettings,
  };
}

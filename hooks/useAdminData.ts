import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { TipRecord } from '@/types';
import { getTips, getTipsStats, exportTipsCSV, TipsFilter } from '@/app/actions/tips';

/**
 * Hook personalizado para gestionar la lógica de datos del Panel de Administración.
 * Centraliza el estado, la carga de datos y las operaciones de exportación.
 *
 * @returns Objeto con estados (tips, loading, stats) y funciones (fetchTips, exportCSV, setter de filtros).
 */
export function useAdminData() {
  const [tips, setTips] = useState<TipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<TipsFilter>({});

  // Simple debounce utility (inside hook or imported)
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
   * Se ejecuta automáticamente cuando cambian la página o los filtros.
   */
  const fetchTips = useCallback(async () => {
    setLoading(true);
    try {
      let dataRes, statsRes;

      try {
        dataRes = await getTips(page, 20, filters);
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

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  /**
   * Actualiza el rango de fechas para el filtrado.
   * Reinicia la paginación a la página 1.
   */
  const setDateRange = (start?: Date, end?: Date) => {
    setFilters((prev) => ({
      ...prev,
      startDate: start?.toISOString(),
      endDate: end?.toISOString(),
    }));
    setPage(1); // Reset a primera página al filtrar
  };

  // Debounce implementation for search
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
   * Exporta los datos filtrados a un archivo CSV.
   * Maneja la descarga en el navegador del usuario.
   */
  const exportCSV = async () => {
    try {
      toast.loading('Generando reporte completo...');
      const allTips = await exportTipsCSV(filters);

      if (allTips.length === 0) {
        toast.dismiss();
        toast.info('No hay datos para exportar con los filtros actuales');
        return;
      }

      // Crear encabezados CSV
      const headers = ['Fecha', 'Mesa', 'Mesero', 'Propina (%)'];
      const rows = allTips.map((tip) => [
        new Date(tip.createdAt).toLocaleString(),
        tip.tableNumber,
        tip.waiterName,
        tip.tipPercentage.toString(),
      ]);

      // Combinar encabezados y filas
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `propinas-monalisa-FULL-${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss();
      toast.success('Reporte descargado correctamente');
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
  };
}

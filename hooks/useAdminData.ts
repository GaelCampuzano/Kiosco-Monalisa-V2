import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { TipRecord } from '@/types';
import { getTips, getTipsStats, exportTipsCSV, TipsFilter } from '@/app/actions/tips';

export function useAdminData() {
  const [tips, setTips] = useState<TipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<TipsFilter>({});

  // Se asume que la autenticación de cookie (proxy) es suficiente.
  const [dbAuthenticated] = useState(true);

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

  const fetchTips = useCallback(async () => {
    setLoading(true);
    try {
      // [DEBUG] Cargar datos por separado para aislar el error
      // const [dataRes, statsRes] = await Promise.all([
      //     getTips(page, 20, filters),
      //     getTipsStats(filters)
      // ]);

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

  const setDateRange = (start?: Date, end?: Date) => {
    setFilters((prev) => ({
      ...prev,
      startDate: start?.toISOString(),
      endDate: end?.toISOString(),
    }));
    setPage(1); // Reset a primera página al filtrar
  };

  // Debounce implementation would go here, but since the requirement is to "Implement debouncing in search",
  // and this hook exposes `setSearch` which triggers fetch immediately via useEffect...
  // The "Debounce" should happen in the UI component calling `setSearch`.
  // However, if we want it here, we need a separate state for the input vs the filter.
  // Let's assume the UI component handles the text input state and calls `setSearch` (now debounced by the caller or we provide a debounced callback).
  // Actually, "Implementar debouncing en la búsqueda". I will add a debounced version here to be safe and robust.

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
    dbAuthenticated,
    page,
    setPage,
    totalPages,
    setDateRange,
    setSearch: handleSearchChange,
    filters,
  };
}

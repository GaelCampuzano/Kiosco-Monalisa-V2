import { useState, useCallback, useEffect } from "react";
import { TipRecord } from "@/types";
import { getTips, getTipsStats, TipsFilter } from "@/app/actions/tips";

export function useAdminData() {
    const [tips, setTips] = useState<TipRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState<TipsFilter>({});

    // Se asume que la autenticación de cookie (proxy) es suficiente.
    const [dbAuthenticated] = useState(true);

    // Estados para métricas
    const [stats, setStats] = useState({
        totalTips: 0,
        avgPercentage: 0,
        topWaiter: "-"
    });

    const fetchTips = useCallback(async () => {
        setLoading(true);
        try {
            // Cargar datos y estadísticas en paralelo
            const [dataRes, statsRes] = await Promise.all([
                getTips(page, 20, filters),
                getTipsStats(filters)
            ]);

            setTips(dataRes.data);
            setTotalPages(dataRes.pages);
            setStats(statsRes);

        } catch (error) {
            console.error("Error al cargar datos (MySQL Server Action):", error);
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        fetchTips();
    }, [fetchTips]);

    const setDateRange = (start?: Date, end?: Date) => {
        setFilters(prev => ({
            ...prev,
            startDate: start?.toISOString(),
            endDate: end?.toISOString()
        }));
        setPage(1); // Reset a primera página al filtrar
    };

    const setSearch = (term: string) => {
        setFilters(prev => ({ ...prev, search: term }));
        setPage(1);
    };

    const exportCSV = (filteredTips: TipRecord[]) => {
        if (filteredTips.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        // Crear encabezados CSV
        const headers = ['Fecha', 'Mesa', 'Mesero', 'Propina (%)'];
        const rows = filteredTips.map(tip => [
            new Date(tip.createdAt).toLocaleString(),
            tip.tableNumber,
            tip.waiterName,
            tip.tipPercentage.toString()
        ]);

        // Combinar encabezados y filas
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Crear blob y descargar
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `propinas-monalisa-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        setSearch,
        filters
    };
}

import { useState, useCallback, useEffect } from "react";
import { TipRecord } from "@/types";
import { fetchAllTips } from "@/app/actions/tips";

export function useAdminData() {
    const [tips, setTips] = useState<TipRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Se asume que la autenticación de cookie (proxy) es suficiente.
    const [dbAuthenticated] = useState(true);

    // Estados para métricas
    const [stats, setStats] = useState({
        totalTips: 0,
        avgPercentage: 0,
        topWaiter: "-"
    });

    const calculateStats = (data: TipRecord[]) => {
        if (data.length === 0) {
            setStats({ totalTips: 0, avgPercentage: 0, topWaiter: "-" });
            return;
        }

        const totalPct = data.reduce((acc, curr) => acc + curr.tipPercentage, 0);
        const avg = (totalPct / data.length).toFixed(1);

        const waiterCounts: Record<string, number> = {};
        data.forEach(t => {
            waiterCounts[t.waiterName] = (waiterCounts[t.waiterName] || 0) + 1;
        });
        const topWaiter = Object.entries(waiterCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

        setStats({
            totalTips: data.length,
            avgPercentage: Number(avg),
            topWaiter
        });
    };

    const fetchTips = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchAllTips();
            setTips(data);
            calculateStats(data);
        } catch (error) {
            console.error("Error al cargar propinas (MySQL Server Action):", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTips();
    }, [fetchTips]);

    const exportCSV = (filteredTips: TipRecord[]) => {
        if (filteredTips.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        // Crear encabezados CSV
        const headers = ['Fecha', 'Mesa', 'Mesero', 'Propina (%)', 'User Agent'];
        const rows = filteredTips.map(tip => [
            new Date(tip.createdAt).toLocaleString(),
            tip.tableNumber,
            tip.waiterName,
            tip.tipPercentage.toString(),
            tip.userAgent || ''
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
        dbAuthenticated
    };
}

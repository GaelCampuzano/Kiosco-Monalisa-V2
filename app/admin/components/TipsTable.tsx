import { Search } from "lucide-react";
import { TipRecord } from "@/types";

interface TipsTableProps {
    tips: TipRecord[];
    search: string;
    setSearch: (value: string) => void;
    loading: boolean;
    dbAuthenticated: boolean;
}

export function TipsTable({ tips, search, setSearch, loading, dbAuthenticated }: TipsTableProps) {
    const filtered = tips.filter(t =>
        t.waiterName.toLowerCase().includes(search.toLowerCase()) ||
        t.tableNumber.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-monalisa-navy/30 backdrop-blur-md rounded-sm border border-monalisa-gold/10 overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-monalisa-gold/10 bg-monalisa-navy/50">
                <div className="relative">
                    <Search className="absolute left-3 sm:left-4 top-3 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-monalisa-silver/30" />
                    <input
                        type="text"
                        placeholder="Buscar por mesero o mesa..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-monalisa-navy/50 border border-monalisa-gold/20 rounded-sm py-2 sm:py-3 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm sm:text-base text-white placeholder:text-monalisa-silver/20 focus:border-monalisa-gold outline-none transition-all font-light"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-monalisa-gold/5 border-b border-monalisa-gold/10">
                        <tr>
                            <th className="p-5 text-xs font-bold text-monalisa-gold/80 uppercase tracking-widest">Fecha</th>
                            <th className="p-5 text-xs font-bold text-monalisa-gold/80 uppercase tracking-widest">Mesa</th>
                            <th className="p-5 text-xs font-bold text-monalisa-gold/80 uppercase tracking-widest">Mesero</th>
                            <th className="p-5 text-xs font-bold text-monalisa-gold/80 uppercase tracking-widest">Propina</th>
                            <th className="p-5 text-xs font-bold text-monalisa-gold/80 uppercase tracking-widest hidden lg:table-cell">Dispositivo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-monalisa-gold/5">
                        {loading || !dbAuthenticated ? (
                            <tr><td colSpan={5} className="p-12 text-center text-monalisa-silver/50 italic">
                                {dbAuthenticated ? "Cargando datos del servidor..." : "Error de conexión/autenticación."}
                            </td></tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-monalisa-silver/50 italic">
                                    {search ? 'No se encontraron registros que coincidan con la búsqueda.' : 'No se encontraron registros recientes.'}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((tip) => (
                                <tr key={tip.id} className="hover:bg-monalisa-gold/5 transition-colors group">
                                    <td className="p-5 text-monalisa-silver font-light">
                                        {new Date(tip.createdAt).toLocaleString('es-MX', {
                                            timeZone: 'America/Mazatlan',
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </td>
                                    <td className="p-5">
                                        <span className="font-serif text-lg text-white">{tip.tableNumber}</span>
                                    </td>
                                    <td className="p-5 text-white font-medium tracking-wide">{tip.waiterName}</td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-sm font-bold text-xs tracking-wider border ${tip.tipPercentage === 25
                                            ? 'bg-green-900/30 text-green-400 border-green-800/50'
                                            : tip.tipPercentage === 23
                                                ? 'bg-blue-900/30 text-blue-300 border-blue-800/50'
                                                : 'bg-monalisa-gold/10 text-monalisa-gold border-monalisa-gold/30'
                                            }`}>
                                            {tip.tipPercentage}%
                                        </span>
                                    </td>
                                    <td className="p-5 text-xs text-monalisa-silver/30 max-w-[150px] truncate hidden lg:table-cell group-hover:text-monalisa-silver/60 transition-colors">
                                        {tip.userAgent}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-monalisa-gold/5 border-t border-monalisa-gold/10 text-center text-xs text-monalisa-silver/40 uppercase tracking-widest">
                Mostrando {filtered.length} registros
            </div>
        </div>
    );
}

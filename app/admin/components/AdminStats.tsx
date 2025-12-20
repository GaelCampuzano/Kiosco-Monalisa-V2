import { Calendar, TrendingUp, Users } from "lucide-react";

interface AdminStatsProps {
    stats: {
        totalTips: number;
        avgPercentage: number;
        topWaiter: string;
    };
}

export function AdminStats({ stats }: AdminStatsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-monalisa-navy/40 backdrop-blur-md border border-monalisa-gold/20 p-4 sm:p-6 rounded-sm shadow-xl hover:border-monalisa-gold/40 transition-all">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-monalisa-silver/60 text-xs sm:text-sm font-bold uppercase tracking-widest">Total Propinas</h3>
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-monalisa-gold/60" />
                </div>
                <p className="text-3xl sm:text-4xl font-serif font-bold text-monalisa-gold">{stats.totalTips}</p>
                <p className="text-[10px] sm:text-xs text-monalisa-silver/40 mt-1 sm:mt-2">Registros totales</p>
            </div>

            <div className="bg-monalisa-navy/40 backdrop-blur-md border border-monalisa-gold/20 p-4 sm:p-6 rounded-sm shadow-xl hover:border-monalisa-gold/40 transition-all">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-monalisa-silver/60 text-xs sm:text-sm font-bold uppercase tracking-widest">Promedio</h3>
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-monalisa-gold/60" />
                </div>
                <p className="text-3xl sm:text-4xl font-serif font-bold text-monalisa-gold">{stats.avgPercentage}%</p>
                <p className="text-[10px] sm:text-xs text-monalisa-silver/40 mt-1 sm:mt-2">Porcentaje promedio</p>
            </div>

            <div className="bg-monalisa-navy/40 backdrop-blur-md border border-monalisa-gold/20 p-4 sm:p-6 rounded-sm shadow-xl hover:border-monalisa-gold/40 transition-all sm:col-span-2 md:col-span-1">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-monalisa-silver/60 text-xs sm:text-sm font-bold uppercase tracking-widest">Mesero Top</h3>
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-monalisa-gold/60" />
                </div>
                <p className="text-xl sm:text-2xl font-serif font-bold text-monalisa-gold truncate">{stats.topWaiter}</p>
                <p className="text-[10px] sm:text-xs text-monalisa-silver/40 mt-1 sm:mt-2">Más activo</p>
            </div>
        </div>
    );
}

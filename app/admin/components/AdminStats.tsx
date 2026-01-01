import { useEffect } from "react";
import { Calendar, TrendingUp, Users } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

interface AdminStatsProps {
    stats: {
        totalTips: number;
        avgPercentage: number;
        topWaiter: string;
    };
}

function MotionNumber({ value, suffix = "" }: { value: number, suffix?: string }) {
    // Animación suave de números
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) => Math.round(current) + suffix);

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return <motion.span>{display}</motion.span>;
}

export function AdminStats({ stats }: AdminStatsProps) {
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Propinas</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            <MotionNumber value={stats.totalTips} />
                        </div>
                        <p className="text-xs text-muted-foreground">Registros totales</p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Promedio</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            <MotionNumber value={stats.avgPercentage} suffix="%" />
                        </div>
                        <p className="text-xs text-muted-foreground">Porcentaje promedio</p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="sm:col-span-2 md:col-span-1">
                <Card className="hover:border-primary/50 transition-colors h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mesero Top</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">
                            {stats.topWaiter || "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground">Más activo del mes</p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

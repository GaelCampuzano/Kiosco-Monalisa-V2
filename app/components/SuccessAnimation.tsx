import { motion } from "framer-motion";

export function SuccessAnimation() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
        >
            {/* Ondas concéntricas suaves */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{
                        scale: [0.8, 2.5, 2.8],
                        opacity: [0.6, 0.3, 0]
                    }}
                    transition={{
                        duration: 1.5,
                        delay: i * 0.2,
                        ease: "easeOut"
                    }}
                    className="absolute w-64 h-64 rounded-full border-2 border-monalisa-gold/40"
                    style={{
                        background: `radial-gradient(circle, rgba(223,200,148,${0.2 - i * 0.05}) 0%, transparent 70%)`
                    }}
                />
            ))}

            {/* Partículas flotantes sutiles */}
            {[...Array(8)].map((_, i) => {
                const angle = (i * 360) / 8;
                const radius = 120;
                return (
                    <motion.div
                        key={i}
                        initial={{
                            x: 0,
                            y: 0,
                            opacity: 0.8,
                            scale: 0
                        }}
                        animate={{
                            x: Math.cos((angle * Math.PI) / 180) * radius,
                            y: Math.sin((angle * Math.PI) / 180) * radius,
                            opacity: [0.8, 0.4, 0],
                            scale: [0, 1, 0.5]
                        }}
                        transition={{
                            duration: 1.2,
                            delay: 0.1,
                            ease: "easeOut"
                        }}
                        className="absolute w-2 h-2 rounded-full bg-monalisa-gold/60"
                    />
                );
            })}

            {/* Brillo central suave */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: [0, 1.2, 1],
                    opacity: [0, 0.6, 0]
                }}
                transition={{
                    duration: 1,
                    ease: "easeOut"
                }}
                className="absolute w-32 h-32 rounded-full blur-xl"
                style={{
                    background: 'radial-gradient(circle, rgba(223,200,148,0.3) 0%, transparent 70%)'
                }}
            />
        </motion.div>
    );
}

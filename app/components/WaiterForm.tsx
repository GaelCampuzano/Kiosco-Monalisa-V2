import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { translations, TranslationType } from "@/lib/translations";

interface WaiterFormProps {
    tableNumber: string;
    setTableNumber: (value: string) => void;
    waiterName: string;
    setWaiterName: (value: string) => void;
    onSubmit: () => void;
    text: TranslationType;
}

export function WaiterForm({
    tableNumber,
    setTableNumber,
    waiterName,
    setWaiterName,
    onSubmit,
    text
}: WaiterFormProps) {
    const [logoError, setLogoError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (waiterName && tableNumber) {
            onSubmit();
        }
    };

    return (
        <motion.div
            key="waiter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md bg-[#162B46]/40 backdrop-blur-xl border border-white/10 p-6 sm:p-8 md:p-12 rounded-sm shadow-2xl"
        >
            <div className="text-center mb-6 sm:mb-8">

                {/* LOGO CON EFECTO SPOTLIGHT (LUZ RADIAL) */}
                <div className="relative w-full h-24 sm:h-32 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                    {/* Capa de luz de fondo difusa */}
                    <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(255,255,255,0.8)_20%,transparent_100%)] blur-xl" />

                    {/* Logo encima */}
                    <div className="relative w-48 h-20 sm:w-64 sm:h-28">
                        {!logoError ? (
                            <Image
                                src="/logo-monalisa.svg"
                                alt="Logo Sunset Monalisa"
                                fill
                                priority
                                className="object-contain"
                                onError={() => setLogoError(true)}
                                onLoad={() => setLogoError(false)}
                            />
                        ) : null}
                        {logoError && (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-monalisa-gold text-xl sm:text-2xl font-serif">Sunset Monalisa</span>
                            </div>
                        )}
                    </div>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl text-white tracking-wide drop-shadow-sm border-t border-white/10 pt-4 sm:pt-6">
                    {text.waiterTitle}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                <div className="group">
                    <label className="block text-xs font-bold text-monalisa-gold/80 uppercase tracking-widest mb-2 ml-1">{text.table}</label>
                    <input
                        type="text"
                        required
                        value={tableNumber}
                        maxLength={3}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            if (value.length <= 3) {
                                setTableNumber(value);
                            }
                        }}
                        className="w-full bg-black/20 border border-white/10 focus:border-monalisa-gold rounded-sm text-white text-xl sm:text-2xl py-2.5 sm:py-3 px-4 outline-none transition-all font-serif placeholder:text-white/10 text-center"
                        placeholder="#"
                    />
                </div>

                <div className="group">
                    <label className="block text-xs font-bold text-monalisa-gold/80 uppercase tracking-widest mb-2 ml-1">{text.waiter}</label>
                    <input
                        type="text"
                        required
                        value={waiterName}
                        onChange={(e) => {
                            if (!/[0-9]/.test(e.target.value)) setWaiterName(e.target.value);
                        }}
                        className="w-full bg-black/20 border border-white/10 focus:border-monalisa-gold rounded-sm text-white text-lg sm:text-xl py-2.5 sm:py-3 px-4 outline-none transition-all font-serif placeholder:text-white/10 text-center"
                        placeholder={text.waiterPlaceholder}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full mt-4 sm:mt-6 bg-monalisa-bronze text-white py-3 sm:py-4 px-6 rounded-sm font-bold tracking-[0.15em] uppercase text-xs hover:bg-monalisa-gold hover:text-monalisa-navy transition-all duration-300 shadow-lg hover:shadow-monalisa-gold/20"
                >
                    {text.btnDeliver}
                </button>
            </form>
        </motion.div>
    );
}

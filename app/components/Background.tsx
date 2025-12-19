import { useState } from "react";
import Image from "next/image";

export function Background() {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="absolute inset-0 w-full h-full -z-20">
            {/* Fallback de fondo siempre presente */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#162B46] via-[#1a3450] to-[#162B46]" />

            {/* Intentar cargar imagen siempre */}
            {!imageError && (
                <Image
                    src="/bkg.jpg"
                    alt="Fondo Sunset Monalisa"
                    fill
                    priority
                    className="object-cover"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                />
            )}

            {/* Overlays decorativos */}
            <div className="absolute inset-0 bg-[#162B46]/60 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#162B46] via-transparent to-[#162B46]/30" />
        </div>
    );
}

export type Language = 'es' | 'en';

export const translations = {
    es: {
        waiterTitle: "Configuración de Mesa",
        table: "Mesa",
        waiter: "Mesero",
        waiterPlaceholder: "Tu nombre",
        btnDeliver: "Presentar al Cliente",
        clientTitle: "Su experiencia en Sunset Monalisa",
        selectTip: "Agradecimiento para",
        tipLabel: "Servicio",
        thanks: "¡Gracias por su visita!",
        bye: "Esperamos verle pronto.",
        online: "En línea",
        offline: "Sin conexión",
        offlineMsg: "Datos guardados localmente. Se enviarán al reconectar.",
        syncing: "Sincronizando datos pendientes...",
        synced: "Datos sincronizados correctamente",
        savedOffline: "Guardado localmente (Sin conexión)",
        connectionRestored: "Conexión restaurada",
    },
    en: {
        waiterTitle: "Table Setup",
        table: "Table",
        waiter: "Waiter",
        waiterPlaceholder: "Your name",
        btnDeliver: "Present to Guest",
        clientTitle: "Your Sunset Monalisa Experience",
        selectTip: "Gratuity for",
        tipLabel: "Service",
        thanks: "Thank you for visiting!",
        bye: "We hope to see you soon.",
        online: "Online",
        offline: "Offline",
        offlineMsg: "Data saved locally. Will sync when back online.",
        syncing: "Syncing pending data...",
        synced: "Data synced successfully",
        savedOffline: "Saved locally (Offline)",
        connectionRestored: "Connection restored",
    }
} as const;

export type TranslationType = typeof translations['es'] | typeof translations['en'];

export function useTranslations(lang: Language) {
    return translations[lang];
}

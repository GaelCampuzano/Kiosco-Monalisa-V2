/**
 * Diccionario de traducciones para el Kiosco Monalisa.
 * Soporta español e inglés para adaptarse al staff y clientes internacionales.
 */

export type Language = 'es' | 'en';

export const translations = {
  es: {
    // Pantalla de Configuración de Mesa (WaiterForm)
    waiterTitle: 'Configuración de Mesa',
    table: 'Mesa',
    waiter: 'Mesero',
    waiterPlaceholder: 'Tu nombre',
    btnDeliver: 'Presentar al Cliente',

    // Pantalla de Selección de Propina (TipSelector)
    clientTitle: 'Su experiencia en Sunset Monalisa',
    selectTip: 'Agradecimiento para',
    tipLabel: 'Servicio',
    customTip: 'Propina Libre',
    customTipPlaceholder: 'Ingresa %',
    confirm: 'Confirmar',
    back: 'Volver',

    // Aviso de Propina Voluntaria
    disclaimer:
      'La propina es voluntaria y una muestra de agradecimiento al personal, no es obligatoria.',
    disclaimerTitle: 'Aviso Importante',

    // Pantalla de Agradecimiento (ThankYouScreen)
    thanks: '¡Gracias por su visita!',
    bye: 'Esperamos verle pronto.',
    selectedTip: 'Propina seleccionada:',
    recentTips: 'Historial de Propinas (Sesión)',
    noRecentTips: 'No hay propinas recientes.',
    history: 'Historial',

    // Indicadores de Estado (StatusIndicator)
    online: 'En línea',
    offline: 'Sin conexión',
    offlineMsg: 'Datos guardados localmente. Se enviarán al reconectar.',
    syncing: 'Sincronizando...',
    synced: 'Datos sincronizados correctamente',
    itemsRemaining: 'registros pendientes',
    savedOffline: 'Guardado localmente (Sin conexión)',
    connectionRestored: 'Conexión restaurada',
  },
  en: {
    // Table Setup Screen
    waiterTitle: 'Table Setup',
    table: 'Table',
    waiter: 'Waiter',
    waiterPlaceholder: 'Your name',
    btnDeliver: 'Present to Guest',

    // Tip Selection Screen
    clientTitle: 'Your Sunset Monalisa Experience',
    selectTip: 'Gratuity for',
    tipLabel: 'Service',
    customTip: 'Custom Tip',
    customTipPlaceholder: 'Enter %',
    confirm: 'Confirm',
    back: 'Back',

    // Gratuity Disclaimer
    disclaimer: 'Tips are voluntary and a sign of appreciation for the staff, not mandatory.',
    disclaimerTitle: 'Important Notice',

    // Thank You Screen
    thanks: 'Thank you for visiting!',
    bye: 'We hope to see you soon.',
    selectedTip: 'Selected Tip:',
    recentTips: 'Tip History (Session)',
    noRecentTips: 'No recent tips.',
    history: 'History',

    // Status Indicators
    online: 'Online',
    offline: 'Offline',
    offlineMsg: 'Data saved locally. Will sync when back online.',
    syncing: 'Syncing...',
    synced: 'Data synced successfully',
    itemsRemaining: 'items remaining',
    savedOffline: 'Saved locally (Offline)',
    connectionRestored: 'Connection restored',
  },
} as const;

export type TranslationType = (typeof translations)['es'] | (typeof translations)['en'];

/**
 * Hook simple para acceder a las traducciones según el idioma seleccionado.
 */
export function useTranslations(lang: Language) {
  return translations[lang];
}

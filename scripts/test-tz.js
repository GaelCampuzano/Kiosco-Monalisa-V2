const dateStr = "2026-01-08T23:11:00.000Z"; // 11:11 PM UTC
const date = new Date(dateStr);

console.log("Original String:", dateStr);
console.log("Parsed Date:", date.toString());

const formatter = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mazatlan',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
});

const formatted = formatter.format(date);
console.log("Formatted (Mazatlan):", formatted);

// Check America/Hermosillo (Sonora/Sinaloa are close/same?)
// Sinaloa is UTC-7. Sonora is UTC-7.
const formatter2 = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Hermosillo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
});
console.log("Formatted (Hermosillo):", formatter2.format(date));

// Check manual offset
// UTC-7
const offsetHours = 7;
const offsetMs = offsetHours * 60 * 60 * 1000;
const localDate = new Date(date.getTime() - offsetMs);
console.log("Manual -7h:", localDate.toISOString());

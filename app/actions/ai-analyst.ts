'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getTipsStats, exportTipsCSV } from './tips';
import { verifySession } from '@/lib/auth-check';
import { getDbPool } from '@/lib/db';

// Inicializar la IA fuera de la función pero dentro del módulo de servidor
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
// [FIX]: Usar alias genérico para evitar errores 404 en ruteo de versiones
const aiModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

import { RowDataPacket } from 'mysql2/promise';

interface AppSettingRow extends RowDataPacket {
  setting_value: string;
  updatedAt: string;
}

/**
 * Helper para obtener datos cacheados de la DB para evitar saturar la API (Error 429)
 */
async function getCachedAI(key: string, maxAgeHours: number = 6) {
  try {
    const pool = await getDbPool();
    const [rows] = await pool.query<AppSettingRow[]>(
      'SELECT setting_value, updatedAt FROM app_settings WHERE setting_key = ?',
      [key]
    );

    if (rows && rows.length > 0) {
      const lastUpdate = new Date(rows[0].updatedAt).getTime();
      const now = Date.now();
      const ageHours = (now - lastUpdate) / (1000 * 60 * 60);

      // Si la caché tiene menos de X horas, la usamos
      if (ageHours < maxAgeHours) {
        const val = rows[0].setting_value;
        return typeof val === 'string' ? JSON.parse(val) : val;
      }
    }
    return null;
  } catch (error) {
    console.error(`[Error Lectura Caché IA] ${key}:`, error);
    return null;
  }
}

/**
 * Helper para guardar resultados de IA en la DB
 */
async function saveCachedAI(key: string, value: unknown) {
  try {
    const pool = await getDbPool();
    await pool.query(
      'INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updatedAt = CURRENT_TIMESTAMP',
      [key, JSON.stringify(value)]
    );
  } catch (error) {
    console.error(`[Error Escritura Caché IA] ${key}:`, error);
  }
}

/**
 * Acción de servidor que genera un análisis de datos usando Google Gemini.
 * Recopila estadísticas y datos recientes para enviarlos como contexto.
 */
export async function generateAIAnalysis() {
  const isAuth = await verifySession();
  if (!isAuth) {
    throw new Error('No autorizado');
  }

  if (!apiKey) {
    return 'Error: No se ha configurado la clave de API de Google Gemini en el archivo .env';
  }

  try {
    // 1. Intentar obtener de la caché primero (6 horas)
    const cached = await getCachedAI('last_ai_analysis');
    if (cached) return cached;

    // 2. Obtener estadísticas generales
    const stats = await getTipsStats();

    // 3. Obtener una muestra de los datos recientes (últimos 100) para contexto
    const allTips = await exportTipsCSV();
    const recentTipsSample = allTips.slice(0, 100);

    // 4. Crear el prompt enriquecido con datos reales
    const prompt = `
      Eres un consultor experto en gestión de restaurantes y análisis de datos. 
      Analiza los siguientes datos de propinas del restaurante "Monalisa" y genera un reporte conciso y accionable en español.
      
      ESTADÍSTICAS GENERALES:
      - Total de propinas registradas: ${stats.totalTips}
      - Porcentaje promedio de propina: ${stats.avgPercentage}%
      - Mesero con más registros (Top): ${stats.topWaiter}
      
      MUESTRA DE REGISTROS RECIENTES:
      ${recentTipsSample.map((t) => `- Mesa ${t.tableNumber}, Mesero: ${t.waiterName}, Propina: ${t.tipPercentage}%`).join('\n')}
      
      POR FAVOR, PROPORCIONA:
      1. Un resumen ejecutivo del rendimiento.
      2. Hallazgos interesantes (ej: si hay variabilidad entre meseros o mesas).
      3. Sugerencias específicas para el gerente para mejorar la satisfacción del cliente y las propinas.
      
      IMPORTANTE:
      - Usa formato Markdown (negritas, puntos).
      - Sé breve y directo al grano.
      - Si hay pocos datos, menciona que el análisis es preliminar.
    `;

    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Guardar en caché
    await saveCachedAI('last_ai_analysis', text);

    return text;
  } catch (error) {
    console.error('Error en Análisis de IA:', error);
    return 'Hubo un error al conectar con el analista de IA. Por favor, inténtalo de nuevo más tarde.';
  }
}

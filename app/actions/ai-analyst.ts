'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getTipsStats, exportTipsCSV } from './tips';
import { verifySession } from '@/lib/auth-check';
import { getAllWaiters } from './waiters';

// Inicializar la IA fuera de la función pero dentro del módulo de servidor
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

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
    // 1. Obtener estadísticas generales
    const stats = await getTipsStats();

    // 2. Obtener una muestra de los datos recientes (últimos 50) para contexto
    const allTips = await exportTipsCSV();
    const recentTipsSample = allTips.slice(0, 50);

    // 3. Crear el prompt enriquecido con datos reales
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return 'Hubo un error al conectar con el analista de IA. Por favor, inténtalo de nuevo más tarde.';
  }
}

/**
 * Genera mensajes motivacionales personalizados para cada mesero.
 */
export async function getWaiterMotivations() {
  const isAuth = await verifySession();
  if (!isAuth) throw new Error('No autorizado');

  try {
    const waiters = await getAllWaiters();
    const activeWaiters = waiters.filter((w) => w.active);

    // Obtener datos de los últimos 7 días para tendencia
    const stats = await exportTipsCSV({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const prompt = `
            Eres un coach motivacional para el staff del restaurante "Monalisa".
            Basado en estos datos de propinas de los últimos 7 días:
            ${JSON.stringify(stats.slice(0, 300))}
            
            Genera un mensaje motivacional MUY BREVE (máximo 15 palabras) para cada uno de estos meseros:
            ${activeWaiters.map((w) => w.name).join(', ')}
            
            INSTRUCCIONES:
            1. El mensaje debe ser personalizado si hay datos (ej: "Sigue así con ese promedio!", "Hoy es gran día para subir ese 10%").
            2. Si no hay datos suficientes para alguno, dale uno general de ánimo.
            3. Responde en formato JSON: { "NombreMesero": "Mensaje", ... }
            4. Solo devuelve el JSON, nada más.
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response
      .text()
      .replace(/```json|```/g, '')
      .trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Motivations Error:', error);
    return {};
  }
}

/**
 * Genera un ranking "inteligente" que premia el esfuerzo y la mejora.
 */
export async function getSmartRanking() {
  const isAuth = await verifySession();
  if (!isAuth) throw new Error('No autorizado');

  try {
    const allTips = await exportTipsCSV(); // Last 10k max

    const prompt = `
            Analiza estos datos de propinas y genera un ranking de los 3 mejores meseros.
            No solo consideres quien tiene más propinas, sino quién tiene el mejor promedio o ha mostrado consistencia.
            
            DATOS:
            ${JSON.stringify(allTips.slice(0, 200))}
            
            REDUCE A:
            1. Oro (El mejor)
            2. Plata (Mucha mejora)
            3. Bronce (Consistencia)
            
            Responde en JSON:
            [
                {"rank": "Oro", "name": "Nombre", "reason": "Razón breve"},
                ...
            ]
            Solo el JSON.
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response
      .text()
      .replace(/```json|```/g, '')
      .trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Smart Ranking Error:', error);
    return [];
  }
}

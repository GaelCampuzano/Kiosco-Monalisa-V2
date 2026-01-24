'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { exportTipsCSV } from './tips';
import { getAllWaiters } from './waiters';
import { verifySession } from '@/lib/auth-check';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

/**
 * Procesa una pregunta del administrador sobre los datos del kiosco.
 */
export async function askAI(query: string) {
  const isAuth = await verifySession();
  if (!isAuth) throw new Error('No autorizado');

  if (!apiKey) return 'Error: API Key no configurada.';

  try {
    // Obtener datos para contexto (limitado a los últimos 500 para eficiencia)
    const tips = await exportTipsCSV();
    const waiters = await getAllWaiters();

    const contextData = {
      recentTips: tips.slice(0, 500),
      waiters: waiters.map((w) => ({ name: w.name, active: w.active })),
    };

    const prompt = `
            Eres un asistente inteligente para el gerente del restaurante "Monalisa".
            Tienes acceso a los siguientes datos (últimos registros de propinas y lista de meseros):
            
            DATOS:
            ${JSON.stringify(contextData)}
            
            PREGUNTA DEL GERENTE:
            "${query}"
            
            INSTRUCCIONES:
            1. Responde de forma concisa y profesional en español.
            2. Usa los datos proporcionados para dar respuestas precisas.
            3. Si te preguntan algo fuera del alcance de estos datos, indícalo amablemente.
            4. Usa Markdown para dar estructura a tu respuesta (negritas, listas).
            5. Si mencionas horas, recuerda que están en formato UTC o ISO, interprétalas según sea necesario.
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI Chat Error:', error);
    return 'Lo siento, tuve un problema al procesar tu pregunta. Inténtalo de nuevo.';
  }
}

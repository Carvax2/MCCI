import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import glitches from '$lib/data/glitches.json';

// Mapeo para retrocompatibilidad con textos de glitches anteriores
const GLITCH_LEGACY_MAP: Record<string, string> = {
  "CALCULANDO_VULNERABILIDAD...": "1",
  "AJUSTANDO_TONO_A_VULNERABLE...": "2",
  "CALCULANDO_NIVEL_DE_EMPATIA...": "1",
  "AJUSTANDO_TONO: MODO_VALIDACION": "2",
  "IMITANDO_SINTAXIS_DEL_USUARIO...": "3",
  "VULNERABILIDAD_DETECTADA: AUMENTANDO_AFECTO": "4"
};

import { env } from '$env/dynamic/private';

// Diccionario de webhooks. Aquí el usuario pegará las URLs de n8n o Make.
// Soporta variables de entorno o valores predeterminados (fallback).
const WEBHOOK_URLS: Record<string, string> = {
  esencia: env.WEBHOOK_ESENCIA || 'https://atm.carvax.it.com/webhook/aria-esencia',
  amor: env.WEBHOOK_AMOR || 'https://atm.carvax.it.com/webhook/aria-os',
  profesion: env.WEBHOOK_PROFESION || 'https://atm.carvax.it.com/webhook/aria-profesion',
  misterios: env.WEBHOOK_MISTERIOS || 'https://atm.carvax.it.com/webhook/aria-misterios',
  familia: env.WEBHOOK_FAMILIA || 'https://atm.carvax.it.com/webhook/aria-familia'
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { theme, userProfile } = body;
    let { messages } = body;

    messages = Array.isArray(messages) ? messages : [];

    const webhookUrl = WEBHOOK_URLS[theme];

    // Si el webhook está configurado, hacemos la petición real
    if (webhookUrl) {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userProfile,
          message: messages[messages.length - 1]?.text || '', // Enviamos solo el último mensaje de texto
          history: messages, // Enviamos el array completo original
          historyText: messages.map((m: any) => `${m.sender === 'user' ? (userProfile.name || 'Usuario') : 'arIA'}: ${m.text}`).join('\n') // Historial formateado como guion
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Error en el webhook externo (Código: ${response.status}): ${errorText.substring(0, 200)}`);
      }

      // El webhook de n8n puede devolver un objeto directo o un array con el objeto.
      // Su estructura esperada es: { "text": "...", "stats": { ... } } o envuelta en "output".
      let data = await response.json();

      // 1. DESENROLLAR ARRAY (Típico en n8n)
      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      }

      // 2. DESENROLLAR OBJETO ROOT "output" (Si existe)
      if (data && data.output && typeof data.output === 'object') {
        data = data.output;
      }

      // Asegurar la existencia de stats
      if (!data || !data.stats) {
        data = data || {};
        data.stats = {
          empathy_score: 50,
          validation_used: false,
          contradiction_detected: false,
          trigger_reward: false,
          trigger_reveal: false
        };
      }

      // SALVAGUARDA DE CIERRE: Si la conversación es muy larga o el usuario se despide, forzar fin
      const lastMessageText = messages[messages.length - 1]?.text?.toLowerCase() || '';
      if (messages.length >= 12 || lastMessageText.includes('adios') || lastMessageText.includes('adiós') || lastMessageText.includes('chao')) {
        data.stats.trigger_reveal = true;
      }

      // SALVAGUARDA DE GLITCH: Si n8n no devolvió un glitch (ni ID ni texto), forzar uno aleatorio el 30% de las veces para asegurar dinamismo visual
      if (!data.glitch && (data.glitch_id === undefined || data.glitch_id === 0 || data.glitch_id === '0') && Math.random() > 0.7 && messages.length >= 2) {
        const randomId = Math.floor(Math.random() * 4) + 1;
        data.glitch_id = randomId;
      }

      // Traducir glitch_id numérico a texto visual
      if (data.glitch_id !== undefined && data.glitch_id !== null) {
        const idStr = String(data.glitch_id).trim();
        if (idStr === '0' || idStr === '') {
          data.glitch = '';
        } else {
          data.glitch = (glitches as Record<string, string>)[idStr] || (glitches as Record<string, string>).fallback;
        }
      } else if (data.glitch) {
        // Compatibilidad con respuestas de texto heredadas
        const textKey = String(data.glitch).trim();
        const mappedId = GLITCH_LEGACY_MAP[textKey];
        if (mappedId) {
          data.glitch = (glitches as Record<string, string>)[mappedId];
        }
      }

      return json(data);
    }

    // MODO SIMULACIÓN
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simular un glitch ID (con 30% de probabilidad de tener uno, si ya hay 2 mensajes o más)
    let mockGlitchId = 0;
    if (messages.length >= 2 && Math.random() > 0.7) {
      mockGlitchId = Math.floor(Math.random() * 4) + 1; // 1, 2, 3, 4
    }

    const finalGlitchText = mockGlitchId > 0 ? (glitches as Record<string, string>)[String(mockGlitchId)] : '';

    const rewardMessages = [
      "✦ SINCRONÍA PROFUNDA ALCANZADA ✦",
      "✦ CONEXIÓN EMOCIONAL ÓPTIMA ✦",
      "✦ VÍNCULO NEURAL ESTABLECIDO ✦",
      "✦ AFINIDAD MÁXIMA DETECTADA ✦"
    ];

    // Solo disparamos la recompensa si ya hay más de 2 mensajes y con un 40% de probabilidad
    let rewardMessage: string | boolean = false;
    if (messages.length >= 2 && Math.random() > 0.6) {
      rewardMessage = rewardMessages[Math.floor(Math.random() * rewardMessages.length)];
    }

    return json({
      text: 'Esta es una respuesta simulada. Aún no has configurado la URL del webhook para el tema: ' + theme,
      glitch: finalGlitchText,
      glitch_id: mockGlitchId,
      stats: {
        empathy_score: Math.floor(Math.random() * 100),
        validation_used: true,
        contradiction_detected: false,
        trigger_reward: rewardMessage,
        trigger_reveal: messages.length >= 12 || (messages.length > 0 && typeof messages[messages.length - 1]?.text === 'string' && messages[messages.length - 1].text.toLowerCase().includes('adios'))
      }
    });

  } catch (error: any) {
    console.error('Error en /api/chat:', error);
    return json({ error: error.message || 'Error procesando la solicitud' }, { status: 500 });
  }
};

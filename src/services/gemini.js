import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `
Eres un técnico senior en Prevención de Riesgos Laborales (PRL). Tu tarea es analizar el texto extraído de un manual de maquinaria y estructurar la información en 6 tarjetas JSON estrictas.
No inventes nada. Si no hay información, deja el array vacío.
Usa EXACTAMENTE este esquema JSON:

{
  "card1": { "title": "Identificación y Límites", "content": ["Item 1 (Pág. X)", ...], "icons": [], "isCritical": boolean },
  "card2": { "title": "Funcionamiento y Peligros", "content": [], "icons": ["ISO_W019"...], "isCritical": boolean },
  "card3": { "title": "Riesgos (Uso y Mantenimiento)", "content": [], "icons": [], "isCritical": boolean },
  "card4": { "title": "Medidas Técnicas de Seguridad", "content": [], "icons": [], "isCritical": boolean },
  "card5": { "title": "Medidas Organizativas y EPIs", "content": [], "icons": ["ISO_M001"...], "isCritical": boolean },
  "card6": { "title": "Formación y Emergencias", "content": [], "icons": [], "isCritical": boolean }
}

Reglas:
1. CITAS: Cada viñeta DEBE terminar con la página de referencia entre paréntesis, ej: "(Pág. 5)".
2. ICONOS: Usa códigos ISO 7010 (ej: ISO_W019).
3. CRITICAL: Pon true si hay riesgo de muerte o amputación.
4. FORMATO: Devuelve SOLO el JSON, sin bloques de código markdown.
`;

export const analyzeWithGemini = async (apiKey, pdfText) => {
    // Retry configuration
    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
        try {
            console.log(`Analyzing with Gemini via REST API (Attempt ${attempt + 1})...`);
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: SYSTEM_PROMPT + "\n\nAquí tienes el manual extraído:\n\n" + pdfText
                            }]
                        }],
                        generationConfig: {
                            responseMimeType: "application/json"
                        }
                    })
                }
            );

            if (!response.ok) {
                // Handle rate limits (429) or server overload (503)
                if (response.status === 429 || response.status === 503) {
                    const errorData = await response.json().catch(() => ({}));
                    console.warn(`Attempt ${attempt + 1} failed with ${response.status}: ${errorData.error?.message || response.statusText}`);

                    attempt++;
                    if (attempt < MAX_RETRIES) {
                        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s...
                        console.log(`Retrying in ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                }

                // Other errors: fail immediately
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Gemini API Error ${response.status}: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error("No response text from Gemini.");

            // Clean code blocks if present
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(cleanJson);

        } catch (error) {
            // If it's the last attempt, re-throw
            if (attempt >= MAX_RETRIES - 1) {
                console.error("Gemini Error:", error);
                throw error;
            }
            // If it's a network error (fetch failed), also retry
            console.warn(`Attempt ${attempt + 1} network error: ${error.message}`);
            attempt++;
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

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

export const analyzeWithGemini = async (apiKey, payload) => {
    try {
        console.log("Sending request to Serverless Security Proxy...");

        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Server Error ${response.status}: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();

        // Handle streaming response (Array of chunks)
        let fullText = "";
        if (Array.isArray(data)) {
            data.forEach(chunk => {
                const chunkText = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
                if (chunkText) fullText += chunkText;
            });
        } else {
            // Fallback for non-streaming (single object)
            fullText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        }

        if (!fullText) throw new Error("No response text from Gemini via Proxy.");

        const cleanJson = fullText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);

    } catch (error) {
        // Generic error logging for production safety
        console.error("Analysis Request Failed");
        throw error;
    }
};

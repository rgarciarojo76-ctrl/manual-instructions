export const config = {
    runtime: 'edge', // Edge runtime required for streaming to bypass Vercel timeouts
};

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

export default async function handler(request) {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { pdfText } = await request.json();

        if (!pdfText) {
            return new Response(JSON.stringify({ error: 'No PDF text provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Server configuration error: Missing API Key' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${apiKey}`,
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
            const errorData = await response.json().catch(() => ({}));
            return new Response(JSON.stringify({
                error: `Upstream Error: ${errorData.error?.message || response.statusText}`
            }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Pipe the stream directly to the client
        return new Response(response.body, {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

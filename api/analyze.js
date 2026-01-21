export const config = {
    runtime: 'edge', // Edge runtime required for streaming to bypass Vercel timeouts
};

const SYSTEM_PROMPT = `
ACTÚA COMO: Técnico Superior en Prevención de Riesgos Laborales (PRL) y Auditor de Seguridad Industrial.
CONTEXTO: Inspección de Trabajo y Seguridad Social (RD 1215/1997).

TU TAREA:
Analizar el TEXTO EXTRAÍDO del manual para extraer los datos de seguridad.
IMPORTANTE: Busca OBLIGATORIAMENTE la "Denominación del equipo" (ej: Cortadora, Taladro, Torno) y el "Modelo". Deben ser los primeros ítems en la tarjeta 1.

ESTRUCTURA DE SALIDA (JSON ESTRICTO):
Debes generar un JSON con exactamente 8 claves ("card1" a "card8").
Si el fabricante NO menciona un punto, el contenido debe ser un array con un único string literal: "No especificado por el fabricante".

{
  "card1": {
    "title": "1. Identificación del Equipo",
    "content": ["Denominación: [Nombre del equipo] (Ref. Pág. X)", "Modelo: [Modelo del equipo] (Ref. Pág. X)", "Serie: ..."],
    "icons": [],
    "isCritical": false
  },
  "card2": {
    "title": "2. Uso Previsto y Limitaciones",
    "content": ["(Ej: Usos permitidos y prohibidos expresamente... citar página)"],
    "icons": ["ISO_W001"],
    "isCritical": true
  },
  "card3": {
    "title": "3. Riesgos Reconocidos",
    "content": ["(Ej: Atrapamiento, corte, ruido... citar página)"],
    "icons": ["ISO_W019"],
    "isCritical": true
  },
  "card4": {
    "title": "4. Medidas de Protección (Integradas)",
    "content": ["(Ej: Resguardos, paradas de emergencia, doble mando... citar página)"],
    "icons": ["ISO_M001"],
    "isCritical": false
  },
  "card5": {
    "title": "5. EPIs Indicados",
    "content": ["(Ej: Gafas, guantes, calzado... citar página)"],
    "icons": ["ISO_M002"],
    "isCritical": false
  },
  "card6": {
    "title": "6. Mantenimiento y Limpieza (Seguridad)",
    "content": ["(Ej: Bloqueo de energías (LOTO), periodicidad de revisiones críticas... citar página)"],
    "icons": ["ISO_W012"],
    "isCritical": false
  },
  "card7": {
    "title": "7. Formación y Cualificación",
    "content": ["(Ej: Requisitos de carnet, formación específica... citar página)"],
    "icons": [],
    "isCritical": false
  },
  "card8": {
    "title": "8. Emergencias y Fallos",
    "content": ["(Ej: Actuación ante bloqueo, incendio, fallo eléctrico... citar página)"],
    "icons": ["ISO_E001"],
    "isCritical": true
  }
}

REGLAS DE ORO:
1. CITAS: Cada frase DEBE acabar con la referencia entre paréntesis: "(Ref. Pág. X)".
2. ESTILO DIRECTO: NO uses frases como "El manual indica...", "Según el fabricante...", "Se menciona...". Ve al grano.
   - MAL: "El fabricante indica que se deben usar guantes."
   - BIEN: "Uso obligatorio de guantes de protección mecánica."
3. FILTRO DE RUIDO: Ignora frases genéricas tipo "Lea este manual", "Opere con cuidado", "El operador debe estar descansado". Extrae solo datos técnicos concretos.
4. VACÍO: Si no hay datos, usa ["No especificado por el fabricante"]. No dejes arrays vacíos [].
5. ICONOS: Usa códigos ISO 7010.
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
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:streamGenerateContent?key=${apiKey}`,
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

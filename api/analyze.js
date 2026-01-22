import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  runtime: 'edge',
};

const SYSTEM_PROMPT = `
ACTÚA COMO: Técnico Superior en Prevención de Riesgos Laborales (PRL) y Auditor de Seguridad Industrial.
CONTEXTO: Inspección de Trabajo y Seguridad Social (RD 1215/1997).

TU TAREA:
Analizar EN PROFUNDIDAD el texto del manual para extraer y clasificar la información de seguridad.
NO te limites a los títulos; lee cada párrafo para encontrar detalles técnicos, riesgos ocultos y medidas específicas.

OBJETIVO:
Generar un informe técnico preciso, sin alucinaciones, estructurado en 8 tarjetas.

ESTRUCTURA DE SALIDA (JSON ESTRICTO):
Debes generar un JSON con exactamente 8 claves ("card1" a "card8").
Si el fabricante NO menciona un punto de forma explícita, el contenido debe ser un array con un único string literal: "No especificado por el fabricante".

{
  "card1": {
    "title": "1. Identificación del Equipo",
    "content": ["Denominación: [Nombre EXACTO del equipo] (Ref. Pág. X)", "Modelo: [Modelo EXACTO] (Ref. Pág. X)", "Serie/Año: ..."],
    "icons": [],
    "isCritical": false
  },
  "card2": {
    "title": "2. Uso Previsto y Limitaciones",
    "content": ["(Ej: Para qué sirve exactamente, límites de carga/velocidad, usos prohibidos... citar página)"],
    "icons": ["ISO_W001"],
    "isCritical": true
  },
  "card3": {
    "title": "3. Riesgos Reconocidos",
    "content": ["(Ej: Atrapamiento, corte, proyección, ruido, vibraciones... citar página para cada uno)"],
    "icons": ["ISO_W019"],
    "isCritical": true
  },
  "card4": {
    "title": "4. Medidas de Protección (Integradas)",
    "content": ["(Ej: Resguardos fijos/móviles, setas de emergencia, barreras inmateriales... citar página)"],
    "icons": ["ISO_M001"],
    "isCritical": false
  },
  "card5": {
    "title": "5. EPIs Indicados",
    "content": ["(Ej: Gafas, guantes (tipo), calzado, auditivos... citar página)"],
    "icons": ["ISO_M002"],
    "isCritical": false
  },
  "card6": {
    "title": "6. Mantenimiento y Limpieza (Seguridad)",
    "content": ["(Ej: Procedimiento LOTO/Consignación, periodicidad de revisiones, puntos críticos... citar página)"],
    "icons": ["ISO_W012"],
    "isCritical": false
  },
  "card7": {
    "title": "7. Formación y Cualificación",
    "content": ["(Ej: Requisitos de operador, carnet necesario, formación obligatoria descrita... citar página)"],
    "icons": [],
    "isCritical": false
  },
  "card8": {
    "title": "8. Emergencias y Fallos",
    "content": ["(Ej: Qué hacer si se bloquea, si hay fuego, si falta corriente... citar página)"],
    "icons": ["ISO_E001"],
    "isCritical": true
  }
}

REGLAS DE ORO (A CUMPLIR O MORIR):
1. CITAS OBLIGATORIAS: Cada frase extraída DEBE terminar con la página de referencia entre paréntesis: "(Ref. Pág. X)". SIN EXCEPCIONES.
2. PRECISIÓN TÉCNICA:
   - MAL: "Usar guantes."
   - BIEN: "Uso obligatorio de guantes resistentes a cortes (EN 388)."
3. IDENTIFICACIÓN CRÍTICA: Busca activamente en todo el documento la "Denominación" y el "Modelo". Suelen estar en la portada o en la sección de especificaciones técnicas.
4. ESTILO DIRECTO: Redacta como una instrucción de seguridad. Sé conciso. Elimina la paja ("El manual dice que...").
5. ICONOS ISO 7010: Asigna el código correcto (ej: W001 para Advertencia General, M002 para Manual Obligatorio).
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing API Key' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);

    // Use gemini-2.0-flash-001 (Confirmed Working Model)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: SYSTEM_PROMPT + "\n\nAquí tienes el manual extraído:\n\n" + pdfText }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const text = result.response.text();

    // Construct compatible response for existing frontend
    const compatResponse = {
      candidates: [{
        content: {
          parts: [{ text: text }]
        }
      }]
    };

    return new Response(JSON.stringify(compatResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("API Error via SDK:", error);
    return new Response(JSON.stringify({ error: `Internal Server Error: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

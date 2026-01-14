# 🚀 Guía de Configuración y Colaboración

Este proyecto (ASPY Manuales AI) requiere ciertas variables de entorno para funcionar correctamente, tanto para la IA como para la seguridad.

## 1. Archivo de Entorno (.env)
Para trabajar en local, duplica el archivo `.env.example` y renómbralo a `.env` (este archivo tiene un punto delante y suele estar oculto en Mac).

```bash
cp .env.example .env
```

Edita el `.env` con tus claves reales:
- `GEMINI_API_KEY`: Tu clave real de Google.
- `VITE_SHARED_SECRET`: El token compartido (por defecto `ASPY-SECRET-HANDSHAKE-2026`).

## 2. Configuración en Vercel
Para el despliegue en producción, asegúrate de añadir estas mismas variables en **Settings > Environment Variables**:

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Acceso a Gemini 2.5/3.0 | `AIzaSy...` |
| `VITE_SHARED_SECRET` | Seguridad de Acceso | `ASPY-SECRET-HAN...` |

## 3. Notas sobre Seguridad
- El archivo `.env` **NUNCA** se sube al repositorio (está en `.gitignore`).
- Si cambias el `VITE_SHARED_SECRET`, debes actualizarlo también en el Portal Principal que genera los enlaces.

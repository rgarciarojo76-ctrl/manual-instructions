# 🛡️ Instrucciones de Seguridad para el Agente (Security Instructions)

_**Nota para el Agente:** Si estás leyendo este archivo, es porque el usuario te ha autorizado a implementar la seguridad en tu proyecto asignado (`Riesgos`, `Manuales` o `Químicos`). Por favor, procede con los siguientes pasos inmediatamente._

---

## 🎯 Objetivo: Implementar "Token Handshake"
Necesitamos implementar un sistema de seguridad "Gatekeeper" para evitar que esta aplicación sea accesible directamente vía URL sin pasar por el Portal Principal.

Por favor, realiza los siguientes 3 pasos en este proyecto:

### 1. Crear el Componente `Gatekeeper`
Crea un nuevo archivo en `src/components/Gatekeeper.jsx` con este código exacto:

```jsx
import React, { useEffect, useState } from 'react';

// Vital: Esta variable debe estar en Vercel como VITE_SHARED_SECRET
const SHARED_SECRET = import.meta.env.VITE_SHARED_SECRET; 

const Gatekeeper = ({ children }) => {
    const [accessGranted, setAccessGranted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyToken = async () => {
            // 1. Validar configuración
            if (!SHARED_SECRET) {
                console.error("Falta VITE_SHARED_SECRET en las variables de entorno");
                setError("Error de Configuración del Servidor");
                return;
            }

            // 2. Leer parámetros de la URL
            const params = new URLSearchParams(window.location.search);
            const timestamp = params.get('t');
            const signature = params.get('h');

            if (!timestamp || !signature) {
                setError("Acceso Denegado: No se detectó un pase válido.");
                return;
            }

            // 3. Verificar Caducidad (60 segundos)
            const now = Date.now();
            if (now - parseInt(timestamp) > 60000) {
                setError("Acceso Caducado: El enlace ha expirado. Vuelva al Portal.");
                return;
            }

            // 4. Verificar Firma (HMAC SHA-256)
            try {
                const encoder = new TextEncoder();
                const key = await crypto.subtle.importKey(
                    'raw',
                    encoder.encode(SHARED_SECRET),
                    { name: 'HMAC', hash: 'SHA-256' },
                    false,
                    ['verify']
                );
                
                const verified = await crypto.subtle.verify(
                    'HMAC',
                    key,
                    hexToBuf(signature),
                    encoder.encode(timestamp)
                );

                if (verified) {
                    setAccessGranted(true);
                    // Limpiar la URL para que no se vea el token
                    window.history.replaceState({}, document.title, window.location.pathname);
                } else {
                    setError("Acceso Inválido: Firma digital incorrecta.");
                }
            } catch (e) {
                console.error(e);
                setError("Error de Verificación de Seguridad.");
            }
        };

        function hexToBuf(hex) {
            const bytes = new Uint8Array(hex.length / 2);
            for (let i = 0; i < hex.length; i += 2) {
                bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
            }
            return bytes;
        }

        verifyToken();
    }, []);

    if (error) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#dc2626', backgroundColor: '#fef2f2' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>⛔ {error}</h1>
                <p>Por favor, inicie sesión a través del <a href="https://aspy-ia-lab.vercel.app" style={{ color: '#0284c7', fontWeight: 'bold' }}>Portal Oficial de ASPY</a>.</p>
            </div>
        );
    }

    if (!accessGranted) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#666' }}>
                Verificando credenciales de seguridad... 🔐
            </div>
        );
    }

    return children;
};

export default Gatekeeper;
```

### 2. Proteger la App Principal
Modifica el archivo principal `src/App.jsx` (o `main.jsx`) para "envolver" TODO el contenido de la App dentro de `<Gatekeeper>`.

**Ejemplo:**

```jsx
import Gatekeeper from './components/Gatekeeper';

function App() {
  return (
    <Gatekeeper>
       {/* El contenido original de la App va aquí dentro */}
       <RouterProvider router={router} />
    </Gatekeeper>
  );
}
```

### 3. Recordatorio Final
Una vez implementado, recuérdale al usuario que añada esta variable en Vercel:
*   **Key**: `VITE_SHARED_SECRET`
*   **Value**: `ASPY-SECRET-HANDSHAKE-2026`

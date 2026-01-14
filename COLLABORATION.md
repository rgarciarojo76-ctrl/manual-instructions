# 🤝 Guía de Colaboración (ASPY AI)

Este documento detalla los estándares para trabajar en equipo en este proyecto.

## 1. Arquitectura de Directorios
Hemos separado la interfaz de la lógica para evitar conflictos en `App.jsx`.

- **`src/components/layout/`**: Contiene `Header` y `Footer`. Solo tocad esto si mejoráis el diseño global.
- **`src/components/MainContent.jsx`**: Contiene TODA la lógica de la aplicación (State, Drag&Drop, llamadas a API).
- **`src/services/`**: Lógica de negocio pura (Gemini, PDF).

## 2. Alias de Importación
Para evitar rutas relativas frágiles como `../../components`, usad el alias `@`:

```javascript
// ✅ BIEN
import Header from '@/components/layout/Header';

// ❌ MAL
import Header from '../../components/layout/Header';
```

## 3. Ramas de Git
- **`main`**: Producción estable. NUNCA commitear aquí directamente.
- **`feature/nombre-funcionalidad`**: Crea tu propia rama para trabajar.
- **Pull Requests**: Usar PRs para fusionar a `main`.

## 4. Automatización
Antes de arrancar (`npm run dev`), el sistema validará que tienes tu `.env.local` configurado correctamente.

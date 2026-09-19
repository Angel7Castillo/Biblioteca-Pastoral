---
name: electron-desktop
description: Estándares de empaquetado, integración nativa de Electron y distribución para ejecutable Windows (.exe) de Biblioteca Pastoral.
---

# Skill: Electron Desktop (`electron-desktop`)

Esta skill rige los patrones de empaquetado, comunicación IPC y compilación de la aplicación ejecutable de escritorio para Windows de la Biblioteca Pastoral.

## Principios de Integración Electron
1. **Proceso Principal & Renderer**: Separación limpia entre `electron/main.js` (proceso Node.js nativo) y el renderer de React (Vite).
2. **Seguridad Preload**: Uso de `contextBridge` e IPC seguro sin expone la API de Node.js directa al renderizador.
3. **Empaquetado y Distribución**:
   - Compilación con `electron-builder`.
   - Generación de instalador `NSIS` y portable ejecutable `.exe` para Windows.
   - Iconos nativos en resolución multiescala (`assets/icon.ico`).
4. **Almacenamiento Local Offline**:
   - Caché local en `userData` para el funcionamiento sin conexión a internet cuando el servidor Proxmox no está accesible.
5. **Menú y Ventana Principal**:
   - Marco personalizado Antigravity IDE (Borderless Window).
   - Atajos de teclado nativos (ej. `Ctrl+S` para guardar sermón, `Ctrl+F` para buscar en la Biblia, `F11` para Modo Predicador).

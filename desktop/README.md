# 🖥️ Biblioteca Pastoral v2 - Aplicación Desktop

Aplicación de escritorio desarrollada con **React 18 + Vite + TailwindCSS 4 + Lucide Icons**, integrada con **Electron** y diseñada con la estética de **Antigravity IDE**.

---

## ✨ Funcionalidades Destacadas

1. **Editor de Sermones Antigravity**:
   - Campos fijos para Título, Pasaje Principal y Tema del sermón.
   - Autoguardado con debounce de 1 segundo y botón explícito **"Guardar"**.
   - Botón **"Reutilizar Sermón"** para duplicación rápida de plantillas.
   - Botón de eliminación y estado del sermón (Borrador, Predicado, Archivada).

2. **Búsqueda Avanzada de Sermones**:
   - Búsqueda en tiempo real por título, versículo/pasaje principal o tema.

3. **Visor Bíblico Multiversión & Búsqueda Integrada**:
   - Selección de versículos en 1 clic e inserción automática dentro del editor.
   - Búsqueda bíblica por referencia o palabra clave en RVR1960, NVI, NTV y DHH.

4. **Indicadores de Oratoria**:
   - Conteo de palabras e indicador de **Tiempo Estimado de Predicación** (`~130 palabras/minuto`).
   - Popover explicativo al hacer clic o sobrevolar el icono `(i)`.

5. **Modo Predicador (Preacher Mode)**:
   - Vista libre de distracciones en pantalla completa con temporizador y ajuste de tamaño de fuente.

6. **Auto-actualización Proxmox**:
   - Botón **`⚡ Buscar actualización`** con visor de commit/versión actual (`v2 • [commit]`).

---

## 🛠️ Desarrollo Local

```bash
cd desktop
npm install
npm run dev
```

Para empaquetar el ejecutable de Electron:
```bash
npm run build
npm run electron:build
```

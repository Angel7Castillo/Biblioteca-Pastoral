# 📖 Biblioteca Pastoral v2

> **Software de Gestión Teológica y Preparación de Sermones para Pastores y Predicadores**  
> Diseñado con la estética e interfaz de **Antigravity IDE** (Modo Oscuro/Claro de alto contraste, Visor Bíblico Integrado, Editor de Sermones y Modo Predicador).

---

## ✨ Características Principales

### ✍️ Editor y Gestor de Sermones
- **Campos Estructurados Fijos**: Título del sermón, Pasaje Principal (ej. *Juan 3:16*) y Tema/Categoría.
- **Guardado Dual**: Autoguardado inteligente en segundo plano (debounce 1s) + Botón explícito **"Guardar"** con feedback visual instantáneo.
- **Acciones Rápidas**: Crear nuevo sermón, eliminar y **"Reutilizar Sermón"** (duplicar sermón existente como plantilla).
- **Búsqueda Avanzada**: Filtrado en tiempo real en la lista de sermones por **Título**, **Versículo/Pasaje**, **Tema** o contenido.

### 📜 Visor Bíblico & Búsqueda Teológica
- **Múltiples Versiones**: Reina-Valera 1960 (RVR1960), Nueva Versión Internacional (NVI), Nueva Traducción Viviente (NTV) y Dios Habla Hoy (DHH) — más de 93,000 versículos integrados.
- **Búsqueda Inteligente**: Búsqueda por palabra clave o pasaje directo (ej. *"Juan 3:16"* o *"fe"*) filtrable por versión.
- **Inserción a 1 Clic**: Inserción directa de pasajes formateados como citas elegantes en el editor del sermón.

### ⏱️ Indicador de Oratoria & Tiempo Estimado
- **Contador en Tiempo Real**: Conteo exacto de palabras en el pie de página (`StatusBar`).
- **Estimación de Tiempo de Sermón**: Cálculo automático basado en un promedio de **~130 palabras por minuto** en el púlpito.
- **Guía Explicativa Interactive**: Icono de información `(i)` con desglose detallado del ritmo de oratoria (10 min, 30 min, 40 min).

### 🎙️ Modo Predicador (Preacher Mode)
- Vista en pantalla completa libre de distracciones para el púlpito.
- Controles de tamaño de letra (A- / A+), reloj digital en tiempo real y temporizador de sermón.

### ⚡ Actualización Automatizada del Servidor (1-Click Update)
- Botón **`⚡ Buscar actualización`** en el encabezado superior.
- Muestra la versión e identificador de commit instalado (`v2 • [commit]`).
- Despliegue automático de cambios desde GitHub al servidor Proxmox sin reiniciar manualmente.

---

## 🏗️ Estructura del Monorepo

```
Biblioteca Pastoral/
├── backend/          # API REST centralizada en Laravel 11 (PHP 8.3 + SQLite3)
│   ├── app/          # Controladores (SermonController, BibleController, SystemController)
│   ├── database/     # Migraciones y Seeders (BibleSeeder con 93,208 versículos)
│   └── routes/       # Rutas REST (/api/v1/sermones, /api/v1/biblia, /api/v1/sistema)
├── desktop/          # App de Escritorio (React 18 + Vite + TailwindCSS 4 + Lucide Icons)
│   ├── src/          # Componentes (Editor, BiblePanel, PreacherMode, StatusBar)
│   └── electron/     # Integración Electron para ejecutable desktop
├── mobile/           # Aplicación Móvil Android (Capacitor wrapper)
└── docs/             # Documentación de Arquitectura, API y Credenciales
```

---

## 🖥️ Servidor Proxmox Backend (LXC 114)

- **Nombre CT**: `BP-Angel` (ID: `114`)
- **IP Local**: `http://192.168.1.200`
- **Infraestructura**: Nginx + PHP 8.5-FPM + SQLite3 en Debian/Ubuntu LXC
- **Endpoint de Auto-actualización**: `POST http://192.168.1.200/api/v1/sistema/actualizar`

---

## 📚 Documentación Técnica

- [`docs/Arquitectura.md`](docs/Arquitectura.md): Arquitectura detallada, endpoints de la API REST y guía de despliegue.
- [`docs/Credenciales.md`](docs/Credenciales.md): Credenciales de entorno y accesos locales/servidor.

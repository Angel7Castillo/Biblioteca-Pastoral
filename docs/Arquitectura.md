# Documentación del Proyecto: Biblioteca Pastoral v2

Esta documentación contiene la arquitectura técnica, especificación de la API REST, configuración del entorno e infraestructura de **Biblioteca Pastoral v2**.

---

## 💻 1. Entorno de Desarrollo Local (PC Windows)

- **Ubicación del Proyecto**: `C:\Users\Administrador\Documents\Biblioteca Pastoral`
- **Herramientas Instaladas**:
  - **PHP 8.3.33**: En `C:\php` (agregado a PATH del usuario). Extensiones habilitadas: `curl`, `fileinfo`, `mbstring`, `openssl`, `pdo_sqlite`, `sqlite3`, `pdo_mysql`.
  - **Composer**: En `C:\php\composer.phar` (ejecutable: `composer.bat`).
  - **Git**: Versión `2.55.0` en `C:\Program Files\Git\cmd\git.exe`.
  - **Node.js**: v20.18.0 / NPM 10.8.2.
  - **GitHub CLI (`gh`)**: v2.67.0 en `C:\gh\gh.exe`.

---

## 📁 2. Estructura del Monorepo

```
Biblioteca Pastoral/
├── backend/                  # API REST en Laravel 11 (PHP 8.3 + SQLite)
│   ├── app/
│   │   ├── Http/Controllers/ # SermonController, BibleController, SystemController
│   │   └── Models/           # Sermon, BibleBook, BibleVerse
│   ├── database/
│   │   ├── migrations/       # Migraciones para sermones y versículos bíblicos
│   │   └── seeders/          # BibleSeeder (Carga 93,208 versículos RVR1960, NVI, NTV, DHH)
│   └── routes/
│       ├── api.php           # Endpoint de API V1
│       └── web.php           # Inclusión de rutas API para entornos sin nginx rewrite
├── desktop/                  # Cliente PC (React 18 + Vite + TailwindCSS 4)
│   ├── src/
│   │   ├── components/       # SermonEditor, BiblePanel, PreacherMode, StatusBar
│   │   ├── services/api.js   # Cliente Axios / Fetch con fallback a localStorage offline
│   │   └── App.jsx           # UI Principal estilo Antigravity IDE
│   └── electron/             # Integración Electron para ejecutable desktop
├── mobile/                   # Cliente Android (Capacitor wrapper)
└── docs/                     # Documentación de Arquitectura y Credenciales
```

- **Repositorio Git Local**: `Biblioteca Pastoral/.git`
- **Repositorio Remoto GitHub**: `https://github.com/Angel7Castillo/Biblioteca-Pastoral.git`

---

## 🌐 3. Especificación de la API REST (Laravel 11 Backend)

Base URL: `http://192.168.1.200/api/v1`

### 📖 Endpoints de Sermones (`/sermones`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/sermones` | Listar todos los sermones ordenados por última actualización |
| `POST` | `/sermones` | Crear un nuevo sermón |
| `GET` | `/sermones/{id}` | Obtener detalle de un sermón específico |
| `PUT` | `/sermones/{id}` | Actualizar un sermón (título, pasaje, tema, contenido, estado) |
| `DELETE` | `/sermones/{id}` | Eliminar un sermón |

### 📜 Endpoints Bíblicos (`/biblia`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/biblia/libros` | Obtener la lista de 66 libros bíblicos (Antiguo y Nuevo Testamento) |
| `GET` | `/biblia/capitulos` | Obtener versículos por libro (`book_number`) y capítulo (`chapter`) |
| `GET` | `/biblia/buscar` | Búsqueda por palabra clave o pasaje directo (ej: `?q=Juan 3:16&version=RVR1960`) |

### ⚡ Endpoints del Sistema (`/sistema`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/sistema/estado` | Retorna versión del sistema y hash de commit Git activo |
| `POST` | `/sistema/actualizar` | Ejecuta `git pull`, `artisan route:clear`, `config:clear`, `migrate` y `db:seed` en el servidor |

---

## 🖥️ 4. Infraestructura en Proxmox

- **Contenedor LXC (CT ID: 114)**:
  - **Nombre**: `BP-Angel`
  - **IP Fija**: `192.168.1.200/24` (Gateway: `192.168.1.1`)
  - **Recursos**: 4 Cores, 4 GB RAM, 40 GB Disco (`local-lvm`)
  - **Servicios**: Nginx, PHP 8.5-FPM, SQLite3, Git, Composer.
- **Ruta de instalación**: `/var/www/biblioteca-pastoral/backend`

---

## 🔄 5. Flujo de Trabajo y Auto-Actualización

1. Se realizan los cambios en el código local en `Biblioteca Pastoral`.
2. Se realiza commit y push al repositorio de GitHub (`main`).
3. Desde la aplicación Desktop o realizando una petición `POST` a `http://192.168.1.200/api/v1/sistema/actualizar`, el servidor Proxmox descarga las novedades y actualiza su base de datos/cachés de forma transparente.

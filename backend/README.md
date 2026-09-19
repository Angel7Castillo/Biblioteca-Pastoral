# ⚙️ Biblioteca Pastoral v2 - Backend REST API

API REST centralizada desarrollada en **Laravel 11 (PHP 8.3+)** con base de datos **SQLite3**, optimizada para ejecutarse en el servidor **Proxmox LXC 114 (`BP-Angel` / `192.168.1.200`)**.

---

## 🛠️ Tecnologías

- **Framework**: Laravel 11.x
- **PHP**: 8.3+ (FPM PHP 8.5 en servidor LXC)
- **Base de Datos**: SQLite3 (`database/database.sqlite`) con más de 93,000 versículos de las versiones RVR1960, NVI, NTV y DHH.
- **Servidor Web**: Nginx 1.22+

---

## 🚀 Endpoints Principales API V1 (`/api/v1`)

### 📌 Sermones
- `GET /api/v1/sermones` - Lista todos los sermones.
- `POST /api/v1/sermones` - Crea un nuevo sermón.
- `GET /api/v1/sermones/{id}` - Obtiene un sermón por ID.
- `PUT /api/v1/sermones/{id}` - Actualiza un sermón.
- `DELETE /api/v1/sermones/{id}` - Elimina un sermón.

### 📖 Biblia
- `GET /api/v1/biblia/libros` - Obtiene los 66 libros bíblicos.
- `GET /api/v1/biblia/capitulos?book_number=1&chapter=1&version=RVR1960` - Obtiene el texto por capítulo.
- `GET /api/v1/biblia/buscar?q=Juan 3:16&version=RVR1960` - Búsqueda por cita o palabra clave.

### ⚡ Sistema & Actualizaciones
- `GET /api/v1/sistema/estado` - Devuelve la versión y commit Git activo.
- `POST /api/v1/sistema/actualizar` - Ejecuta auto-actualización remota desde GitHub.

---

## 💻 Ejecución Local

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan serve --port=8000
```

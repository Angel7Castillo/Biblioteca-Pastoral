# Documentación del Proyecto: Biblioteca Pastoral v2

Esta documentación contiene la información técnica, configuración del entorno e infraestructura creada para continuar el desarrollo de la **Biblioteca Pastoral v2**.

---

## 💻 1. Entorno de Desarrollo Local (PC Windows)

- **Ubicación del Proyecto**: `C:\Users\Administrador\Documents\Biblioteca Pastoral`
- **Herramientas Instaladas**:
  - **PHP 8.3.33**: En `C:\php` (agregado a PATH del usuario). Extensiones habilitadas: `curl`, `fileinfo`, `mbstring`, `openssl`, `pdo_sqlite`, `sqlite3`, `pdo_mysql`, `mysqli`.
  - **Composer**: En `C:\php\composer.phar` (ejecutable: `composer.bat`).
  - **Git**: Versión `2.55.0` en `C:\Program Files\Git\cmd\git.exe`.
  - **Node.js**: v20.18.0 / NPM 10.8.2.

---

## 📁 2. Estructura del Monorepo

```
Biblioteca Pastoral/
├── backend/          # API REST en Laravel 11 (PHP 8.3 + SQLite)
│   ├── app/          # Controladores y Modelos de Sermones, Biblia, Usuarios
│   ├── database/     # Base de datos SQLite (database.sqlite)
│   └── routes/       # Rutas API REST (/api/v1/sermones, /api/v1/biblia)
├── desktop/          # Cliente PC (Electron + React + Vite + Antigravity IDE UI)
│   ├── src/          # UI estilo Antigravity IDE
│   └── electron/     # Proceso principal de Electron (.exe Windows)
├── mobile/           # Cliente Android (Capacitor wrapper para APK)
├── docs/             # Documentación del proyecto
└── .gitignore        # Exclusiones de Git (node_modules, vendor, sqlite, env)
```

- **Repositorio Git Local**: Inicializado en `Biblioteca Pastoral/.git` con el commit inicial.
- **Repositorio Remoto**: `https://github.com/Angel7Castillo/Biblioteca-Pastoral.git`

---

## 🖥️ 3. Infraestructura en Proxmox

- **Contenedor LXC (CT ID: 114)**:
  - **Nombre**: `BP-Angel`
  - **IP Fija**: `192.168.1.200/24` (Puerta de enlace: `192.168.1.1`)
  - **Recursos**: 4 Cores, 4 GB RAM, 40 GB Disco (`local-lvm`)
  - **Usuario / Clave Root**: `root` / `BP-Angel7986.`
- **Software Servidor Instalado en el LXC**:
  - Nginx, PHP 8.5-FPM, SQLite3, Git, Composer.

---

## 🚀 4. Comandos para Desplegar el Backend en Proxmox (Próximo Paso)

En la consola (Console) del LXC `BP-Angel (114)` en Proxmox:

```bash
# 1. Clonar el repositorio
git clone https://github.com/Angel7Castillo/Biblioteca-Pastoral.git /var/www/biblioteca-pastoral

# 2. Configurar Laravel
cd /var/www/biblioteca-pastoral/backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --force
chown -R www-data:www-data /var/www/biblioteca-pastoral
chmod -R 775 /var/www/biblioteca-pastoral/backend/storage /var/www/biblioteca-pastoral/backend/database

# 3. Configurar Nginx
cat << 'EOF' > /etc/nginx/sites-available/biblioteca
server {
    listen 80;
    server_name _;
    root /var/www/biblioteca-pastoral/backend/public;

    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
EOF

ln -s /etc/nginx/sites-available/biblioteca /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

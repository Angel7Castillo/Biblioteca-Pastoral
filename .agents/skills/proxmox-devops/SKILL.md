---
name: proxmox-devops
description: Procedimientos de despliegue, scripts de actualización y administración del servidor Nginx/PHP-FPM en el contenedor LXC de Proxmox.
---

# Skill: Proxmox DevOps (`proxmox-devops`)

Esta skill contiene los procedimientos y scripts de infraestructura para el servidor de producción en Proxmox.

## Información del Servidor LXC
- **Hostname**: `BP-Angel`
- **ID Contenedor**: `114`
- **IP Interna**: `192.168.1.200`
- **Ruta de la App**: `/var/www/biblioteca-pastoral/backend`

## Comandos Rápidos de Mantenimiento
- **Reiniciar Nginx y PHP-FPM**:
  ```bash
  systemctl restart nginx php8.5-fpm
  ```
- **Actualizar Backend desde GitHub**:
  ```bash
  cd /var/www/biblioteca-pastoral/backend
  git pull origin main
  composer install --no-dev --optimize-autoloader
  php artisan migrate --force
  php artisan config:cache
  php artisan route:cache
  ```
- **Ver Logs de Laravel**:
  ```bash
  tail -f /var/www/biblioteca-pastoral/backend/storage/logs/laravel.log
  ```

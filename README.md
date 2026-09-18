# 📖 Biblioteca Pastoral v2

Software multiplataforma (**PC Desktop** y **Android**) diseñado para pastores, líderes y maestros bíblicos, con la interfaz y estética de **Antigravity IDE**.

---

## 🏗️ Estructura del Proyecto

- **`/backend`**: API REST centralizada en **Laravel 11 (PHP 8.3 + SQLite)**.
- **`/desktop`**: Cliente de escritorio en **Electron + React + Vite + TailwindCSS 4**.
- **`/mobile`**: Cliente móvil para **Android** (Capacitor).
- **`/docs`**: [Documentación del Sistema e Infraestructura](docs/Arquitectura.md).

---

## 🖥️ Servidor Proxmox Backend (LXC 114)

- **Nombre**: `BP-Angel`
- **IP**: `192.168.1.200`
- **Recursos**: 4 Cores / 4 GB RAM / 40 GB Disco
- **Servicios**: Nginx + PHP 8.5-FPM + SQLite

---

## 📝 Documentación
Consulte el archivo [`docs/Arquitectura.md`](docs/Arquitectura.md) para ver la guía completa de configuración, credenciales y comandos de despliegue.

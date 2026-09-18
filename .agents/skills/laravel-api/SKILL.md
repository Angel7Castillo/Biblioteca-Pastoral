---
name: laravel-api
description: Estándares de desarrollo para la API REST de Laravel 11 en Biblioteca Pastoral (modelos, migraciones, endpoints REST y respuestas JSON).
---

# Skill: Laravel API (`laravel-api`)

Esta skill define las reglas de arquitectura y desarrollo para el backend en **Laravel 11** de la Biblioteca Pastoral.

## Principios Fundamentales
1. **Separación Estricta**: El backend funciona exclusivamente como una **API REST**. Nunca debe renderizar vistas HTML tradicionales (Blade), salvo para herramientas administrativas puntuales.
2. **Formato JSON Estándar**: Todas las respuestas API deben devolver la estructura unificada:
   ```json
   {
     "success": true,
     "data": { ... },
     "message": "Mensaje opcional"
   }
   ```
3. **Versionamiento de Rutas**: Todas las rutas de la API deben estar bajo `/api/v1/`.

## Modelos Principales
- **`Sermon`**:
  - Camas: `title`, `slug`, `content_markdown`, `content_html`, `status` (`borrador`, `listo`, `predicado`), `preach_date`, `location`, `main_passage`, `target_audience`, `user_id`.
- **`BibleVerse`**:
  - Campos: `version`, `book_number`, `book_name`, `chapter`, `verse`, `text`.

## Base de Datos
- **Desarrollo Local**: SQLite (`database/database.sqlite`).
- **Producción (Proxmox LXC)**: SQLite / MySQL.

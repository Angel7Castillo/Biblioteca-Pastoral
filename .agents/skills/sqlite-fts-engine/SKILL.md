---
name: sqlite-fts-engine
description: Optimización de consultas masivas teológicas y motor de búsqueda Full-Text Search (FTS5) sobre la Biblia de 93,000+ versículos en SQLite.
---

# Skill: SQLite FTS Engine (`sqlite-fts-engine`)

Esta skill define las estrategias de indexación, lematización y motor de búsqueda teológica rápida sobre la base de datos de más de 93,000 versículos bíblicos.

## Principios del Motor Bíblico
1. **Indexación FTS5 en SQLite**:
   - Creación de tabla virtual `bible_verses_fts` usando `USING fts5(version, book_name, text)`.
   - Búsqueda súper rápida de concordancia palabra por palabra y frases complejas en menos de 10ms.
2. **Normalización de Citas Teológicas**:
   - Algoritmo de reconocimiento de citas bíblicas directas (ej. *"Juan 3:16"*, *"Génesis 1:1"*, *"Salmos 23"*) mediante Expresiones Regulares en la API.
   - Mapeo automático de nombres abreviados de libros (*Jn*, *Mt*, *Gn*, *Sal*, *Ap*).
3. **Filtro de Versiones Bíblicas**:
   - Búsqueda simultánea o filtrada por versión: RVR1960, NVI, NTV, DHH.
4. **Paginación & Rendimiento**:
   - Respuestas API limitadas a 50 resultados relevantes por consulta para asegurar una respuesta fluida en la interfaz del usuario.

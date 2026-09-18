import express from 'express';
import cors from 'cors';
import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json()); // Habilitar lectura de JSON

// ==========================================
// 1. API DE BIBLIA (SQLite)
// ==========================================
app.get('/api/bible/:bookId/:chapter', async (req, res) => {
  const { bookId, chapter } = req.params;
  try {
    const dbPath = path.join(__dirname, '..', 'mock.bblx');
    if (!fs.existsSync(dbPath)) return res.json({ verses: [] });
    
    const SQL = await initSqlJs();
    const filebuffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(filebuffer);
    
    const stmt = db.prepare('SELECT Verse, Scripture FROM Bible WHERE Book = $book AND Chapter = $chapter ORDER BY Verse ASC');
    stmt.bind({ $book: parseInt(bookId), $chapter: parseInt(chapter) });
    
    const verses = [];
    while (stmt.step()) {
      verses.push(stmt.getAsObject());
    }
    stmt.free();
    db.close();
    
    res.json({ verses });
  } catch (err) {
    console.error("Error leyendo DB:", err);
    res.status(500).json({ error: err.message, verses: [] });
  }
});

// ==========================================
// 2. API DE SERMONES (Sistema de Archivos)
// ==========================================
const sermonesDir = path.join(__dirname, '..', 'Sermones');
// Asegurar que la carpeta existe al iniciar
if (!fs.existsSync(sermonesDir)) {
  fs.mkdirSync(sermonesDir);
  fs.writeFileSync(path.join(sermonesDir, 'Mi Primer Sermón.md'), '# Mi Primer Sermón\n\nEmpieza a escribir tus notas aquí. Se guardarán automáticamente al dejar de teclear.');
}

// Listar todos los sermones
app.get('/api/sermones', (req, res) => {
  try {
    const files = fs.readdirSync(sermonesDir)
      .filter(f => f.endsWith('.md'))
      .map(filename => {
        const filePath = path.join(sermonesDir, filename);
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        const parsed = matter(rawContent);
        return {
          filename,
          isDraft: parsed.data.status === 'borrador' || parsed.data.status === undefined
        };
      });
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leer un sermón específico
app.get('/api/sermones/:filename', (req, res) => {
  try {
    const filePath = path.join(sermonesDir, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "No encontrado" });
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(rawContent);
    res.json({ content: parsed.content, metadata: parsed.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo sermón
app.post('/api/sermones', (req, res) => {
  try {
    const { filename } = req.body;
    const filePath = path.join(sermonesDir, filename);
    if (fs.existsSync(filePath)) return res.status(400).json({ error: "El archivo ya existe" });
    const newContent = matter.stringify(`# ${filename.replace('.md', '')}\n\n`, { status: 'borrador', fecha: '', lugar: '' });
    fs.writeFileSync(filePath, newContent, 'utf-8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Guardar/Actualizar un sermón
app.post('/api/sermones/:filename', (req, res) => {
  try {
    const { content, metadata } = req.body;
    const filePath = path.join(sermonesDir, req.params.filename);
    const newContent = matter.stringify(content, metadata || {});
    fs.writeFileSync(filePath, newContent, 'utf-8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reutilizar un sermón (clonar sin metadatos)
app.post('/api/sermones/reutilizar/:filename', (req, res) => {
  try {
    const { newName } = req.body;
    const oldPath = path.join(sermonesDir, req.params.filename);
    const newPath = path.join(sermonesDir, newName);
    
    if (!fs.existsSync(oldPath)) return res.status(404).json({ error: "Original no encontrado" });
    if (fs.existsSync(newPath)) return res.status(400).json({ error: "El nuevo nombre ya existe" });

    const rawContent = fs.readFileSync(oldPath, 'utf-8');
    const parsed = matter(rawContent);
    
    parsed.data.status = 'borrador';
    parsed.data.fecha = '';
    parsed.data.lugar = '';
    
    const clonedContent = matter.stringify(parsed.content, parsed.data);
    fs.writeFileSync(newPath, clonedContent, 'utf-8');
    
    res.json({ success: true, newFilename: newName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Borrar un sermón
app.delete('/api/sermones/:filename', (req, res) => {
  try {
    const filePath = path.join(sermonesDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API de Biblioteca Pastoral escuchando en el puerto ${PORT}`);
});

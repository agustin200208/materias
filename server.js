import express from 'express';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const app  = express();
const PORT = process.env.PORT || 3000;

// → Necesario en ES modules para tener __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

app.use(cors());
app.use(express.json());

// Inicializar conexión a SQLite
let db;
(async () => {
  db = await open({
    filename: path.join(__dirname, 'db', 'materias.db'),
    driver: sqlite3.Database
  });
})();

// 1) Portal en la raíz (sirve public files de portal/)
app.use(
  '/',
  express.static(path.join(__dirname, 'portal'))
);
// (opcional) también accesible vía /portal
app.use(
  '/portal',
  express.static(path.join(__dirname, 'portal'))
);

// 2) Landing bajo /landing
app.use(
  '/landing',
  express.static(path.join(__dirname, 'landing'))
);

// 3) Calendario bajo /calendario
app.use(
  '/calendario',
  express.static(path.join(__dirname, 'calendario'))
);

// 4) API de materias
app.get('/api/materias', async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT 
        s.codigo, s.nombre, s.ano, s.estado, s.tipo,
        s.dia,
        GROUP_CONCAT(c.correlativa_codigo) AS correlativas
      FROM subject s
      LEFT JOIN correlativa c
        ON c.subject_codigo = s.codigo
      GROUP BY s.codigo
    `);
    const materias = rows.map(r => ({
      codigo:      r.codigo,
      nombre:      r.nombre,
      ano:         r.ano,
      estado:      r.estado,
      tipo:        r.tipo,
      dia:         r.dia || '',
      correlativas:r.correlativas ? r.correlativas.split(',') : []
    }));
    res.json(materias);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error leyendo la base de materias' });
  }
});

app.post('/api/materias', async (req, res) => {
  try {
    const lista = req.body; // [{ codigo, estado, dia }, ...]
    await db.run('BEGIN TRANSACTION');
    for (const m of lista) {
      await db.run(
        `UPDATE subject
           SET estado = ?, dia = ?
         WHERE codigo = ?`,
        m.estado,
        m.dia,
        m.codigo
      );
    }
    await db.run('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await db.run('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Error guardando estados' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Server corriendo en http://localhost:${PORT}`);
});
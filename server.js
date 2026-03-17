require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Database ───────────────────────────────────────────
const dataDir = path.join(__dirname, 'data');
if (!require('fs').existsSync(dataDir)) require('fs').mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'cartas.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    pseudonym TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name_encrypted TEXT NOT NULL,
    address_encrypted TEXT NOT NULL,
    city_encrypted TEXT NOT NULL,
    postal_code_encrypted TEXT NOT NULL,
    country_encrypted TEXT NOT NULL,
    is_hospice INTEGER DEFAULT 0,
    hospice_name TEXT,
    matched INTEGER DEFAULT 0,
    matched_to TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    sender_id TEXT NOT NULL REFERENCES participants(id),
    receiver_id TEXT NOT NULL REFERENCES participants(id),
    sender_pseudonym TEXT NOT NULL,
    receiver_pseudonym TEXT NOT NULL,
    emails_sent INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS site_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS site_images (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    section TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed default site config
const defaultConfig = {
  'hero_title': 'Intercambio Anónimo de Cartas',
  'hero_subtitle': 'Conecta con desconocidos a través del arte perdido de las cartas escritas a mano. Completamente anónimo, seguro y reconfortante.',
  'cta_button': 'Unirme al Intercambio',
  'cta_secondary': 'Saber Más',
  'feature1_title': 'Anonimato Completo',
  'feature1_text': 'Tu identidad está protegida con seudónimos. Solo la persona que te escribe ve tu dirección, y nunca saben tu nombre real.',
  'feature2_title': 'Escribe a Pacientes de Hospicio',
  'feature2_text': 'Elige escribir a residentes ancianos en hospicios que amarían recibir una carta amable y reflexiva de un desconocido.',
  'feature3_title': 'Emparejamiento Aleatorio',
  'feature3_text': 'Nuestro sistema empareja participantes aleatoriamente cuando hay suficientes personas registradas. Todos escriben, todos reciben.',
  'howit_title': 'Cómo Funciona',
  'step1_title': 'Regístrate',
  'step1_desc': 'Regístrate con un seudónimo',
  'step2_title': 'Espera',
  'step2_desc': 'Recolectamos participantes',
  'step3_title': 'Empareja',
  'step3_desc': 'Recibe tu asignación',
  'step4_title': 'Escribe',
  'step4_desc': '¡Envía tu carta!',
  'cta2_title': '¿Listo para Compartir Alegría?',
  'cta2_text': 'Únete a cientos de personas conectando a través de cartas escritas a mano.',
  'about_title': 'Sobre el Intercambio Anónimo de Cartas',
  'about_subtitle': 'Reviviendo el arte perdido de las cartas escritas a mano mientras protegemos tu privacidad.',
  'about_story': 'Este proyecto comenzó como una idea simple: conectar desconocidos a través de cartas escritas a mano. Originalmente, las personas enviaban sus nombres y direcciones, y nosotros las distribuíamos aleatoriamente entre los participantes.\n\nTambién manteníamos una lista de personas mayores que vivían en hospicios — aquellos que podrían apreciar una palabra amable de un desconocido.\n\nA medida que crecieron las preocupaciones de privacidad, supimos que necesitábamos evolucionar. La versión de hoy usa encriptación moderna y seudonimización.',
  'footer_text': '© 2024 Intercambio Anónimo de Cartas. Código abierto y enfocado en la privacidad.',
};

const insertConfig = db.prepare('INSERT OR IGNORE INTO site_config (key, value) VALUES (?, ?)');
for (const [key, value] of Object.entries(defaultConfig)) {
  insertConfig.run(key, value);
}

// ── Encryption ─────────────────────────────────────────
const ENC_KEY = process.env.ENCRYPTION_KEY || 'default-key';

function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(ENC_KEY).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(data) {
  if (!data || !data.includes(':')) return '';
  try {
    const [ivHex, encrypted] = data.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.createHash('sha256').update(ENC_KEY).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch { return '[encrypted]'; }
}

// ── Pseudonym Generator ────────────────────────────────
function generatePseudonym() {
  const adj = ['Gentle','Silent','Wandering','Thoughtful','Curious','Dreaming','Serene','Mystic','Hidden','Quiet','Brave','Cosmic','Lunar','Solar','Crystal'];
  const nouns = ['Writer','Traveler','Dreamer','Observer','Poet','Storyteller','Messenger','Seeker','Wanderer','Friend','Phoenix','Star','Moon','River','Cloud'];
  const num = Math.floor(Math.random() * 999) + 1;
  return adj[Math.floor(Math.random() * adj.length)] + nouns[Math.floor(Math.random() * nouns.length)] + num;
}

// ── Auth Middleware ─────────────────────────────────────
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'cartas-admin-2024';
const ADMIN_TOKEN = crypto.createHash('sha256').update(ADMIN_PASS + (process.env.SESSION_SECRET || 'secret')).digest('hex');

function requireAdmin(req, res, next) {
  if (req.cookies.admin_token === ADMIN_TOKEN) return next();
  return res.status(401).json({ error: 'No autorizado' });
}

// ── Multer for Image Upload ────────────────────────────
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (/^image\/(jpeg|png|gif|webp|svg\+xml)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Solo se permiten imágenes'));
}});

// ══════════════════════════════════════════════════════
//  PUBLIC API
// ══════════════════════════════════════════════════════

// Get site config (public texts)
app.get('/api/config', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM site_config').all();
  const config = {};
  rows.forEach(r => config[r.key] = r.value);
  res.json(config);
});

// Get site images
app.get('/api/images', (req, res) => {
  const images = db.prepare('SELECT * FROM site_images ORDER BY created_at DESC').all();
  res.json(images);
});

// Generate pseudonym
app.get('/api/pseudonym', (req, res) => {
  res.json({ pseudonym: generatePseudonym() });
});

// Check pseudonym availability
app.get('/api/pseudonym/check/:name', (req, res) => {
  const existing = db.prepare('SELECT 1 FROM participants WHERE pseudonym = ?').get(req.params.name);
  res.json({ available: !existing });
});

// Register participant
app.post('/api/register', (req, res) => {
  try {
    const { pseudonym, email, name, address, city, postal_code, country, is_hospice, hospice_name } = req.body;
    
    if (!pseudonym || !email || !name || !address || !city || !postal_code || !country) {
      return res.status(400).json({ error: 'Todos los campos requeridos deben completarse' });
    }
    if (pseudonym.length < 3) {
      return res.status(400).json({ error: 'El seudónimo debe tener al menos 3 caracteres' });
    }

    const existing = db.prepare('SELECT 1 FROM participants WHERE pseudonym = ?').get(pseudonym);
    if (existing) return res.status(409).json({ error: 'Este seudónimo ya está en uso' });

    const id = crypto.randomBytes(16).toString('hex');
    db.prepare(`
      INSERT INTO participants (id, pseudonym, email, name_encrypted, address_encrypted, city_encrypted, postal_code_encrypted, country_encrypted, is_hospice, hospice_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, pseudonym, email.toLowerCase().trim(), encrypt(name), encrypt(address), encrypt(city), encrypt(postal_code), encrypt(country), is_hospice ? 1 : 0, hospice_name || null);

    res.json({ success: true, pseudonym });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════
//  ADMIN API
// ══════════════════════════════════════════════════════

// Admin login
app.post('/api/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASS) {
    res.cookie('admin_token', ADMIN_TOKEN, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: 'strict' });
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Contraseña incorrecta' });
});

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true });
});

app.get('/api/admin/check', requireAdmin, (req, res) => {
  res.json({ authenticated: true });
});

// Get all participants (admin)
app.get('/api/admin/participants', requireAdmin, (req, res) => {
  const participants = db.prepare('SELECT * FROM participants ORDER BY created_at DESC').all();
  // Decrypt for admin view
  const decrypted = participants.map(p => ({
    ...p,
    name: decrypt(p.name_encrypted),
    address: decrypt(p.address_encrypted),
    city: decrypt(p.city_encrypted),
    postal_code: decrypt(p.postal_code_encrypted),
    country: decrypt(p.country_encrypted),
  }));
  res.json(decrypted);
});

// Delete participant
app.delete('/api/admin/participants/:id', requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM matches WHERE sender_id = ? OR receiver_id = ?').run(req.params.id, req.params.id);
    db.prepare('DELETE FROM participants WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as c FROM participants').get().c;
  const unmatched = db.prepare('SELECT COUNT(*) as c FROM participants WHERE matched = 0').get().c;
  const matched = db.prepare('SELECT COUNT(*) as c FROM participants WHERE matched = 1').get().c;
  const hospice = db.prepare('SELECT COUNT(*) as c FROM participants WHERE is_hospice = 1').get().c;
  const totalMatches = db.prepare('SELECT COUNT(*) as c FROM matches').get().c;
  const pendingEmails = db.prepare('SELECT COUNT(*) as c FROM matches WHERE emails_sent = 0').get().c;
  res.json({ total, unmatched, matched, hospice, totalMatches, pendingEmails });
});

// Get matches
app.get('/api/admin/matches', requireAdmin, (req, res) => {
  const matches = db.prepare('SELECT * FROM matches ORDER BY created_at DESC').all();
  res.json(matches);
});

// Generate matches
app.post('/api/admin/generate-matches', requireAdmin, (req, res) => {
  try {
    const unmatched = db.prepare('SELECT * FROM participants WHERE matched = 0').all();
    if (unmatched.length < 2) return res.status(400).json({ error: 'Se necesitan al menos 2 participantes sin emparejar' });

    // Fisher-Yates shuffle
    const shuffled = [...unmatched];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Create derangement (rotate by 1)
    const receivers = [...shuffled];
    const first = receivers.shift();
    receivers.push(first);

    const newMatches = [];
    for (let i = 0; i < shuffled.length; i++) {
      newMatches.push({
        sender_id: shuffled[i].id,
        receiver_id: receivers[i].id,
        sender_pseudonym: shuffled[i].pseudonym,
        receiver_pseudonym: receivers[i].pseudonym,
      });
    }

    res.json({ matches: newMatches, count: newMatches.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Save matches
app.post('/api/admin/save-matches', requireAdmin, (req, res) => {
  try {
    const { matches } = req.body;
    const insertMatch = db.prepare('INSERT INTO matches (id, sender_id, receiver_id, sender_pseudonym, receiver_pseudonym) VALUES (?, ?, ?, ?, ?)');
    const updateParticipant = db.prepare('UPDATE participants SET matched = 1, matched_to = ? WHERE id = ?');

    const transaction = db.transaction(() => {
      for (const m of matches) {
        const id = crypto.randomBytes(16).toString('hex');
        insertMatch.run(id, m.sender_id, m.receiver_id, m.sender_pseudonym, m.receiver_pseudonym);
        updateParticipant.run(m.receiver_id, m.sender_id);
      }
    });
    transaction();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Mark emails sent
app.post('/api/admin/send-emails', requireAdmin, (req, res) => {
  try {
    db.prepare('UPDATE matches SET emails_sent = 1 WHERE emails_sent = 0').run();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Clear all data
app.post('/api/admin/clear-all', requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM matches').run();
    db.prepare('DELETE FROM participants').run();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update site config
app.put('/api/admin/config', requireAdmin, (req, res) => {
  try {
    const update = db.prepare('INSERT OR REPLACE INTO site_config (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))');
    const transaction = db.transaction(() => {
      for (const [key, value] of Object.entries(req.body)) {
        update.run(key, value);
      }
    });
    transaction();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Upload image
app.post('/api/admin/images', requireAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });
    const id = crypto.randomBytes(16).toString('hex');
    db.prepare('INSERT INTO site_images (id, name, filename, section) VALUES (?, ?, ?, ?)').run(
      id, req.body.name || req.file.originalname, req.file.filename, req.body.section || 'general'
    );
    res.json({ success: true, id, filename: req.file.filename, url: '/uploads/' + req.file.filename });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete image
app.delete('/api/admin/images/:id', requireAdmin, (req, res) => {
  try {
    const img = db.prepare('SELECT filename FROM site_images WHERE id = ?').get(req.params.id);
    if (img) {
      const fs = require('fs');
      const filepath = path.join(__dirname, 'uploads', img.filename);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }
    db.prepare('DELETE FROM site_images WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Export DB as JSON
app.get('/api/admin/export', requireAdmin, (req, res) => {
  const participants = db.prepare('SELECT * FROM participants').all().map(p => ({
    ...p, name: decrypt(p.name_encrypted), address: decrypt(p.address_encrypted),
    city: decrypt(p.city_encrypted), postal_code: decrypt(p.postal_code_encrypted), country: decrypt(p.country_encrypted),
  }));
  const matches = db.prepare('SELECT * FROM matches').all();
  res.json({ participants, matches, exported_at: new Date().toISOString() });
});

// ── SPA Fallback ───────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ──────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✉️  Cartas a Desconocidos corriendo en http://localhost:${PORT}`);
});

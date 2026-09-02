require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const Database = require('better-sqlite3');


const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// ── Rutas de datos persistentes ─────────────────────────
// La DB y las subidas DEBEN vivir en el volumen persistente, no en el disco
// efímero del contenedor. Orden: variable explícita > volumen de Railway
// (RAILWAY_VOLUME_MOUNT_PATH) > carpeta local (solo dev). Este default hace
// que en Railway se use el volumen automáticamente aunque no se fije DATA_DIR.
const railwayVolume = process.env.RAILWAY_VOLUME_MOUNT_PATH || null;
const dataDir = process.env.DATA_DIR || railwayVolume || path.join(__dirname, 'data');
const uploadsDir = process.env.UPLOADS_DIR || railwayVolume || path.join(__dirname, 'uploads');
for (const dir of [dataDir, uploadsDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ── Middleware ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// ── Database ───────────────────────────────────────────
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
  'feature2_title': 'Cartas de Verdad, en Papel',
  'feature2_text': 'Nada de mensajes instantáneos: escribes a mano y tu carta viaja por correo postal hasta un buzón real. El placer analógico de recibir algo físico de otra persona.',
  'feature3_title': 'Emparejamiento Aleatorio',
  'feature3_text': 'Nuestro sistema empareja participantes aleatoriamente cuando hay suficientes personas registradas. Todos escriben, todos reciben.',
  'howit_title': 'Cómo Funciona',
  'step1_title': 'Regístrate',
  'step1_desc': 'Elige un seudónimo y deja tu dirección cifrada.',
  'step2_title': 'Espera',
  'step2_desc': 'Reunimos participantes hasta formar una ronda.',
  'step3_title': 'Empareja',
  'step3_desc': 'Recibes por correo el seudónimo y la dirección de tu destinatario.',
  'step4_title': 'Escribe',
  'step4_desc': 'Escribes a mano, firmas con tu seudónimo y la envías.',
  'cta2_title': '¿Listo para Compartir Alegría?',
  'cta2_text': 'Únete a cientos de personas conectando a través de cartas escritas a mano.',
  'about_title': 'Sobre el Intercambio Anónimo de Cartas',
  'about_subtitle': 'Reviviendo el arte perdido de las cartas escritas a mano mientras protegemos tu privacidad.',
  'about_story': 'Este proyecto comenzó como una idea simple: conectar desconocidos a través de cartas escritas a mano. Originalmente, las personas enviaban sus nombres y direcciones, y nosotros las distribuíamos aleatoriamente entre los participantes.\n\nA medida que crecieron las preocupaciones de privacidad, supimos que necesitábamos evolucionar. La versión de hoy usa encriptación moderna y seudonimización — pero conserva lo esencial: papel, tinta y la emoción de recibir una carta de alguien que no conoces.',
  'footer_text': 'Cartas a Desconocidos · Código abierto y enfocado en la privacidad.',
  'email_subject': '✉️ ¡Tu emparejamiento está listo! — Cartas a Desconocidos',
  'email_body': `Hola {{sender_pseudonym}},

¡Buenas noticias! Ya tienes tu emparejamiento para el Intercambio Anónimo de Cartas.

Tu destinatario es: {{receiver_pseudonym}}

Envía tu carta a:
{{receiver_address}}
{{receiver_city}}, {{receiver_postal_code}}
{{receiver_country}}

Recuerda:
• NO incluyas tu nombre real ni dirección de remitente
• Firma con tu seudónimo: {{sender_pseudonym}}
• Sé amable, respetuoso y creativo

También puedes consultar tu emparejamiento en cualquier momento en:
{{site_url}}/status

¡Feliz escritura!
El equipo de Cartas a Desconocidos`,
};

const insertConfig = db.prepare('INSERT OR IGNORE INTO site_config (key, value) VALUES (?, ?)');
for (const [key, value] of Object.entries(defaultConfig)) {
  insertConfig.run(key, value);
}

// ── Migración idempotente: retira los textos de "hospicios" de bases
//    ya existentes, sin pisar ediciones propias del administrador.
//    Solo reemplaza si el valor guardado sigue siendo el default viejo.
const legacyHospiceValues = {
  'feature2_title': 'Escribe a Pacientes de Hospicio',
  'feature2_text': 'Elige escribir a residentes ancianos en hospicios que amarían recibir una carta amable y reflexiva de un desconocido.',
  'about_story': 'Este proyecto comenzó como una idea simple: conectar desconocidos a través de cartas escritas a mano. Originalmente, las personas enviaban sus nombres y direcciones, y nosotros las distribuíamos aleatoriamente entre los participantes.\n\nTambién manteníamos una lista de personas mayores que vivían en hospicios — aquellos que podrían apreciar una palabra amable de un desconocido.\n\nA medida que crecieron las preocupaciones de privacidad, supimos que necesitábamos evolucionar. La versión de hoy usa encriptación moderna y seudonimización.',
};
const updateIfLegacy = db.prepare('UPDATE site_config SET value = ? WHERE key = ? AND value = ?');
for (const [key, oldVal] of Object.entries(legacyHospiceValues)) {
  updateIfLegacy.run(defaultConfig[key], key, oldVal);
}
// Refresca el footer viejo con año fijo si no fue editado a mano.
updateIfLegacy.run(defaultConfig['footer_text'], 'footer_text', '© 2024 Intercambio Anónimo de Cartas. Código abierto y enfocado en la privacidad.');
// Retira la línea {{hospice_note}} de plantillas de email guardadas.
db.prepare(`UPDATE site_config SET value = REPLACE(value, '{{hospice_note}}' || char(10), '') WHERE key = 'email_body'`).run();
db.prepare(`UPDATE site_config SET value = REPLACE(value, '{{hospice_note}}', '') WHERE key = 'email_body'`).run();
// La opción de hospicios ya no existe en la interfaz.
db.prepare(`DELETE FROM site_config WHERE key = 'hospice_enabled'`).run();

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
  destination: uploadsDir,
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
    const { pseudonym, email, name, address, city, postal_code, country } = req.body;
    
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL)
    `).run(id, pseudonym, email.toLowerCase().trim(), encrypt(name), encrypt(address), encrypt(city), encrypt(postal_code), encrypt(country));

    res.json({ success: true, pseudonym });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lookup participant status (public — requires pseudonym + email for verification)
app.post('/api/status', (req, res) => {
  try {
    const { pseudonym, email } = req.body;
    if (!pseudonym || !email) return res.status(400).json({ error: 'Seudónimo y correo son requeridos' });

    const participant = db.prepare('SELECT * FROM participants WHERE pseudonym = ? AND email = ?')
      .get(pseudonym.trim(), email.toLowerCase().trim());

    if (!participant) {
      return res.status(404).json({ error: 'No se encontró un registro con ese seudónimo y correo. Verifica los datos.' });
    }

    // Base response
    const result = {
      pseudonym: participant.pseudonym,
      registered_at: participant.created_at,
      matched: !!participant.matched,
      is_hospice: !!participant.is_hospice,
    };

    // If matched, get the match details and decrypt the receiver's address
    if (participant.matched) {
      const match = db.prepare('SELECT * FROM matches WHERE sender_id = ?').get(participant.id);
      if (match) {
        const receiver = db.prepare('SELECT * FROM participants WHERE id = ?').get(match.receiver_id);
        if (receiver) {
          result.match = {
            receiver_pseudonym: match.receiver_pseudonym,
            receiver_address: decrypt(receiver.address_encrypted),
            receiver_city: decrypt(receiver.city_encrypted),
            receiver_postal_code: decrypt(receiver.postal_code_encrypted),
            receiver_country: decrypt(receiver.country_encrypted),
            receiver_is_hospice: !!receiver.is_hospice,
            receiver_hospice_name: receiver.hospice_name || null,
            matched_at: match.created_at,
          };
        }
      }
    }

    res.json(result);
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
  const totalMatches = db.prepare('SELECT COUNT(*) as c FROM matches').get().c;
  const pendingEmails = db.prepare('SELECT COUNT(*) as c FROM matches WHERE emails_sent = 0').get().c;
  res.json({ total, unmatched, matched, totalMatches, pendingEmails });
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

// Reset matches (deshacer emparejamientos, conservando participantes)
app.post('/api/admin/reset-matches', requireAdmin, (req, res) => {
  try {
    const sent = db.prepare('SELECT COUNT(*) as c FROM matches WHERE emails_sent = 1').get().c;
    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM matches').run();
      db.prepare('UPDATE participants SET matched = 0, matched_to = NULL').run();
    });
    transaction();
    res.json({ success: true, emailsAlreadySent: sent });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Importar / restaurar desde un export JSON (combina; IDs iguales se sobrescriben).
app.post('/api/admin/import', requireAdmin, (req, res) => {
  try {
    const participants = Array.isArray(req.body.participants) ? req.body.participants : null;
    const matches = Array.isArray(req.body.matches) ? req.body.matches : [];
    if (!participants) return res.status(400).json({ error: 'JSON inválido: falta el arreglo "participants"' });

    const pStmt = db.prepare(`INSERT OR REPLACE INTO participants
      (id, pseudonym, email, name_encrypted, address_encrypted, city_encrypted, postal_code_encrypted, country_encrypted, is_hospice, hospice_name, matched, matched_to, created_at, updated_at)
      VALUES (@id,@pseudonym,@email,@name_encrypted,@address_encrypted,@city_encrypted,@postal_code_encrypted,@country_encrypted,@is_hospice,@hospice_name,@matched,@matched_to,@created_at,@updated_at)`);
    const mStmt = db.prepare(`INSERT OR REPLACE INTO matches
      (id, sender_id, receiver_id, sender_pseudonym, receiver_pseudonym, emails_sent, created_at)
      VALUES (@id,@sender_id,@receiver_id,@sender_pseudonym,@receiver_pseudonym,@emails_sent,@created_at)`);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const tx = db.transaction(() => {
      for (const p of participants) {
        if (!p.id || !p.pseudonym || !p.email || !p.name_encrypted || !p.address_encrypted) {
          throw new Error(`Participante con datos incompletos: ${p.pseudonym || p.id || '(sin id)'}`);
        }
        pStmt.run({
          id: p.id, pseudonym: p.pseudonym, email: p.email,
          name_encrypted: p.name_encrypted, address_encrypted: p.address_encrypted,
          city_encrypted: p.city_encrypted, postal_code_encrypted: p.postal_code_encrypted,
          country_encrypted: p.country_encrypted,
          is_hospice: p.is_hospice ? 1 : 0, hospice_name: p.hospice_name ?? null,
          matched: p.matched ? 1 : 0, matched_to: p.matched_to ?? null,
          created_at: p.created_at || now, updated_at: p.updated_at || now,
        });
      }
      for (const m of matches) {
        mStmt.run({
          id: m.id, sender_id: m.sender_id, receiver_id: m.receiver_id,
          sender_pseudonym: m.sender_pseudonym, receiver_pseudonym: m.receiver_pseudonym,
          emails_sent: m.emails_sent ? 1 : 0, created_at: m.created_at || now,
        });
      }
    });
    tx();

    res.json({
      success: true,
      importedParticipants: participants.length,
      importedMatches: matches.length,
      totalParticipants: db.prepare('SELECT COUNT(*) c FROM participants').get().c,
      totalMatches: db.prepare('SELECT COUNT(*) c FROM matches').get().c,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Email Infrastructure ──────────────────────────────
async function sendEmailViaBrevo(to, subject, body, from) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY not configured');

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: from },
      to: [{ email: to }],
      subject,
      htmlContent: body,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Brevo API error: ${error.message}`);
  }

  return response.json();
}

function buildEmail(match, sender, receiver) {
  const siteUrl = process.env.SITE_URL || `http://localhost:${PORT}`;
  const subject = db.prepare("SELECT value FROM site_config WHERE key = 'email_subject'").get()?.value || 'Tu emparejamiento está listo';
  let body = db.prepare("SELECT value FROM site_config WHERE key = 'email_body'").get()?.value || '';

  const replacements = {
    '{{sender_pseudonym}}': match.sender_pseudonym,
    '{{receiver_pseudonym}}': match.receiver_pseudonym,
    '{{receiver_address}}': decrypt(receiver.address_encrypted),
    '{{receiver_city}}': decrypt(receiver.city_encrypted),
    '{{receiver_postal_code}}': decrypt(receiver.postal_code_encrypted),
    '{{receiver_country}}': decrypt(receiver.country_encrypted),
    '{{hospice_note}}': '',
    '{{site_url}}': siteUrl,
  };

  for (const [key, val] of Object.entries(replacements)) {
    body = body.split(key).join(val);
  }

  return { subject, body, to: sender.email };
}

// Test Brevo API connection
app.post('/api/admin/email/test', requireAdmin, async (req, res) => {
  if (!process.env.BREVO_API_KEY) {
    return res.status(400).json({
      error: 'Brevo API no configurada. Agrega BREVO_API_KEY en el archivo .env y reinicia el servidor.',
      configured: false,
    });
  }
  try {
    const response = await fetch('https://api.brevo.com/v3/account', {
      headers: { 'api-key': process.env.BREVO_API_KEY },
    });
    if (!response.ok) {
      const error = await response.json();
      return res.status(400).json({ error: `Error de API Brevo: ${error.message}`, configured: true });
    }
    res.json({ success: true, message: 'Conexión con Brevo API exitosa' });
  } catch (err) {
    res.status(400).json({ error: `Error de conexión: ${err.message}`, configured: true });
  }
});

// Get Brevo API status
app.get('/api/admin/email/status', requireAdmin, (req, res) => {
  const configured = !!process.env.BREVO_API_KEY;
  res.json({
    configured,
    from: process.env.BREVO_FROM || '',
  });
});

// Preview email for a specific match
app.get('/api/admin/email/preview/:matchId', requireAdmin, (req, res) => {
  try {
    const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.matchId);
    if (!match) return res.status(404).json({ error: 'Emparejamiento no encontrado' });

    const sender = db.prepare('SELECT * FROM participants WHERE id = ?').get(match.sender_id);
    const receiver = db.prepare('SELECT * FROM participants WHERE id = ?').get(match.receiver_id);
    if (!sender || !receiver) return res.status(404).json({ error: 'Participantes no encontrados' });

    const email = buildEmail(match, sender, receiver);
    res.json({ ...email, sender_pseudonym: match.sender_pseudonym, receiver_pseudonym: match.receiver_pseudonym });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Send single email
app.post('/api/admin/email/send/:matchId', requireAdmin, async (req, res) => {
  if (!process.env.BREVO_API_KEY) return res.status(400).json({ error: 'Brevo API no configurada' });

  try {
    const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.matchId);
    if (!match) return res.status(404).json({ error: 'Emparejamiento no encontrado' });

    const sender = db.prepare('SELECT * FROM participants WHERE id = ?').get(match.sender_id);
    const receiver = db.prepare('SELECT * FROM participants WHERE id = ?').get(match.receiver_id);
    if (!sender || !receiver) return res.status(404).json({ error: 'Participantes no encontrados' });

    const email = buildEmail(match, sender, receiver);
    const from = process.env.BREVO_FROM;

    await sendEmailViaBrevo(email.to, email.subject, email.body, from);

    db.prepare('UPDATE matches SET emails_sent = 1 WHERE id = ?').run(match.id);
    res.json({ success: true, to: email.to });
  } catch (err) {
    res.status(500).json({ error: `Error enviando a ${req.params.matchId}: ${err.message}` });
  }
});

// Send ALL pending emails
app.post('/api/admin/email/send-all', requireAdmin, async (req, res) => {
  if (!process.env.BREVO_API_KEY) return res.status(400).json({ error: 'Brevo API no configurada' });

  const pendingMatches = db.prepare('SELECT * FROM matches WHERE emails_sent = 0').all();
  if (!pendingMatches.length) return res.json({ success: true, sent: 0, failed: 0, results: [] });

  const from = process.env.BREVO_FROM;
  const results = [];
  let sent = 0, failed = 0;
  const delayMs = parseInt(process.env.EMAIL_DELAY_MS || '1500'); // delay between emails

  for (const match of pendingMatches) {
    const sender = db.prepare('SELECT * FROM participants WHERE id = ?').get(match.sender_id);
    const receiver = db.prepare('SELECT * FROM participants WHERE id = ?').get(match.receiver_id);

    if (!sender || !receiver) {
      results.push({ match_id: match.id, pseudonym: match.sender_pseudonym, status: 'error', error: 'Participante no encontrado' });
      failed++;
      continue;
    }

    try {
      const email = buildEmail(match, sender, receiver);
      await sendEmailViaBrevo(email.to, email.subject, email.body, from);
      db.prepare('UPDATE matches SET emails_sent = 1 WHERE id = ?').run(match.id);
      results.push({ match_id: match.id, pseudonym: match.sender_pseudonym, to: email.to, status: 'sent' });
      sent++;
    } catch (err) {
      results.push({ match_id: match.id, pseudonym: match.sender_pseudonym, status: 'error', error: err.message });
      failed++;
    }

    // Delay between emails to avoid rate limits
    if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
  }

  res.json({ success: true, sent, failed, total: pendingMatches.length, results });
});

// Mark emails sent (manual, without actually sending)
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
      const filepath = path.join(uploadsDir, img.filename);
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

// Export CSV for bulk email tools (Mailchimp, SendGrid, Brevo, etc.)
app.get('/api/admin/export-csv', requireAdmin, (req, res) => {
  try {
    const matches = db.prepare('SELECT * FROM matches ORDER BY created_at DESC').all();
    if (!matches.length) return res.status(404).json({ error: 'No hay emparejamientos para exportar' });

    const rows = [];
    for (const m of matches) {
      const sender = db.prepare('SELECT * FROM participants WHERE id = ?').get(m.sender_id);
      const receiver = db.prepare('SELECT * FROM participants WHERE id = ?').get(m.receiver_id);
      if (!sender || !receiver) continue;

      rows.push({
        sender_email: sender.email,
        sender_pseudonym: m.sender_pseudonym,
        receiver_pseudonym: m.receiver_pseudonym,
        receiver_address: decrypt(receiver.address_encrypted),
        receiver_city: decrypt(receiver.city_encrypted),
        receiver_postal_code: decrypt(receiver.postal_code_encrypted),
        receiver_country: decrypt(receiver.country_encrypted),
        emails_sent: m.emails_sent ? 'Sí' : 'No',
        matched_at: m.created_at,
      });
    }

    // Build CSV
    const headers = [
      'Email Remitente','Seudónimo Remitente','Seudónimo Destinatario',
      'Dirección Destinatario','Ciudad','Código Postal','País',
      'Email Enviado','Fecha Emparejamiento'
    ];
    const csvEscape = (val) => {
      const s = String(val || '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const csvRows = [headers.join(',')];
    for (const r of rows) {
      csvRows.push([
        r.sender_email, r.sender_pseudonym, r.receiver_pseudonym,
        r.receiver_address, r.receiver_city, r.receiver_postal_code, r.receiver_country,
        r.emails_sent, r.matched_at,
      ].map(csvEscape).join(','));
    }

    const csv = '\uFEFF' + csvRows.join('\r\n'); // BOM for Excel UTF-8
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="cartas-emparejamientos-${new Date().toISOString().slice(0,10)}.csv"`);
    res.send(csv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── SPA Fallback ───────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ──────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✉️  Cartas a Desconocidos corriendo en http://localhost:${PORT}`);
});

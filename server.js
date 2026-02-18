const express = require('express');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const LEGACY_STATE_PATH = path.join(DATA_DIR, 'founder-os-state.json');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'founder-os.db');

app.use(express.json({ limit: '5mb' }));
app.use(express.static(__dirname));

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function parseLegacyState() {
  if (!fs.existsSync(LEGACY_STATE_PATH)) {
    return { data: null, updatedAt: null };
  }

  try {
    const raw = fs.readFileSync(LEGACY_STATE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      data: parsed?.data && typeof parsed.data === 'object' ? parsed.data : null,
      updatedAt: parsed?.updatedAt || null
    };
  } catch {
    return { data: null, updatedAt: null };
  }
}

function initDatabase() {
  ensureDataDir();

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS founder_os_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT,
      updated_at TEXT
    )
  `);

  const row = db.prepare('SELECT id FROM founder_os_state WHERE id = 1').get();
  if (!row) {
    const legacy = parseLegacyState();
    const serialized = legacy.data ? JSON.stringify(legacy.data) : null;
    db.prepare('INSERT INTO founder_os_state (id, data, updated_at) VALUES (1, ?, ?)')
      .run(serialized, legacy.updatedAt);
  }

  return db;
}

const db = initDatabase();

function readState() {
  const row = db.prepare('SELECT data, updated_at FROM founder_os_state WHERE id = 1').get();
  if (!row) {
    return { data: null, updatedAt: null };
  }

  let parsed = null;
  if (row.data) {
    try {
      parsed = JSON.parse(row.data);
    } catch {
      parsed = null;
    }
  }

  return {
    data: parsed && typeof parsed === 'object' ? parsed : null,
    updatedAt: row.updated_at || null
  };
}

function writeState(data) {
  const updatedAt = new Date().toISOString();
  const serialized = JSON.stringify(data);

  db.prepare(`
    INSERT INTO founder_os_state (id, data, updated_at)
    VALUES (1, @data, @updatedAt)
    ON CONFLICT(id) DO UPDATE SET
      data = excluded.data,
      updated_at = excluded.updated_at
  `).run({ data: serialized, updatedAt });

  return { data, updatedAt };
}

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', app: 'Founder OS' });
});

app.get('/api/db/status', (_req, res) => {
  const state = readState();
  res.json({
    ok: true,
    engine: 'sqlite',
    hasState: Boolean(state.data),
    updatedAt: state.updatedAt,
    dbFile: path.basename(DB_PATH)
  });
});

app.get('/api/founder-os', (_req, res) => {
  const state = readState();
  res.json({ ok: true, ...state });
});

app.put('/api/founder-os', (req, res) => {
  const data = req.body?.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ error: 'data object is required' });
  }

  const saved = writeState(data);
  return res.json({ ok: true, ...saved });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`Founder OS running on http://localhost:${PORT}`);
});

function gracefulShutdown(signal) {
  process.on(signal, () => {
    server.close(() => {
      db.close();
      process.exit(0);
    });
  });
}

gracefulShutdown('SIGINT');
gracefulShutdown('SIGTERM');

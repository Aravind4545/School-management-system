import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../data');
const dbPath = process.env.DB_PATH || path.join(dataDir, 'portal.sqlite');
const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
}

initSchema();

function normalizeSql(sql) {
  return sql
    .replace(/:(\w+)/g, '@$1')
    .replace(/\bRAND\(\)/gi, 'RANDOM()')
    .replace(/\bNOW\(\)/gi, "datetime('now')");
}

const pool = {
  query: async (sql, params = {}) => {
    const normalized = normalizeSql(sql);
    const isSelect = /^\s*(SELECT|WITH)/i.test(normalized.trim());
    const stmt = db.prepare(normalized);

    if (isSelect) {
      const rows = stmt.all(params);
      return [rows];
    }

    const info = stmt.run(params);
    return [{ insertId: Number(info.lastInsertRowid), affectedRows: info.changes }];
  },

  getDb: () => db,
};

export default pool;

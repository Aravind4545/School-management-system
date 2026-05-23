import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';

export const getPapers = async (req, res, next) => {
  try {
    const { module, category, subject, year } = req.query;
    let sql = `SELECT id, module, category, subject, year, title, file_path, created_at FROM previous_papers WHERE 1=1`;
    const params = {};
    if (module) { sql += ` AND module = :module`; params.module = module; }
    if (category) { sql += ` AND category = :category`; params.category = category; }
    if (subject) { sql += ` AND subject = :subject`; params.subject = subject; }
    if (year) { sql += ` AND year = :year`; params.year = year; }
    sql += ` ORDER BY year DESC, title ASC`;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const getImportantBits = async (req, res, next) => {
  try {
    const { subject } = req.query;
    let sql = `SELECT * FROM important_bits`;
    const params = {};
    if (subject) { sql += ` WHERE subject = :subject`; params.subject = subject; }
    sql += ` ORDER BY subject, chapter`;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const downloadFile = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT file_path, title FROM previous_papers WHERE id = :id`, {
      id: req.params.id,
    });
    if (!rows.length) return res.status(404).json({ message: 'File not found' });

    const filePath = rows[0].file_path;
    if (filePath.startsWith('/samples/')) {
      return res.json({
        url: filePath,
        title: rows[0].title,
        message: 'Sample PDF - place files in frontend/public/samples/',
      });
    }

    const fullPath = path.join(process.env.UPLOAD_DIR || './uploads', path.basename(filePath));
    if (!fs.existsSync(fullPath)) return res.status(404).json({ message: 'File not on server' });
    res.download(fullPath, `${rows[0].title}.pdf`);
  } catch (err) {
    next(err);
  }
};

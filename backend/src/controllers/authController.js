import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export const studentLogin = async (req, res, next) => {
  try {
    const { pin, password } = req.body;
    const [rows] = await pool.query(
      `SELECT id, pin, password_hash, must_change_password, name FROM students WHERE pin = :pin AND is_active = 1`,
      { pin }
    );
    if (!rows.length) return res.status(401).json({ message: 'Invalid PIN or password' });

    const student = rows[0];
    const valid = await bcrypt.compare(password, student.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid PIN or password' });

    const token = signToken({ id: student.id, pin: student.pin, role: 'student', name: student.name });
    res.json({
      token,
      user: {
        id: student.id,
        pin: student.pin,
        name: student.name,
        role: 'student',
        mustChangePassword: !!student.must_change_password,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      `UPDATE students SET password_hash = :hash, must_change_password = 0 WHERE id = :id`,
      { hash, id: req.user.id }
    );
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query(`SELECT * FROM admins WHERE email = :email`, { email });
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: admin.id, email: admin.email, role: 'admin', name: admin.name });
    res.json({ token, user: { id: admin.id, email: admin.email, name: admin.name, role: 'admin' } });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    if (req.user.role === 'student') {
      const [rows] = await pool.query(
        `SELECT id, pin, name, college, must_change_password FROM students WHERE id = :id`,
        { id: req.user.id }
      );
      const [badges] = await pool.query(`SELECT level, badge_type FROM badges WHERE student_id = :id`, {
        id: req.user.id,
      });
      return res.json({ ...rows[0], role: 'student', mustChangePassword: !!rows[0]?.must_change_password, badges });
    }
    const [rows] = await pool.query(`SELECT id, email, name FROM admins WHERE id = :id`, { id: req.user.id });
    res.json({ ...rows[0], role: 'admin' });
  } catch (err) {
    next(err);
  }
};

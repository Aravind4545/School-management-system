import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import pool from '../config/db.js';
import { rotateMockSets } from '../services/mockService.js';

dotenv.config();

const subjects = ['physics', 'chemistry', 'mathematics', 'botany', 'zoology'];
const eamcetSubjects = ['physics', 'chemistry', 'mathematics'];
const levels = ['easy', 'intermediate', 'hard'];

const questionTemplates = {
  physics: [
    { q: 'SI unit of force is?', a: 'Newton', b: 'Joule', c: 'Watt', d: 'Pascal', ans: 'A' },
    { q: 'Acceleration due to gravity (approx) is?', a: '9.8 m/s²', b: '98 m/s²', c: '0.98 m/s²', d: '980 m/s²', ans: 'A' },
    { q: 'Ohm\'s law relates?', a: 'V, I, R', b: 'P, V, I', c: 'F, m, a', d: 'E, q, d', ans: 'A' },
    { q: 'Lens formula is?', a: '1/f = 1/v - 1/u', b: 'F = ma', c: 'PV = nRT', d: 'E = mc²', ans: 'A' },
    { q: 'Unit of power is?', a: 'Watt', b: 'Newton', c: 'Ampere', d: 'Volt', ans: 'A' },
  ],
  chemistry: [
    { q: 'Atomic number of Carbon is?', a: '6', b: '12', c: '14', d: '8', ans: 'A' },
    { q: 'pH of pure water at 25°C is?', a: '7', b: '0', c: '14', d: '1', ans: 'A' },
    { q: 'Avogadro number is approximately?', a: '6.022×10²³', b: '3.14×10²³', c: '9.8×10²³', d: '1.6×10⁻¹⁹', ans: 'A' },
    { q: 'Strongest acid among these?', a: 'HCl', b: 'CH₃COOH', c: 'H₂CO₃', d: 'NH₄OH', ans: 'A' },
    { q: 'Hybridization in CH₄ is?', a: 'sp³', b: 'sp²', c: 'sp', d: 'dsp²', ans: 'A' },
  ],
  mathematics: [
    { q: 'Derivative of sin x is?', a: 'cos x', b: '-cos x', c: 'sin x', d: '-sin x', ans: 'A' },
    { q: '∫ x dx equals?', a: 'x²/2 + C', b: 'x + C', c: 'x² + C', d: '1/x + C', ans: 'A' },
    { q: 'Value of sin 90° is?', a: '1', b: '0', c: '-1', d: '√2/2', ans: 'A' },
    { q: 'Sum of first n natural numbers?', a: 'n(n+1)/2', b: 'n²', c: 'n(n-1)/2', d: '2n', ans: 'A' },
    { q: 'log₁₀ 100 equals?', a: '2', b: '10', c: '100', d: '1', ans: 'A' },
  ],
  botany: [
    { q: 'Site of photosynthesis is?', a: 'Chloroplast', b: 'Mitochondria', c: 'Nucleus', d: 'Ribosome', ans: 'A' },
    { q: 'Male gametophyte in angiosperms is?', a: 'Pollen grain', b: 'Embryo sac', c: 'Ovule', d: 'Seed', ans: 'A' },
    { q: 'Transpiration occurs mainly through?', a: 'Stomata', b: 'Lenticels', c: 'Cuticle', d: 'Phloem', ans: 'A' },
    { q: 'Double fertilization occurs in?', a: 'Angiosperms', b: 'Gymnosperms', c: 'Pteridophytes', d: 'Bryophytes', ans: 'A' },
    { q: 'DNA is found in?', a: 'Nucleus', b: 'Vacuole only', c: 'Cell wall', d: 'Middle lamella', ans: 'A' },
  ],
  zoology: [
    { q: 'Functional unit of kidney is?', a: 'Nephron', b: 'Neuron', c: 'Alveolus', d: 'Villus', ans: 'A' },
    { q: 'Human heart has how many chambers?', a: '4', b: '2', c: '3', d: '6', ans: 'A' },
    { q: 'Insulin is secreted by?', a: 'Beta cells', b: 'Alpha cells', c: 'Delta cells', d: 'Thyroid', ans: 'A' },
    { q: 'Largest organ in human body?', a: 'Skin', b: 'Liver', c: 'Brain', d: 'Heart', ans: 'A' },
    { q: 'Universal donor blood group?', a: 'O negative', b: 'AB positive', c: 'A positive', d: 'B negative', ans: 'A' },
  ],
};

async function seed() {
  console.log('Seeding database...');
  const db = (await import('../config/db.js')).default.getDb();
  db.pragma('foreign_keys = OFF');
  const tables = [
    'rankings', 'student_results', 'mock_attempt_answers', 'mock_attempts',
    'quiz_attempt_answers', 'quiz_attempts', 'mock_test_questions', 'mock_tests',
    'badges', 'quiz_questions', 'important_bits', 'previous_papers', 'students', 'admins',
  ];
  for (const t of tables) db.exec(`DELETE FROM ${t}`);
  db.pragma('foreign_keys = ON');

  const adminHash = await bcrypt.hash('Admin@123', 12);
  await pool.query(`INSERT INTO admins (email, password_hash, name) VALUES (:email, :hash, :name)`, {
    email: 'admin@portal.com',
    hash: adminHash,
    name: 'Portal Admin',
  });

  const students = [
    { pin: 'STU001', name: 'Ravi Kumar', college: 'Sri Chaitanya Jr College' },
    { pin: 'STU002', name: 'Priya Sharma', college: 'Narayana Jr College' },
    { pin: 'STU003', name: 'Arjun Reddy', college: 'FIITJEE Academy', changed: true },
  ];

  for (const s of students) {
    const hash = await bcrypt.hash(s.pin, 12);
    await pool.query(
      `INSERT INTO students (pin, password_hash, name, college, must_change_password) VALUES (:pin, :hash, :name, :college, :mc)`,
      { pin: s.pin, hash, name: s.name, college: s.college, mc: s.changed ? 0 : 1 }
    );
  }

  const papers = [
    ['ipe', 'syllabus', 'Mathematics', null, 'IPE Mathematics Syllabus 2025-26', '/samples/math-syllabus.pdf'],
    ['ipe', 'syllabus', 'Physics', null, 'IPE Physics Syllabus 2025-26', '/samples/physics-syllabus.pdf'],
    ['ipe', 'syllabus', 'Chemistry', null, 'IPE Chemistry Syllabus 2025-26', '/samples/chemistry-syllabus.pdf'],
    ['ipe', 'syllabus', 'Botany', null, 'IPE Botany Syllabus 2025-26', '/samples/botany-syllabus.pdf'],
    ['ipe', 'syllabus', 'Zoology', null, 'IPE Zoology Syllabus 2025-26', '/samples/zoology-syllabus.pdf'],
    ['ipe', 'pyq', 'Mathematics', 2024, 'IPE Maths Paper 2024', '/samples/math-2024.pdf'],
    ['ipe', 'pyq', 'Physics', 2024, 'IPE Physics Paper 2024', '/samples/physics-2024.pdf'],
    ['ipe', 'pyq', 'Chemistry', 2023, 'IPE Chemistry Paper 2023', '/samples/chem-2023.pdf'],
    ['eamcet', 'syllabus', 'EAMCET', null, 'EAMCET Complete Syllabus', '/samples/eamcet-syllabus.pdf'],
    ['eamcet', 'pyq', 'Combined', 2024, 'EAMCET Paper 2024', '/samples/eamcet-2024.pdf'],
    ['eamcet', 'pyq', 'Combined', 2023, 'EAMCET Paper 2023', '/samples/eamcet-2023.pdf'],
  ];
  for (const p of papers) {
    await pool.query(
      `INSERT INTO previous_papers (module, category, subject, year, title, file_path) VALUES (:m, :c, :s, :y, :t, :f)`,
      { m: p[0], c: p[1], s: p[2], y: p[3], t: p[4], f: p[5] }
    );
  }

  const bits = [
    ['Mathematics', 'Calculus', 'repeated', 'Limits frequently asked', 'Evaluate lim(x→0) sin x / x — appears almost every year.'],
    ['Physics', 'Mechanics', 'concept', 'Newton Laws Application', 'Focus on frictionless incline and pulley systems.'],
    ['Chemistry', 'Organic', 'bit', 'Named Reactions', 'Cannizzaro, Aldol, Friedel-Crafts — high weightage bits.'],
    ['Botany', 'Plant Physiology', 'repeated', 'Photosynthesis stages', 'Light and dark reactions — diagram-based questions common.'],
    ['Zoology', 'Human Physiology', 'concept', 'Heart structure', 'Chambers, valves, and blood circulation path.'],
  ];
  for (const b of bits) {
    await pool.query(
      `INSERT INTO important_bits (subject, chapter, content_type, title, body) VALUES (:s, :c, :ct, :t, :b)`,
      { s: b[0], c: b[1], ct: b[2], t: b[3], b: b[4] }
    );
  }

  let qNum = 0;
  for (const level of levels) {
    for (const subject of subjects) {
      const templates = questionTemplates[subject];
      for (let i = 0; i < 30; i++) {
        const t = templates[i % templates.length];
        const variant = ` (${level} #${i + 1})`;
        await pool.query(
          `INSERT INTO quiz_questions (subject, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option)
           VALUES (:subject, :difficulty, :q, :a, :b, :c, :d, :ans)`,
          {
            subject,
            difficulty: level,
            q: t.q + variant,
            a: t.a,
            b: t.b,
            c: t.c,
            d: t.d,
            ans: t.ans,
          }
        );
        qNum++;
      }
    }
  }

  await rotateMockSets();

  console.log(`Seed complete: ${qNum} questions, ${students.length} students, admin@portal.com / Admin@123`);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

-- SQLite schema for AP Inter & EAMCET Portal

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pin TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  must_change_password INTEGER DEFAULT 1,
  name TEXT NOT NULL,
  college TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  level TEXT NOT NULL CHECK(level IN ('easy','intermediate','hard')),
  badge_type TEXT NOT NULL CHECK(badge_type IN ('bronze','silver','gold')),
  earned_at TEXT DEFAULT (datetime('now')),
  UNIQUE (student_id, level),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS previous_papers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module TEXT NOT NULL CHECK(module IN ('ipe','eamcet')),
  category TEXT NOT NULL CHECK(category IN ('syllabus','pyq','important')),
  subject TEXT,
  year INTEGER,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paper_id INTEGER,
  subject TEXT NOT NULL CHECK(subject IN ('physics','chemistry','mathematics','botany','zoology')),
  difficulty TEXT NOT NULL CHECK(difficulty IN ('easy','intermediate','hard')),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL,
  explanation TEXT,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (paper_id) REFERENCES previous_papers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  level TEXT NOT NULL CHECK(level IN ('easy','intermediate','hard')),
  started_at TEXT DEFAULT (datetime('now')),
  submitted_at TEXT,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 25,
  time_spent_sec INTEGER DEFAULT 0,
  violations INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress','submitted','auto_submitted')),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  selected_option TEXT,
  is_correct INTEGER,
  answered_at TEXT,
  UNIQUE (attempt_id, question_id),
  FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mock_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  set_code TEXT NOT NULL CHECK(set_code IN ('A','B','C')),
  title TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  is_active INTEGER DEFAULT 0,
  archived INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mock_test_questions (
  mock_test_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  section TEXT NOT NULL CHECK(section IN ('physics','chemistry','mathematics')),
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (mock_test_id, question_id),
  FOREIGN KEY (mock_test_id) REFERENCES mock_tests(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mock_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  mock_test_id INTEGER NOT NULL,
  started_at TEXT DEFAULT (datetime('now')),
  submitted_at TEXT,
  score INTEGER DEFAULT 0,
  physics_score INTEGER DEFAULT 0,
  chemistry_score INTEGER DEFAULT 0,
  mathematics_score INTEGER DEFAULT 0,
  violations INTEGER DEFAULT 0,
  time_spent_sec INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress','submitted','auto_submitted')),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (mock_test_id) REFERENCES mock_tests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mock_attempt_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  selected_option TEXT,
  is_correct INTEGER,
  answered_at TEXT,
  UNIQUE (attempt_id, question_id),
  FOREIGN KEY (attempt_id) REFERENCES mock_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  attempt_type TEXT NOT NULL CHECK(attempt_type IN ('quiz','mock')),
  attempt_id INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  max_marks INTEGER NOT NULL,
  accuracy REAL,
  time_analysis_json TEXT,
  subject_analysis_json TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rankings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  attempt_type TEXT NOT NULL CHECK(attempt_type IN ('quiz','mock')),
  reference_id INTEGER NOT NULL,
  attempt_id INTEGER NOT NULL,
  overall_rank INTEGER NOT NULL,
  percentile REAL,
  total_participants INTEGER,
  computed_at TEXT DEFAULT (datetime('now')),
  UNIQUE (attempt_type, reference_id, student_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS important_bits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT NOT NULL,
  chapter TEXT,
  content_type TEXT NOT NULL CHECK(content_type IN ('repeated','concept','bit')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_quiz_difficulty ON quiz_questions(difficulty, is_active);
CREATE INDEX IF NOT EXISTS idx_papers_module ON previous_papers(module, category);

import * as SQLite from 'expo-sqlite';
import { User, TestSession, Question, Subject } from '../types';

const db = SQLite.openDatabaseSync('quizmaster.db');

export const initDatabase = () => {
  try {
    // Create Users table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Create Subjects table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        description TEXT NOT NULL
      );
    `);

    // Create TestSessions table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS test_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        subject_name TEXT NOT NULL,
        question_count INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        score REAL,
        time_taken INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
      );
    `);

    // Create Questions table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        question_text TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_answer INTEGER NOT NULL,
        user_answer INTEGER,
        is_correct INTEGER,
        FOREIGN KEY (session_id) REFERENCES test_sessions(id)
      );
    `);

    // Create Analytics table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS analytics (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        daily_streak INTEGER DEFAULT 0,
        last_test_date TEXT,
        total_tests INTEGER DEFAULT 0,
        total_questions INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Insert default subjects
    insertDefaultSubjects();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

const insertDefaultSubjects = () => {
  const subjects: Subject[] = [
    {
      id: 'aptitude',
      name: 'Aptitude',
      icon: '🧮',
      color: JSON.stringify(['#FF6B6B', '#FF8E53']),
      description: 'Numerical and logical reasoning'
    },
    {
      id: 'reasoning',
      name: 'Reasoning',
      icon: '🧠',
      color: JSON.stringify(['#4ECDC4', '#44A08D']),
      description: 'Analytical and critical thinking'
    },
    {
      id: 'coding',
      name: 'Coding Pseudo Codes',
      icon: '💻',
      color: JSON.stringify(['#A8E6CF', '#3DDC84']),
      description: 'Programming logic and algorithms'
    },
    {
      id: 'technical',
      name: 'Technical',
      icon: '⚙️',
      color: JSON.stringify(['#FFD93D', '#FFA500']),
      description: 'Technical concepts and knowledge'
    },
    {
      id: 'verbal',
      name: 'Verbal',
      icon: '📚',
      color: JSON.stringify(['#A78BFA', '#8B5CF6']),
      description: 'Language and communication skills'
    }
  ];

  subjects.forEach(subject => {
    try {
      db.runSync(
        'INSERT OR IGNORE INTO subjects (id, name, icon, color, description) VALUES (?, ?, ?, ?, ?)',
        [subject.id, subject.name, subject.icon, subject.color, subject.description]
      );
    } catch (error) {
      console.log('Subject already exists:', subject.name);
    }
  });
};

// User operations
export const createUser = (user: Omit<User, 'id'> & { passwordHash: string }) => {
  const id = Date.now().toString();
  db.runSync(
    'INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, user.name, user.email, user.passwordHash, user.createdAt]
  );
  return id;
};

export const getUserByEmail = (email: string) => {
  const result = db.getFirstSync<any>(
    'SELECT id, name, email, password_hash as passwordHash, created_at as createdAt FROM users WHERE email = ?',
    [email]
  );
  return result;
};

export const getUserById = (id: string): User | null => {
  const result = db.getFirstSync<any>(
    'SELECT id, name, email, created_at as createdAt FROM users WHERE id = ?',
    [id]
  );
  return result;
};

// Subject operations
export const getAllSubjects = (): Subject[] => {
  const results = db.getAllSync<any>('SELECT * FROM subjects');
  return results.map(row => ({
    ...row,
    color: JSON.parse(row.color)
  }));
};

export const getSubjectById = (id: string): Subject | null => {
  const result = db.getFirstSync<any>('SELECT * FROM subjects WHERE id = ?', [id]);
  if (result) {
    return {
      ...result,
      color: JSON.parse(result.color)
    };
  }
  return null;
};

// Test Session operations
export const createTestSession = (session: Omit<TestSession, 'id'>) => {
  const id = Date.now().toString();
  db.runSync(
    'INSERT INTO test_sessions (id, user_id, subject_id, subject_name, question_count, created_at, completed) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, session.userId, session.subjectId, session.subjectName, session.questionCount, session.createdAt, 0]
  );
  return id;
};

export const updateTestSession = (id: string, updates: Partial<TestSession>) => {
  const fields = [];
  const values = [];

  if (updates.completed !== undefined) {
    fields.push('completed = ?');
    values.push(updates.completed ? 1 : 0);
  }
  if (updates.score !== undefined) {
    fields.push('score = ?');
    values.push(updates.score);
  }
  if (updates.timeTaken !== undefined) {
    fields.push('time_taken = ?');
    values.push(updates.timeTaken);
  }

  if (fields.length > 0) {
    values.push(id);
    db.runSync(
      `UPDATE test_sessions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }
};

export const getTestSessionsByUserId = (userId: string): TestSession[] => {
  const results = db.getAllSync<any>(
    'SELECT * FROM test_sessions WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return results.map(row => ({
    id: row.id,
    userId: row.user_id,
    subjectId: row.subject_id,
    subjectName: row.subject_name,
    questionCount: row.question_count,
    createdAt: row.created_at,
    completed: row.completed === 1,
    score: row.score,
    timeTaken: row.time_taken
  }));
};

export const getTestSessionById = (id: string): TestSession | null => {
  const result = db.getFirstSync<any>('SELECT * FROM test_sessions WHERE id = ?', [id]);
  if (result) {
    return {
      id: result.id,
      userId: result.user_id,
      subjectId: result.subject_id,
      subjectName: result.subject_name,
      questionCount: result.question_count,
      createdAt: result.created_at,
      completed: result.completed === 1,
      score: result.score,
      timeTaken: result.time_taken
    };
  }
  return null;
};

// Question operations
export const saveQuestions = (questions: Question[]) => {
  questions.forEach(q => {
    db.runSync(
      'INSERT INTO questions (id, session_id, question_text, options, correct_answer, user_answer, is_correct) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [q.id, q.sessionId, q.questionText, JSON.stringify(q.options), q.correctAnswer, q.userAnswer ?? null, q.isCorrect ? 1 : 0]
    );
  });
};

export const updateQuestion = (id: string, userAnswer: number, isCorrect: boolean) => {
  db.runSync(
    'UPDATE questions SET user_answer = ?, is_correct = ? WHERE id = ?',
    [userAnswer, isCorrect ? 1 : 0, id]
  );
};

export const getQuestionsBySessionId = (sessionId: string): Question[] => {
  const results = db.getAllSync<any>(
    'SELECT * FROM questions WHERE session_id = ?',
    [sessionId]
  );
  return results.map(row => ({
    id: row.id,
    sessionId: row.session_id,
    questionText: row.question_text,
    options: JSON.parse(row.options),
    correctAnswer: row.correct_answer,
    userAnswer: row.user_answer,
    isCorrect: row.is_correct === 1
  }));
};

// Analytics operations
export const initUserAnalytics = (userId: string) => {
  const id = Date.now().toString();
  db.runSync(
    'INSERT OR IGNORE INTO analytics (id, user_id, daily_streak, total_tests, total_questions, correct_answers) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, 0, 0, 0, 0]
  );
};

export const updateAnalytics = (userId: string, questionsAnswered: number, correctAnswers: number) => {
  const analytics = db.getFirstSync<any>(
    'SELECT * FROM analytics WHERE user_id = ?',
    [userId]
  );

  if (analytics) {
    const today = new Date().toISOString().split('T')[0];
    const lastTestDate = analytics.last_test_date;
    let newStreak = analytics.daily_streak;

    if (lastTestDate) {
      const lastDate = new Date(lastTestDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    db.runSync(
      'UPDATE analytics SET total_tests = total_tests + 1, total_questions = total_questions + ?, correct_answers = correct_answers + ?, daily_streak = ?, last_test_date = ? WHERE user_id = ?',
      [questionsAnswered, correctAnswers, newStreak, today, userId]
    );
  }
};

export const getAnalytics = (userId: string) => {
  const result = db.getFirstSync<any>(
    'SELECT * FROM analytics WHERE user_id = ?',
    [userId]
  );
  return result;
};

export default db;

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string[];
  description: string;
}

export interface Question {
  id: string;
  sessionId: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
  isCorrect?: boolean;
}

export interface TestSession {
  id: string;
  userId: string;
  subjectId: string;
  subjectName: string;
  questionCount: number;
  createdAt: string;
  completed: boolean;
  score?: number;
  timeTaken?: number;
  questions?: Question[];
}

export interface Analytics {
  totalTests: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  dailyStreak: number;
  lastTestDate: string;
  subjectWiseStats: SubjectStats[];
  recentActivity: ActivityItem[];
}

export interface SubjectStats {
  subjectId: string;
  subjectName: string;
  totalTests: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageScore: number;
}

export interface ActivityItem {
  date: string;
  testsCompleted: number;
  questionsAnswered: number;
  accuracy: number;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface QuizContextType {
  currentSession: TestSession | null;
  currentQuestionIndex: number;
  timeRemaining: number;
  startQuiz: (subjectId: string, questionCount: number) => Promise<void>;
  submitAnswer: (questionId: string, answer: number) => void;
  nextQuestion: () => void;
  finishQuiz: () => Promise<void>;
  resetQuiz: () => void;
}

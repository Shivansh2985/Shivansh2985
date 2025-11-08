import React, { createContext, useState, useContext, useEffect } from 'react';
import { QuizContextType, TestSession, Question } from '../types';
import { useAuth } from './AuthContext';
import { generateQuestions } from '../services/geminiService';
import {
  createTestSession,
  updateTestSession,
  saveQuestions,
  updateQuestion,
  getQuestionsBySessionId,
  getSubjectById,
  updateAnalytics
} from '../database';

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentSession && !currentSession.completed && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession, timeRemaining]);

  const startQuiz = async (subjectId: string, questionCount: number) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const subject = getSubjectById(subjectId);
      if (!subject) throw new Error('Subject not found');

      // Create test session
      const sessionId = createTestSession({
        userId: user.id,
        subjectId: subject.id,
        subjectName: subject.name,
        questionCount,
        createdAt: new Date().toISOString(),
        completed: false
      });

      // Generate questions using Gemini API
      const generatedQuestions = await generateQuestions(
        subject.name,
        questionCount,
        sessionId
      );

      // Save questions to database
      saveQuestions(generatedQuestions);

      // Set up quiz state
      const session: TestSession = {
        id: sessionId,
        userId: user.id,
        subjectId: subject.id,
        subjectName: subject.name,
        questionCount,
        createdAt: new Date().toISOString(),
        completed: false,
        questions: generatedQuestions
      };

      setCurrentSession(session);
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setTimeRemaining(questionCount * 60); // 1 minute per question
    } catch (error) {
      console.error('Error starting quiz:', error);
      throw error;
    }
  };

  const submitAnswer = (questionId: string, answer: number) => {
    if (!currentSession) return;

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const isCorrect = answer === question.correctAnswer;

    // Update question in database
    updateQuestion(questionId, answer, isCorrect);

    // Update local state
    const updatedQuestions = questions.map(q =>
      q.id === questionId
        ? { ...q, userAnswer: answer, isCorrect }
        : q
    );
    setQuestions(updatedQuestions);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const finishQuiz = async () => {
    if (!currentSession || !user) return;

    try {
      const correctAnswers = questions.filter(q => q.isCorrect).length;
      const score = (correctAnswers / questions.length) * 100;
      const timeTaken = (currentSession.questionCount * 60) - timeRemaining;

      // Update test session
      updateTestSession(currentSession.id, {
        completed: true,
        score,
        timeTaken
      });

      // Update analytics
      updateAnalytics(user.id, questions.length, correctAnswers);

      // Update current session state
      setCurrentSession({
        ...currentSession,
        completed: true,
        score,
        timeTaken
      });
    } catch (error) {
      console.error('Error finishing quiz:', error);
      throw error;
    }
  };

  const resetQuiz = () => {
    setCurrentSession(null);
    setCurrentQuestionIndex(0);
    setTimeRemaining(0);
    setQuestions([]);
  };

  const loadExistingSession = (sessionId: string) => {
    // Load questions for an existing session
    const sessionQuestions = getQuestionsBySessionId(sessionId);
    setQuestions(sessionQuestions);
  };

  return (
    <QuizContext.Provider
      value={{
        currentSession,
        currentQuestionIndex,
        timeRemaining,
        startQuiz,
        submitAnswer,
        nextQuestion,
        finishQuiz,
        resetQuiz
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

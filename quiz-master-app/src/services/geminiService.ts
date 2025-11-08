import { GoogleGenerativeAI } from '@google/generative-ai';
import { Question } from '../types';

// Initialize Gemini API
// Note: In production, store API key securely
const API_KEY = 'AIzaSyDGXt8g_YOuKqLqLqLqLqLqLqLqLqLqLqL'; // Replace with actual key
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateQuestions = async (
  subject: string,
  count: number,
  sessionId: string
): Promise<Question[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate ${count} multiple choice questions (MCQ) for the subject: ${subject}.

Requirements:
1. Each question should have exactly 4 options (A, B, C, D)
2. Questions should be challenging and relevant to ${subject}
3. Include the correct answer index (0-3)
4. Format the response as a JSON array

Example format:
[
  {
    "question": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": 1
  }
]

Generate ${count} questions now in valid JSON format only, no additional text:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const questionsData = JSON.parse(jsonText);

    // Transform to our Question format
    const questions: Question[] = questionsData.map((q: any, index: number) => ({
      id: `${sessionId}_q${index}`,
      sessionId,
      questionText: q.question || q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      userAnswer: undefined,
      isCorrect: undefined
    }));

    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    
    // Fallback: Generate sample questions if API fails
    return generateFallbackQuestions(subject, count, sessionId);
  }
};

// Fallback questions in case API fails
const generateFallbackQuestions = (
  subject: string,
  count: number,
  sessionId: string
): Question[] => {
  const templates: { [key: string]: any[] } = {
    aptitude: [
      {
        question: 'If a train travels 120 km in 2 hours, what is its average speed?',
        options: ['50 km/h', '60 km/h', '70 km/h', '80 km/h'],
        correctAnswer: 1
      },
      {
        question: 'What is 15% of 200?',
        options: ['25', '30', '35', '40'],
        correctAnswer: 1
      },
      {
        question: 'If x + 5 = 12, what is x?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 2
      }
    ],
    reasoning: [
      {
        question: 'Complete the series: 2, 4, 8, 16, ?',
        options: ['24', '28', '32', '36'],
        correctAnswer: 2
      },
      {
        question: 'If all roses are flowers and some flowers are red, which is true?',
        options: ['All roses are red', 'Some roses may be red', 'No roses are red', 'All flowers are roses'],
        correctAnswer: 1
      }
    ],
    coding: [
      {
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        correctAnswer: 1
      },
      {
        question: 'Which data structure uses LIFO principle?',
        options: ['Queue', 'Stack', 'Array', 'Tree'],
        correctAnswer: 1
      }
    ],
    technical: [
      {
        question: 'What does HTTP stand for?',
        options: ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'HyperText Transmission Protocol', 'High Text Transfer Protocol'],
        correctAnswer: 0
      },
      {
        question: 'Which is not a programming paradigm?',
        options: ['Object-Oriented', 'Functional', 'Procedural', 'Sequential'],
        correctAnswer: 3
      }
    ],
    verbal: [
      {
        question: 'Choose the synonym of "abundant":',
        options: ['Scarce', 'Plentiful', 'Limited', 'Rare'],
        correctAnswer: 1
      },
      {
        question: 'What is the antonym of "ancient"?',
        options: ['Old', 'Modern', 'Historic', 'Traditional'],
        correctAnswer: 1
      }
    ]
  };

  const subjectTemplates = templates[subject.toLowerCase()] || templates.aptitude;
  const questions: Question[] = [];

  for (let i = 0; i < count; i++) {
    const template = subjectTemplates[i % subjectTemplates.length];
    questions.push({
      id: `${sessionId}_q${i}`,
      sessionId,
      questionText: `${template.question} (Question ${i + 1})`,
      options: template.options,
      correctAnswer: template.correctAnswer,
      userAnswer: undefined,
      isCorrect: undefined
    });
  }

  return questions;
};

export default {
  generateQuestions
};

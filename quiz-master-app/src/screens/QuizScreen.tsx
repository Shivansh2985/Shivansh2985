import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuiz } from '../context/QuizContext';
import QuestionCard from '../components/QuestionCard';
import GradientButton from '../components/GradientButton';
import * as Haptics from 'expo-haptics';

const QuizScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    currentSession,
    currentQuestionIndex,
    timeRemaining,
    submitAnswer,
    nextQuestion,
    finishQuiz,
  } = useQuiz();

  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Reset selected answer when question changes
    setSelectedAnswer(undefined);
  }, [currentQuestionIndex]);

  if (!currentSession || !currentSession.questions) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const currentQuestion = currentSession.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentSession.questions.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === undefined) {
      Alert.alert('Please select an answer', 'You must select an answer before proceeding.');
      return;
    }

    submitAnswer(currentQuestion.id, selectedAnswer);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (currentQuestionIndex < currentSession.questions!.length - 1) {
      nextQuestion();
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    if (selectedAnswer !== undefined) {
      submitAnswer(currentQuestion.id, selectedAnswer);
    }
    
    await finishQuiz();
    navigation.replace('Results');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.questionCounter}>
            <Text style={styles.questionCounterText}>
              Question {currentQuestionIndex + 1}/{currentSession.questions.length}
            </Text>
          </View>
          <View style={styles.timer}>
            <Text style={styles.timerText}>⏱️ {formatTime(timeRemaining)}</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <QuestionCard
          question={currentQuestion.questionText}
          options={currentQuestion.options}
          selectedAnswer={selectedAnswer}
          showAnswer={false}
          onSelectAnswer={handleSelectAnswer}
        />

        <View style={styles.buttonContainer}>
          <GradientButton
            title={
              currentQuestionIndex < currentSession.questions.length - 1
                ? 'Next Question'
                : 'Finish Quiz'
            }
            onPress={handleNext}
            colors={['#4ECDC4', '#44A08D']}
            disabled={selectedAnswer === undefined}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionCounter: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  questionCounterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  timer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingTop: 16,
  },
});

export default QuizScreen;

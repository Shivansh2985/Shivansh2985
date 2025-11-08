import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuiz } from '../context/QuizContext';
import GradientButton from '../components/GradientButton';

const ResultsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { currentSession, resetQuiz } = useQuiz();

  if (!currentSession || !currentSession.questions) {
    return null;
  }

  const correctAnswers = currentSession.questions.filter(q => q.isCorrect).length;
  const totalQuestions = currentSession.questions.length;
  const score = currentSession.score || 0;
  const accuracy = (correctAnswers / totalQuestions) * 100;

  const getPerformanceMessage = () => {
    if (accuracy >= 90) return { emoji: '🏆', message: 'Outstanding!', color: ['#FFD700', '#FFA500'] };
    if (accuracy >= 75) return { emoji: '🎉', message: 'Great Job!', color: ['#4ECDC4', '#44A08D'] };
    if (accuracy >= 60) return { emoji: '👍', message: 'Good Work!', color: ['#A8E6CF', '#3DDC84'] };
    if (accuracy >= 40) return { emoji: '💪', message: 'Keep Practicing!', color: ['#FFD93D', '#FFA500'] };
    return { emoji: '📚', message: 'Keep Learning!', color: ['#A78BFA', '#8B5CF6'] };
  };

  const performance = getPerformanceMessage();

  const handleGoHome = () => {
    resetQuiz();
    navigation.navigate('Home');
  };

  const handleViewAnswers = () => {
    navigation.navigate('ReviewAnswers', { session: currentSession });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={performance.color}
        style={styles.header}
      >
        <Text style={styles.emoji}>{performance.emoji}</Text>
        <Text style={styles.title}>{performance.message}</Text>
        <Text style={styles.subtitle}>Quiz Completed!</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.scoreCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.scoreGradient}
          >
            <Text style={styles.scoreLabel}>Your Score</Text>
            <Text style={styles.scoreValue}>{score.toFixed(1)}%</Text>
            <Text style={styles.scoreSubtext}>
              {correctAnswers} out of {totalQuestions} correct
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>{correctAnswers}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>❌</Text>
            <Text style={styles.statValue}>{totalQuestions - correctAnswers}</Text>
            <Text style={styles.statLabel}>Wrong</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statValue}>
              {Math.floor((currentSession.timeTaken || 0) / 60)}m
            </Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statValue}>{accuracy.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>

        <View style={styles.subjectInfo}>
          <Text style={styles.subjectLabel}>Subject</Text>
          <Text style={styles.subjectName}>{currentSession.subjectName}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <GradientButton
            title="View Answers"
            onPress={handleViewAnswers}
            colors={['#4ECDC4', '#44A08D']}
            style={styles.button}
          />

          <TouchableOpacity
            onPress={handleGoHome}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  scoreCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  scoreGradient: {
    padding: 32,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  scoreSubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  subjectInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subjectLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  subjectName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
});

export default ResultsScreen;

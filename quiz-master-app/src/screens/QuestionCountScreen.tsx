import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Subject } from '../types';
import { useQuiz } from '../context/QuizContext';
import GradientButton from '../components/GradientButton';

const QuestionCountScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { subject } = route.params as { subject: Subject };
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const { startQuiz } = useQuiz();

  const questionCounts = [10, 20, 30, 40, 50];

  const handleStartQuiz = async () => {
    try {
      setIsLoading(true);
      await startQuiz(subject.id, selectedCount);
      setIsLoading(false);
      navigation.navigate('Quiz');
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Error', error.message || 'Failed to start quiz');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={subject.color}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.icon}>{subject.icon}</Text>
        <Text style={styles.title}>{subject.name}</Text>
        <Text style={styles.description}>{subject.description}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Number of Questions</Text>
          <Text style={styles.sectionSubtitle}>
            Choose how many questions you want to practice
          </Text>

          <View style={styles.countGrid}>
            {questionCounts.map((count) => (
              <TouchableOpacity
                key={count}
                onPress={() => setSelectedCount(count)}
                style={[
                  styles.countCard,
                  selectedCount === count && styles.countCardSelected,
                ]}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    selectedCount === count
                      ? subject.color
                      : ['#F8F9FA', '#F8F9FA']
                  }
                  style={styles.countGradient}
                >
                  <Text
                    style={[
                      styles.countNumber,
                      selectedCount === count && styles.countNumberSelected,
                    ]}
                  >
                    {count}
                  </Text>
                  <Text
                    style={[
                      styles.countLabel,
                      selectedCount === count && styles.countLabelSelected,
                    ]}
                  >
                    Questions
                  </Text>
                  <Text
                    style={[
                      styles.countTime,
                      selectedCount === count && styles.countTimeSelected,
                    ]}
                  >
                    ~{count} mins
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>⏱️</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Time Limit</Text>
              <Text style={styles.infoText}>
                1 minute per question
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>🤖</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>AI Generated</Text>
              <Text style={styles.infoText}>
                Questions powered by Gemini AI
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>📝</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>MCQ Format</Text>
              <Text style={styles.infoText}>
                Multiple choice questions with 4 options
              </Text>
            </View>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={subject.color[0]} />
            <Text style={styles.loadingText}>
              Generating questions with AI...
            </Text>
          </View>
        ) : (
          <GradientButton
            title="Start Quiz"
            onPress={handleStartQuiz}
            colors={subject.color}
            style={styles.startButton}
          />
        )}
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
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    fontSize: 60,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  countGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  countCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  countCardSelected: {
    elevation: 8,
    shadowOpacity: 0.3,
  },
  countGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  countNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  countNumberSelected: {
    color: '#FFFFFF',
  },
  countLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  countLabelSelected: {
    color: '#FFFFFF',
  },
  countTime: {
    fontSize: 11,
    color: '#95A5A6',
  },
  countTimeSelected: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  infoSection: {
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
  },
  startButton: {
    marginBottom: 24,
  },
});

export default QuestionCountScreen;

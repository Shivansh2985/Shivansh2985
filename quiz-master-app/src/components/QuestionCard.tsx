import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface QuestionCardProps {
  question: string;
  options: string[];
  selectedAnswer?: number;
  correctAnswer?: number;
  showAnswer: boolean;
  onSelectAnswer: (index: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  options,
  selectedAnswer,
  correctAnswer,
  showAnswer,
  onSelectAnswer,
}) => {
  const getOptionStyle = (index: number) => {
    if (!showAnswer) {
      return selectedAnswer === index ? styles.selectedOption : styles.option;
    }

    if (index === correctAnswer) {
      return styles.correctOption;
    }

    if (selectedAnswer === index && index !== correctAnswer) {
      return styles.wrongOption;
    }

    return styles.option;
  };

  const getOptionColors = (index: number): string[] => {
    if (!showAnswer) {
      return selectedAnswer === index ? ['#4ECDC4', '#44A08D'] : ['#F8F9FA', '#F8F9FA'];
    }

    if (index === correctAnswer) {
      return ['#3DDC84', '#2ECC71'];
    }

    if (selectedAnswer === index && index !== correctAnswer) {
      return ['#FF6B6B', '#FF5252'];
    }

    return ['#F8F9FA', '#F8F9FA'];
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => !showAnswer && onSelectAnswer(index)}
            disabled={showAnswer}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={getOptionColors(index)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.optionGradient, getOptionStyle(index)]}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionLabel}>
                  <Text style={[
                    styles.optionLabelText,
                    (selectedAnswer === index || index === correctAnswer) && styles.optionLabelTextSelected
                  ]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[
                  styles.optionText,
                  (selectedAnswer === index || index === correctAnswer) && styles.optionTextSelected
                ]}>
                  {option}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionGradient: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  option: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  correctOption: {
    borderWidth: 2,
    borderColor: '#3DDC84',
  },
  wrongOption: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionLabel: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLabelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  optionLabelTextSelected: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default QuestionCard;

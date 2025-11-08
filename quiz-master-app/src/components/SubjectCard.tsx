import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Subject } from '../types';

interface SubjectCardProps {
  subject: Subject;
  onPress: () => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={subject.color}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.icon}>{subject.icon}</Text>
          <Text style={styles.name}>{subject.name}</Text>
          <Text style={styles.description}>{subject.description}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  gradient: {
    padding: 24,
    minHeight: 140,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});

export default SubjectCard;

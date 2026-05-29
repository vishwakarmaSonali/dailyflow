import React from 'react';
import { View, Text, ScrollView, StyleSheet, Button } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
});

export default function HabitsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Habits</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Morning Run</Text>
            <Text style={styles.cardSubtitle}>Streak: 5 days</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.placeholder}>No habits yet. Create one to get started!</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <Button title="Add New Habit" color="#6366f1" />
        </View>
      </View>
    </ScrollView>
  );
}

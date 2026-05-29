import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

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
  placeholder: {
    color: '#9ca3af',
    marginTop: 8,
  },
});

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Habits Completed</Text>
            <Text style={styles.placeholder}>0/5 habits</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Expenses</Text>
            <Text style={styles.placeholder}>$0.00</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Streaks</Text>
          <View style={styles.card}>
            <Text style={styles.placeholder}>No active streaks</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Insights</Text>
          <View style={styles.card}>
            <Text style={styles.placeholder}>Loading insights...</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

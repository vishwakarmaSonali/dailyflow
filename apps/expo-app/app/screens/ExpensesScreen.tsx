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
  cardAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6366f1',
    marginTop: 8,
  },
  placeholder: {
    color: '#9ca3af',
    marginTop: 8,
  },
});

export default function ExpensesScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Spent</Text>
            <Text style={styles.cardAmount}>$0.00</Text>
            <Text style={styles.placeholder}>Budget: $1,000.00</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <View style={styles.card}>
            <Text style={styles.placeholder}>No expenses yet. Add one to get started!</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Button title="Add Expense" color="#6366f1" />
        </View>
      </View>
    </ScrollView>
  );
}

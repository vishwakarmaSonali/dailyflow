import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useHabitsStore } from '../stores/habitsStore';
import { useExpensesStore } from '../stores/expensesStore';
import AppCard from '../components/AppCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  subtext,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  subtext?: string;
  accent?: string;
}) {
  return (
    <AppCard style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, accent ? { color: accent } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
    </AppCard>
  );
}

// ─── Streak Badge ─────────────────────────────────────────────────────────────
function StreakBadge({ name, streak }: { name: string; streak: number }) {
  const emoji = streak >= 30 ? '🔥🔥' : streak >= 7 ? '🔥' : '⚡';
  return (
    <View style={styles.streakBadge}>
      <Text style={styles.streakEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.streakName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.streakDays}>
          {streak} day{streak !== 1 ? 's' : ''} streak
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const {
    habits,
    loading: habitsLoading,
    error: habitsError,
    fetchHabits,
    clearError: clearHabitsError,
  } = useHabitsStore();

  const {
    expenses,
    loading: expensesLoading,
    error: expensesError,
    fetchExpenses,
    clearError: clearExpensesError,
    getTotalThisMonth,
    getRemainingBudget,
  } = useExpensesStore();

  const loading = habitsLoading || expensesLoading;
  const error = habitsError || expensesError;

  const loadData = useCallback(async () => {
    await Promise.allSettled([fetchHabits(), fetchExpenses()]);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const completedToday = habits.filter((h) => h.isCompletedToday).length;
  const totalHabits = habits.length;
  const topStreaks = habits
    .filter((h) => h.streakCount > 0)
    .sort((a, b) => b.streakCount - a.streakCount)
    .slice(0, 3);

  const totalSpent = getTotalThisMonth();
  const remaining = getRemainingBudget();
  const recentExpenses = expenses.slice(0, 5);
  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#6366f1" />
      }
    >
      {/* Error Banner */}
      {error && (
        <ErrorBanner
          message={error}
          onDismiss={() => { clearHabitsError(); clearExpensesError(); }}
          onRetry={loadData}
        />
      )}

      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Good {getTimeOfDay()} 👋</Text>
        <Text style={styles.greetingDate}>
          {now.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard
          icon="✅"
          label="Habits Today"
          value={totalHabits ? `${completedToday}/${totalHabits}` : '—'}
          subtext={totalHabits ? `${Math.round((completedToday / totalHabits) * 100)}% done` : 'No habits yet'}
        />
        <StatCard
          icon="💸"
          label={`Spent (${monthName})`}
          value={`$${totalSpent.toFixed(2)}`}
          subtext={remaining >= 0 ? `$${remaining.toFixed(2)} left` : `$${Math.abs(remaining).toFixed(2)} over`}
          accent={remaining < 0 ? '#ef4444' : undefined}
        />
      </View>

      {/* Streaks Section */}
      <Text style={styles.sectionTitle}>🔥 Top Streaks</Text>
      <AppCard>
        {topStreaks.length === 0 ? (
          <Text style={styles.emptyText}>
            Log a habit to start a streak!
          </Text>
        ) : (
          topStreaks.map((habit) => (
            <StreakBadge key={habit.id} name={habit.name} streak={habit.streakCount} />
          ))
        )}
      </AppCard>

      {/* Today's Habits */}
      <Text style={styles.sectionTitle}>📋 Today's Habits</Text>
      {loading && habits.length === 0 ? (
        <LoadingSpinner message="Loading habits..." />
      ) : habits.length === 0 ? (
        <AppCard>
          <Text style={styles.emptyText}>No habits yet. Go to the Habits tab to add one!</Text>
        </AppCard>
      ) : (
        <AppCard padded={false}>
          {habits.slice(0, 5).map((habit, index) => (
            <View
              key={habit.id}
              style={[
                styles.habitRow,
                index < habits.length - 1 && styles.habitRowBorder,
              ]}
            >
              <View
                style={[
                  styles.habitCheck,
                  habit.isCompletedToday && styles.habitCheckDone,
                ]}
              >
                {habit.isCompletedToday && (
                  <Text style={styles.habitCheckMark}>✓</Text>
                )}
              </View>
              <Text
                style={[
                  styles.habitName,
                  habit.isCompletedToday && styles.habitNameDone,
                ]}
                numberOfLines={1}
              >
                {habit.name}
              </Text>
              {habit.streakCount > 0 && (
                <Text style={styles.habitStreak}>
                  🔥 {habit.streakCount}
                </Text>
              )}
            </View>
          ))}
        </AppCard>
      )}

      {/* Recent Expenses */}
      <Text style={styles.sectionTitle}>💳 Recent Expenses</Text>
      {loading && expenses.length === 0 ? (
        <LoadingSpinner message="Loading expenses..." />
      ) : recentExpenses.length === 0 ? (
        <AppCard>
          <Text style={styles.emptyText}>No expenses yet. Go to the Expenses tab to add one!</Text>
        </AppCard>
      ) : (
        <AppCard padded={false}>
          {recentExpenses.map((expense, index) => (
            <View
              key={expense.id}
              style={[
                styles.expenseRow,
                index < recentExpenses.length - 1 && styles.expenseRowBorder,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.expenseDesc} numberOfLines={1}>
                  {expense.description}
                </Text>
                <Text style={styles.expenseCat}>{expense.category}</Text>
              </View>
              <Text style={styles.expenseAmount}>
                -${expense.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </AppCard>
      )}
    </ScrollView>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 32 },

  greeting: { marginBottom: 16 },
  greetingText: { fontSize: 22, fontWeight: '700', color: '#111827' },
  greetingDate: { fontSize: 13, color: '#6b7280', marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#6366f1' },
  statLabel: { fontSize: 12, color: '#6b7280', fontWeight: '500', textAlign: 'center' },
  statSubtext: { fontSize: 11, color: '#9ca3af', marginTop: 2, textAlign: 'center' },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    marginTop: 4,
  },

  emptyText: { color: '#9ca3af', fontSize: 14, textAlign: 'center', paddingVertical: 8 },

  // Streaks
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  streakEmoji: { fontSize: 22 },
  streakName: { fontSize: 14, fontWeight: '600', color: '#374151' },
  streakDays: { fontSize: 12, color: '#6b7280', marginTop: 1 },

  // Habits List
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  habitRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  habitCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitCheckDone: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  habitCheckMark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  habitName: { flex: 1, fontSize: 14, color: '#374151', fontWeight: '500' },
  habitNameDone: { textDecorationLine: 'line-through', color: '#9ca3af' },
  habitStreak: { fontSize: 12, color: '#f97316', fontWeight: '600' },

  // Expenses List
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  expenseRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  expenseDesc: { fontSize: 14, color: '#374151', fontWeight: '500' },
  expenseCat: { fontSize: 12, color: '#9ca3af', marginTop: 1 },
  expenseAmount: { fontSize: 15, fontWeight: '700', color: '#ef4444' },
});

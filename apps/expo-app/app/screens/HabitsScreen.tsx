import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useHabitsStore, Habit } from '../stores/habitsStore';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import AddHabitModal from '../components/AddHabitModal';

// ─── Habit Card ───────────────────────────────────────────────────────────────
function HabitCard({
  habit,
  onLog,
  onDelete,
  isLogging,
}: {
  habit: Habit;
  onLog: (id: string) => void;
  onDelete: (id: string) => void;
  isLogging: boolean;
}) {
  const milestoneColor =
    habit.streakCount >= 100
      ? '#7c3aed'
      : habit.streakCount >= 30
      ? '#dc2626'
      : habit.streakCount >= 7
      ? '#f97316'
      : '#6366f1';

  const handleDelete = () => {
    Alert.alert('Delete Habit', `Delete "${habit.name}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(habit.id) },
    ]);
  };

  return (
    <AppCard style={styles.habitCard}>
      {/* Header */}
      <View style={styles.habitHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.habitName} numberOfLines={1}>
            {habit.name}
          </Text>
          {habit.description ? (
            <Text style={styles.habitDesc} numberOfLines={2}>
              {habit.description}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>

      {/* Meta row */}
      <View style={styles.habitMeta}>
        {/* Frequency badge */}
        <View style={styles.freqBadge}>
          <Text style={styles.freqBadgeText}>{habit.frequency}</Text>
        </View>

        {/* Streak */}
        {habit.streakCount > 0 && (
          <View style={[styles.streakBadge, { borderColor: milestoneColor }]}>
            <Text style={[styles.streakText, { color: milestoneColor }]}>
              🔥 {habit.streakCount} day{habit.streakCount !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Milestone message */}
      {getMilestone(habit.streakCount) && (
        <View style={styles.milestoneRow}>
          <Text style={styles.milestoneText}>
            🏆 {getMilestone(habit.streakCount)}
          </Text>
        </View>
      )}

      {/* Action button */}
      {habit.isCompletedToday ? (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>✅ Completed today</Text>
        </View>
      ) : (
        <AppButton
          title="Log for Today"
          onPress={() => onLog(habit.id)}
          loading={isLogging}
          size="sm"
          style={styles.logButton}
        />
      )}
    </AppCard>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HabitsScreen() {
  const {
    habits,
    loading,
    error,
    actionLoading,
    fetchHabits,
    logHabit,
    deleteHabit,
    clearError,
  } = useHabitsStore();

  const [showAddModal, setShowAddModal] = useState(false);

  const loadHabits = useCallback(() => fetchHabits(), []);

  useEffect(() => {
    loadHabits();
  }, []);

  const handleLog = async (habitId: string) => {
    try {
      await logHabit(habitId);
    } catch {
      Alert.alert('Error', 'Failed to log habit. Please try again.');
    }
  };

  const handleDelete = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
    } catch {
      Alert.alert('Error', 'Failed to delete habit.');
    }
  };

  const completedToday = habits.filter((h) => h.isCompletedToday).length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadHabits} tintColor="#6366f1" />
        }
      >
        {/* Error */}
        {error && (
          <ErrorBanner message={error} onDismiss={clearError} onRetry={loadHabits} />
        )}

        {/* Summary bar */}
        {habits.length > 0 && (
          <AppCard style={styles.summaryCard}>
            <Text style={styles.summaryText}>
              {completedToday}/{habits.length} completed today
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${habits.length ? (completedToday / habits.length) * 100 : 0}%`,
                  },
                ]}
              />
            </View>
          </AppCard>
        )}

        {/* Loading state */}
        {loading && habits.length === 0 ? (
          <LoadingSpinner message="Loading your habits..." fullScreen />
        ) : habits.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="No Habits Yet"
            message="Build positive habits by tracking them daily. Start with something small!"
            actionLabel="Add Your First Habit"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onLog={handleLog}
              onDelete={handleDelete}
              isLogging={actionLoading === habit.id}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      {habits.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Add Habit Modal */}
      <AddHabitModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </View>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getMilestone(streak: number): string | null {
  if (streak >= 100) return '100-Day Milestone! Incredible!';
  if (streak >= 30) return '30-Day Milestone! You\'re on fire!';
  if (streak >= 7) return '7-Day Milestone! Great work!';
  return null;
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 100 },

  summaryCard: { marginBottom: 16 },
  summaryText: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },

  habitCard: { marginBottom: 12 },
  habitHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  habitName: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  habitDesc: { fontSize: 13, color: '#6b7280', marginTop: 3, lineHeight: 18 },
  deleteBtn: { padding: 4, marginLeft: 8 },
  deleteBtnText: { fontSize: 16 },

  habitMeta: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  freqBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  freqBadgeText: { fontSize: 11, color: '#6b7280', fontWeight: '500', textTransform: 'capitalize' },

  streakBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  streakText: { fontSize: 11, fontWeight: '700' },

  milestoneRow: {
    backgroundColor: '#fef9c3',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  milestoneText: { fontSize: 12, color: '#92400e', fontWeight: '600' },

  completedBadge: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  completedText: { fontSize: 13, color: '#166534', fontWeight: '600' },
  logButton: { marginTop: 4 },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30, fontWeight: '300' },
});

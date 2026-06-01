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
import { useExpensesStore, Expense, EXPENSE_CATEGORIES } from '../stores/expensesStore';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import AddExpenseModal from '../components/AddExpenseModal';

// ─── Category icons ────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, string> = {
  'Food & Dining': '🍽️',
  Transportation: '🚗',
  Shopping: '🛍️',
  Entertainment: '🎬',
  'Health & Fitness': '💪',
  'Bills & Utilities': '⚡',
  Travel: '✈️',
  Education: '📚',
  Other: '📦',
};

// ─── Budget Bar ───────────────────────────────────────────────────────────────
function BudgetBar({
  spent,
  budget,
  remaining,
}: {
  spent: number;
  budget: number;
  remaining: number;
}) {
  const pct = Math.min((spent / budget) * 100, 100);
  const overBudget = remaining < 0;

  return (
    <AppCard>
      <View style={styles.budgetHeader}>
        <Text style={styles.budgetTitle}>Monthly Budget</Text>
        <Text style={[styles.budgetStatus, overBudget && { color: '#ef4444' }]}>
          {overBudget
            ? `$${Math.abs(remaining).toFixed(2)} over`
            : `$${remaining.toFixed(2)} left`}
        </Text>
      </View>

      <View style={styles.budgetBar}>
        <View
          style={[
            styles.budgetFill,
            { width: `${pct}%` },
            overBudget && { backgroundColor: '#ef4444' },
          ]}
        />
      </View>

      <View style={styles.budgetFooter}>
        <Text style={styles.budgetSpent}>Spent: ${spent.toFixed(2)}</Text>
        <Text style={styles.budgetTotal}>Budget: ${budget.toFixed(2)}</Text>
      </View>
    </AppCard>
  );
}

// ─── Category Tabs ────────────────────────────────────────────────────────────
function CategoryTabs({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (cat: string | null) => void;
}) {
  const allCategories = [null, ...EXPENSE_CATEGORIES];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
      <View style={styles.tabsRow}>
        {allCategories.map((cat) => (
          <TouchableOpacity
            key={cat ?? 'all'}
            style={[styles.tab, selected === cat && styles.tabActive]}
            onPress={() => onSelect(cat)}
          >
            <Text style={[styles.tabText, selected === cat && styles.tabTextActive]}>
              {cat ? `${CATEGORY_ICONS[cat] ?? '📦'} ${cat.split(' ')[0]}` : '🔀 All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Expense Row ─────────────────────────────────────────────────────────────
function ExpenseRow({
  expense,
  onDelete,
}: {
  expense: Expense;
  onDelete: (id: string) => void;
}) {
  const handleDelete = () => {
    Alert.alert('Delete Expense', `Delete "$${expense.amount.toFixed(2)} – ${expense.description}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(expense.id) },
    ]);
  };

  const date = new Date(expense.date);
  const dateStr = date.toLocaleDateString('default', { month: 'short', day: 'numeric' });

  return (
    <View style={styles.expenseRow}>
      <View style={styles.expenseCatIcon}>
        <Text style={styles.expenseCatIconText}>
          {CATEGORY_ICONS[expense.category] ?? '📦'}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.expenseDesc} numberOfLines={1}>
          {expense.description}
        </Text>
        <Text style={styles.expenseMeta}>
          {expense.category} · {dateStr}
        </Text>
      </View>
      <Text style={styles.expenseAmt}>-${expense.amount.toFixed(2)}</Text>
      <TouchableOpacity onPress={handleDelete} style={styles.expenseDeleteBtn}>
        <Text style={styles.expenseDeleteText}>🗑</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ExpensesScreen() {
  const {
    expenses,
    loading,
    error,
    budget,
    selectedCategory,
    fetchExpenses,
    deleteExpense,
    setSelectedCategory,
    clearError,
    getTotalThisMonth,
    getRemainingBudget,
    getFilteredExpenses,
    getByCategory,
  } = useExpensesStore();

  const [showAddModal, setShowAddModal] = useState(false);

  const loadExpenses = useCallback(() => fetchExpenses(), []);

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
    } catch {
      Alert.alert('Error', 'Failed to delete expense.');
    }
  };

  const totalSpent = getTotalThisMonth();
  const remaining = getRemainingBudget();
  const filtered = getFilteredExpenses();
  const byCategory = getByCategory();

  // Top categories
  const topCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadExpenses} tintColor="#6366f1" />
        }
      >
        {/* Error */}
        {error && (
          <ErrorBanner message={error} onDismiss={clearError} onRetry={loadExpenses} />
        )}

        {/* Budget bar */}
        <BudgetBar spent={totalSpent} budget={budget} remaining={remaining} />

        {/* Top Categories Summary */}
        {topCategories.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📊 Top Spending</Text>
            <AppCard padded={false}>
              {topCategories.map(([cat, amount], i) => (
                <View
                  key={cat}
                  style={[styles.catRow, i < topCategories.length - 1 && styles.catRowBorder]}
                >
                  <Text style={styles.catIcon}>{CATEGORY_ICONS[cat] ?? '📦'}</Text>
                  <Text style={styles.catName}>{cat}</Text>
                  <Text style={styles.catAmount}>${amount.toFixed(2)}</Text>
                  {/* Mini bar */}
                  <View style={styles.catBar}>
                    <View
                      style={[
                        styles.catBarFill,
                        { width: `${Math.min((amount / totalSpent) * 100, 100)}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </AppCard>
          </>
        )}

        {/* Category filter */}
        <Text style={styles.sectionTitle}>💳 Transactions</Text>
        <CategoryTabs selected={selectedCategory} onSelect={setSelectedCategory} />

        {/* Expense list */}
        {loading && expenses.length === 0 ? (
          <LoadingSpinner message="Loading expenses..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="💸"
            title={selectedCategory ? `No ${selectedCategory} expenses` : 'No Expenses Yet'}
            message={
              selectedCategory
                ? `You haven't logged any ${selectedCategory} expenses.`
                : "Track your spending by adding your first expense!"
            }
            actionLabel={selectedCategory ? undefined : 'Add First Expense'}
            onAction={selectedCategory ? undefined : () => setShowAddModal(true)}
          />
        ) : (
          <AppCard padded={false}>
            {filtered.map((expense, i) => (
              <View key={expense.id}>
                <ExpenseRow expense={expense} onDelete={handleDelete} />
                {i < filtered.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </AppCard>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Expense Modal */}
      <AddExpenseModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 100 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
    marginBottom: 8,
  },

  // Budget
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  budgetTitle: { fontSize: 15, fontWeight: '600', color: '#374151' },
  budgetStatus: { fontSize: 14, fontWeight: '700', color: '#10b981' },
  budgetBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  budgetFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  budgetFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetSpent: { fontSize: 12, color: '#6b7280' },
  budgetTotal: { fontSize: 12, color: '#6b7280' },

  // Category summary
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  catRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  catIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  catName: { flex: 1, fontSize: 13, color: '#374151', fontWeight: '500' },
  catAmount: { fontSize: 14, fontWeight: '700', color: '#374151' },
  catBar: {
    width: 60,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },

  // Category tabs
  tabsScroll: { marginBottom: 10 },
  tabsRow: { flexDirection: 'row', gap: 8, paddingVertical: 4, paddingRight: 16 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  tabActive: { backgroundColor: '#eef2ff', borderColor: '#6366f1' },
  tabText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  tabTextActive: { color: '#6366f1', fontWeight: '700' },

  // Expense rows
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  expenseCatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseCatIconText: { fontSize: 18 },
  expenseDesc: { fontSize: 14, fontWeight: '600', color: '#111827' },
  expenseMeta: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  expenseAmt: { fontSize: 15, fontWeight: '700', color: '#ef4444' },
  expenseDeleteBtn: { padding: 4 },
  expenseDeleteText: { fontSize: 14 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 16 },

  // FAB
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

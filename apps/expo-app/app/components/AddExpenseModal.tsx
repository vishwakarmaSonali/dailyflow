import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import FormModal from './FormModal';
import AppInput from './AppInput';
import AppButton from './AppButton';
import { useExpensesStore, EXPENSE_CATEGORIES } from '../stores/expensesStore';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddExpenseModal({ visible, onClose }: AddExpenseModalProps) {
  const createExpense = useExpensesStore((s) => s.createExpense);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    const amt = parseFloat(amount);
    if (!amount.trim()) e.amount = 'Amount is required';
    else if (isNaN(amt) || amt <= 0) e.amount = 'Enter a valid positive amount';
    else if (amt > 100000) e.amount = 'Amount seems too large';
    if (!description.trim()) e.description = 'Description is required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    try {
      setLoading(true);
      setErrors({});
      await createExpense({
        amount: parseFloat(amount),
        category,
        description: description.trim(),
        date: new Date().toISOString(),
      });
      handleClose();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setCategory('Food & Dining');
    setDescription('');
    setErrors({});
    onClose();
  };

  return (
    <FormModal visible={visible} title="Add Expense" onClose={handleClose}>
      <AppInput
        label="Amount ($) *"
        placeholder="0.00"
        value={amount}
        onChangeText={(t) => { setAmount(t); setErrors((e) => ({ ...e, amount: '' })); }}
        error={errors.amount}
        keyboardType="decimal-pad"
        autoFocus
      />

      <AppInput
        label="Description *"
        placeholder="What did you spend on?"
        value={description}
        onChangeText={(t) => { setDescription(t); setErrors((e) => ({ ...e, description: '' })); }}
        error={errors.description}
        maxLength={100}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categories}>
        {EXPENSE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]} numberOfLines={1}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <AppButton
        title="Add Expense"
        onPress={handleSubmit}
        loading={loading}
        size="lg"
        style={styles.submitButton}
      />

      <AppButton
        title="Cancel"
        onPress={handleClose}
        variant="ghost"
        size="md"
        style={styles.cancelButton}
      />
    </FormModal>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  chipActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  chipTextActive: {
    color: '#6366f1',
    fontWeight: '700',
  },
  submitButton: {
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 4,
  },
});

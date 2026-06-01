import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import FormModal from './FormModal';
import AppInput from './AppInput';
import AppButton from './AppButton';
import { useHabitsStore } from '../stores/habitsStore';

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
}

const FREQUENCIES = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

export default function AddHabitModal({ visible, onClose }: AddHabitModalProps) {
  const createHabit = useHabitsStore((s) => s.createHabit);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Habit name is required';
    if (name.trim().length > 80) e.name = 'Name is too long (max 80 chars)';
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
      await createHabit({ name: name.trim(), description: description.trim(), frequency });
      handleClose();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to create habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setFrequency('daily');
    setErrors({});
    onClose();
  };

  return (
    <FormModal visible={visible} title="New Habit" onClose={handleClose}>
      <AppInput
        label="Habit Name *"
        placeholder="e.g. Morning Run, Read for 30 min"
        value={name}
        onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: '' })); }}
        error={errors.name}
        maxLength={80}
        autoFocus
      />

      <AppInput
        label="Description (optional)"
        placeholder="What does this habit help you with?"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={styles.textarea}
        maxLength={200}
      />

      <Text style={styles.label}>Frequency</Text>
      <View style={styles.frequencyRow}>
        {FREQUENCIES.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.chip, frequency === f.value && styles.chipActive]}
            onPress={() => setFrequency(f.value as any)}
          >
            <Text style={[styles.chipText, frequency === f.value && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <AppButton
        title="Create Habit"
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
  textarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  chipActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  chipText: {
    fontSize: 13,
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

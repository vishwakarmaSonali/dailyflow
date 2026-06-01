import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export default function AppCard({ children, style, padded = true }: AppCardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f5',
  },
  padded: {
    padding: 16,
  },
});

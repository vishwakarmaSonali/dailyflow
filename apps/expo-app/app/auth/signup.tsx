import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, loading, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    else if (name.trim().length < 2) e.name = 'Name is too short';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSignup = async () => {
    clearError();
    const e = validate();
    if (Object.keys(e).length > 0) {
      setFieldErrors(e);
      return;
    }
    setFieldErrors({});
    try {
      await signup(email.trim().toLowerCase(), password, name.trim());
      // Auth store will set isAuthenticated → login screen redirects
    } catch {
      // error shown via store
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brand}>
          <Text style={styles.logo}>⚡</Text>
          <Text style={styles.appName}>DailyFlow</Text>
          <Text style={styles.tagline}>Your personal productivity companion</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join DailyFlow to start building habits and managing expenses.
          </Text>

          {/* API error */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠️ {error}</Text>
            </View>
          )}

          <AppInput
            label="Full Name"
            placeholder="Jane Doe"
            value={name}
            onChangeText={(t) => { setName(t); setFieldErrors((e) => ({ ...e, name: '' })); clearError(); }}
            error={fieldErrors.name}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <AppInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={(t) => { setEmail(t); setFieldErrors((e) => ({ ...e, email: '' })); clearError(); }}
            error={fieldErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <AppInput
            label="Password"
            placeholder="At least 8 characters"
            value={password}
            onChangeText={(t) => { setPassword(t); setFieldErrors((e) => ({ ...e, password: '' })); clearError(); }}
            error={fieldErrors.password}
            secureTextEntry
            returnKeyType="next"
          />

          <AppInput
            label="Confirm Password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); setFieldErrors((e) => ({ ...e, confirmPassword: '' })); }}
            error={fieldErrors.confirmPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSignup}
          />

          {/* Password strength hint */}
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              <View style={styles.strengthBar}>
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSegment,
                      {
                        backgroundColor:
                          i <= getPasswordStrength(password)
                            ? getStrengthColor(getPasswordStrength(password))
                            : '#e5e7eb',
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.strengthLabel}>
                {getStrengthLabel(getPasswordStrength(password))}
              </Text>
            </View>
          )}

          <AppButton
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            size="lg"
            style={styles.signupButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>already have an account?</Text>
            <View style={styles.dividerLine} />
          </View>

          <AppButton
            title="Sign In"
            onPress={() => router.back()}
            variant="secondary"
            size="lg"
          />
        </View>

        <Text style={styles.footer}>
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getPasswordStrength(pwd: string): number {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

function getStrengthColor(strength: number): string {
  if (strength <= 1) return '#ef4444';
  if (strength === 2) return '#f97316';
  if (strength === 3) return '#eab308';
  return '#10b981';
}

function getStrengthLabel(strength: number): string {
  if (strength <= 1) return 'Weak';
  if (strength === 2) return 'Fair';
  if (strength === 3) return 'Good';
  return 'Strong';
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flexGrow: 1, padding: 24, paddingTop: 48 },

  brand: { alignItems: 'center', marginBottom: 28 },
  logo: { fontSize: 44 },
  appName: { fontSize: 28, fontWeight: '800', color: '#111827', marginTop: 4 },
  tagline: { fontSize: 13, color: '#6b7280', marginTop: 4, textAlign: 'center' },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 20 },

  errorBanner: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorBannerText: { fontSize: 13, color: '#991b1b', lineHeight: 18 },

  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    marginTop: -8,
  },
  strengthBar: { flex: 1, flexDirection: 'row', gap: 4 },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: { fontSize: 12, color: '#6b7280', width: 44, textAlign: 'right' },

  signupButton: { marginTop: 4, marginBottom: 16 },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { fontSize: 12, color: '#9ca3af' },

  footer: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
  },
});

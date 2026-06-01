import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';

// ─── Setting Row ──────────────────────────────────────────────────────────────
function SettingRow({
  icon,
  label,
  sublabel,
  right,
  onPress,
  showArrow,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  showArrow?: boolean;
}) {
  const content = (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Text style={styles.settingIconText}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingLabel}>{label}</Text>
        {sublabel && <Text style={styles.settingSubLabel}>{sublabel}</Text>}
      </View>
      {right && <View>{right}</View>}
      {showArrow && <Text style={styles.arrow}>›</Text>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuthStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [habitReminders, setHabitReminders] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // future feature

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete all your habits, expenses, and account data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => Alert.alert('Not implemented', 'Account deletion is not yet available.'),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Card */}
      <AppCard style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{user?.name ?? 'Guest User'}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? 'Not signed in'}</Text>
        </View>
        <TouchableOpacity style={styles.editProfileBtn}>
          <Text style={styles.editProfileText}>Edit</Text>
        </TouchableOpacity>
      </AppCard>

      {/* Notifications */}
      <SectionHeader title="Notifications" />
      <AppCard padded={false}>
        <SettingRow
          icon="🔔"
          label="Enable Notifications"
          sublabel="Receive push notifications"
          right={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
              thumbColor={notificationsEnabled ? '#6366f1' : '#f3f4f6'}
            />
          }
        />
        <View style={styles.rowDivider} />
        <SettingRow
          icon="⏰"
          label="Habit Reminders"
          sublabel="Daily check-in reminders"
          right={
            <Switch
              value={habitReminders && notificationsEnabled}
              onValueChange={setHabitReminders}
              disabled={!notificationsEnabled}
              trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
              thumbColor={habitReminders && notificationsEnabled ? '#6366f1' : '#f3f4f6'}
            />
          }
        />
        <View style={styles.rowDivider} />
        <SettingRow
          icon="💸"
          label="Budget Alerts"
          sublabel="Notify when nearing budget limit"
          right={
            <Switch
              value={budgetAlerts && notificationsEnabled}
              onValueChange={setBudgetAlerts}
              disabled={!notificationsEnabled}
              trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
              thumbColor={budgetAlerts && notificationsEnabled ? '#6366f1' : '#f3f4f6'}
            />
          }
        />
        <View style={styles.rowDivider} />
        <SettingRow
          icon="📊"
          label="Weekly Report"
          sublabel="Summary every Sunday"
          right={
            <Switch
              value={weeklyReport && notificationsEnabled}
              onValueChange={setWeeklyReport}
              disabled={!notificationsEnabled}
              trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
              thumbColor={weeklyReport && notificationsEnabled ? '#6366f1' : '#f3f4f6'}
            />
          }
        />
      </AppCard>

      {/* Appearance */}
      <SectionHeader title="Appearance" />
      <AppCard padded={false}>
        <SettingRow
          icon="🌙"
          label="Dark Mode"
          sublabel="Coming soon"
          right={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              disabled
              trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
              thumbColor="#f3f4f6"
            />
          }
        />
      </AppCard>

      {/* Data & Privacy */}
      <SectionHeader title="Data & Privacy" />
      <AppCard padded={false}>
        <SettingRow
          icon="📤"
          label="Export Data"
          sublabel="Download your habits & expenses"
          onPress={() => Alert.alert('Coming soon', 'Data export will be available in a future update.')}
          showArrow
        />
        <View style={styles.rowDivider} />
        <SettingRow
          icon="🔒"
          label="Privacy Policy"
          onPress={() => Alert.alert('Privacy Policy', 'Visit dailyflow.app/privacy for our full privacy policy.')}
          showArrow
        />
        <View style={styles.rowDivider} />
        <SettingRow
          icon="📄"
          label="Terms of Service"
          onPress={() => Alert.alert('Terms of Service', 'Visit dailyflow.app/terms for our full terms.')}
          showArrow
        />
      </AppCard>

      {/* About */}
      <SectionHeader title="About" />
      <AppCard padded={false}>
        <SettingRow icon="⚡" label="DailyFlow" sublabel="Version 1.0.0" />
        <View style={styles.rowDivider} />
        <SettingRow
          icon="⭐"
          label="Rate the App"
          sublabel="Help us improve"
          onPress={() => Alert.alert('Thank you!', 'Rating support coming soon.')}
          showArrow
        />
        <View style={styles.rowDivider} />
        <SettingRow
          icon="🐛"
          label="Report a Bug"
          sublabel="support@dailyflow.app"
          onPress={() => Alert.alert('Bug Report', 'Please email us at support@dailyflow.app')}
          showArrow
        />
      </AppCard>

      {/* Sign Out */}
      <SectionHeader title="Account" />
      <AppButton
        title="Sign Out"
        onPress={handleLogout}
        variant="secondary"
        size="lg"
        loading={authLoading}
        style={styles.signOutButton}
      />
      <AppButton
        title="Delete Account"
        onPress={handleDeleteAccount}
        variant="danger"
        size="lg"
        style={styles.deleteButton}
      />

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 4,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  profileName: { fontSize: 17, fontWeight: '700', color: '#111827' },
  profileEmail: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  editProfileBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#6366f1',
  },
  editProfileText: { fontSize: 13, color: '#6366f1', fontWeight: '600' },

  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 20,
    marginBottom: 6,
    marginLeft: 4,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    minHeight: 56,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconText: { fontSize: 16 },
  settingLabel: { fontSize: 15, fontWeight: '500', color: '#111827' },
  settingSubLabel: { fontSize: 12, color: '#9ca3af', marginTop: 1 },
  arrow: { fontSize: 22, color: '#9ca3af', marginLeft: 4 },
  rowDivider: { height: 1, backgroundColor: '#f3f4f6', marginLeft: 60 },

  signOutButton: { marginTop: 4 },
  deleteButton: { marginTop: 10 },
});

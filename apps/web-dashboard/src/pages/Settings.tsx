import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/appStore'
import { Save, LogOut, Bell, Shield, Palette } from 'lucide-react'
import Button from '@/components/UI/Button'
import { TextInput } from '@/components/UI/Form'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    monthlyBudget: 1000,
  })
  const [saving, setSaving] = useState(false)

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log('Settings saved:', settings)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {/* Profile Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Profile Information</h4>
          <div className="space-y-4">
            <TextInput
              label="Name"
              value={user?.name || ''}
              disabled
            />
            <TextInput
              label="Email"
              type="email"
              value={user?.email || ''}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Bell size={24} className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) =>
                setSettings({ ...settings, emailNotifications: e.target.checked })
              }
              className="w-4 h-4 rounded"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <p className="text-xs text-gray-600">Receive habit reminders and insights via email</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) =>
                setSettings({ ...settings, pushNotifications: e.target.checked })
              }
              className="w-4 h-4 rounded"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Push Notifications</p>
              <p className="text-xs text-gray-600">Get daily reminders to log your habits</p>
            </div>
          </label>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Palette size={24} className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) =>
                  setSettings({ ...settings, darkMode: e.target.checked })
                }
                className="w-4 h-4 rounded"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Dark Mode</p>
                <p className="text-xs text-gray-600">Use dark theme for the app</p>
              </div>
            </label>
          </div>

          <TextInput
            label="Monthly Budget"
            type="number"
            value={settings.monthlyBudget}
            onChange={(e) =>
              setSettings({
                ...settings,
                monthlyBudget: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={24} className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Security</h3>
        </div>

        <div className="space-y-3">
          <Button variant="secondary" className="w-full">
            Change Password
          </Button>
          <Button variant="secondary" className="w-full">
            Two-Factor Authentication
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          loading={saving}
          onClick={handleSaveSettings}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Save size={18} />
          Save Settings
        </Button>
        <Button
          variant="danger"
          onClick={handleLogout}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>
    </div>
  )
}

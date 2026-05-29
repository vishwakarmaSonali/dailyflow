import React from 'react'

export default function Settings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
        <div className="flex items-center justify-between">
          <label className="text-gray-700">Enable Notifications</label>
          <input type="checkbox" className="w-4 h-4" defaultChecked />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <label className="text-gray-700">Dark Mode</label>
          <input type="checkbox" className="w-4 h-4" />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
        <p className="text-gray-600">DailyFlow v1.0.0</p>
      </div>
    </div>
  )
}

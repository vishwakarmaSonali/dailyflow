import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/appStore'
import { User, Bell, LogOut } from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Welcome to DailyFlow</h2>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Bell size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
              <User size={18} className="text-indigo-600" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-600">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}

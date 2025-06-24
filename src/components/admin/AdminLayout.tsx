import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Film, 
  Building, 
  Calendar, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Movies', href: '/admin/movies', icon: Film },
  { name: 'Halls', href: '/admin/halls', icon: Building },
  { name: 'Showtimes', href: '/admin/showtimes', icon: Calendar },
  { name: 'Bookings', href: '/admin/bookings', icon: Users },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut, user } = useAuth()
  const location = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-dark-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-dark-900 border-r border-dark-700">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-display font-bold text-gradient">Admin Panel</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-8">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400 border-r-2 border-primary-500'
                      : 'text-slate-300 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-dark-900 border-r border-dark-700">
          <div className="flex items-center h-16 px-4 border-b border-dark-700">
            <h2 className="text-xl font-display font-bold text-gradient">Admin Panel</h2>
          </div>
          <nav className="mt-8 flex-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400 border-r-2 border-primary-500'
                      : 'text-slate-300 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-dark-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user?.user_metadata?.full_name?.[0] || 'A'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {user?.user_metadata?.full_name || 'Admin'}
                </p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-slate-300">
                Welcome back, {user?.user_metadata?.full_name || 'Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
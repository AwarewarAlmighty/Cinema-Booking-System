import { Link, useNavigate } from 'react-router-dom'
import { Film, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Header() {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      navigate('/')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  return (
    <header className="bg-dark-900 border-b border-dark-700 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Film className="h-8 w-8 text-primary-500 group-hover:text-primary-400 transition-colors" />
            <span className="text-xl font-display font-bold text-gradient">
              Cinema Indonesia
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-slate-300 hover:text-white transition-colors font-medium"
            >
              Home
            </Link>
            <Link 
              to="/movies" 
              className="text-slate-300 hover:text-white transition-colors font-medium"
            >
              Movies
            </Link>
            {user && (
              <Link 
                to="/bookings" 
                className="text-slate-300 hover:text-white transition-colors font-medium"
              >
                My Bookings
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="btn btn-secondary flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <div className="flex items-center space-x-2 text-slate-300">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="btn btn-secondary">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
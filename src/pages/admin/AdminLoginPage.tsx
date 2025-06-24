import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

interface AdminLoginForm {
  username: string
  password: string
}

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { adminSignIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/admin'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginForm>()

  const onSubmit = async (data: AdminLoginForm) => {
    setLoading(true)
    try {
      const { error } = await adminSignIn(data.username, data.password)
      
      if (error) {
        toast.error('Invalid username or password')
      } else {
        toast.success('Welcome back, Admin!')
        navigate(from, { replace: true })
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-dark-950 via-dark-900 to-primary-950">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-primary-500" />
          </div>
          <h2 className="mt-6 text-3xl font-display font-bold">
            Admin Portal
          </h2>
          <p className="mt-2 text-slate-400">
            Sign in to access the admin dashboard
          </p>
        </div>

        <div className="card p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                {...register('username', {
                  required: 'Username is required',
                })}
                type="text"
                className="input"
                placeholder="Enter admin username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-lg py-3"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Demo credentials: admin / password
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
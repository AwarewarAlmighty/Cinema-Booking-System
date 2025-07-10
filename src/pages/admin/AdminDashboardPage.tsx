import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Film, Building, Calendar, Users, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

interface DashboardStats {
  totalMovies: number
  totalHalls: number
  totalShowtimes: number
  totalBookings: number
  totalRevenue: number
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    totalMovies: 0,
    totalHalls: 0,
    totalShowtimes: 0,
    totalBookings: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const [moviesRes, hallsRes, showtimesRes, bookingsRes] = await Promise.all([
        supabase.from('movies').select('*', { count: 'exact', head: true }),
        supabase.from('halls').select('*', { count: 'exact', head: true }),
        supabase.from('showtimes').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('total_amount')
      ])

      const totalRevenue = bookingsRes.data?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0

      setStats({
        totalMovies: moviesRes.count || 0,
        totalHalls: hallsRes.count || 0,
        totalShowtimes: showtimesRes.count || 0,
        totalBookings: bookingsRes.data?.length || 0,
        totalRevenue
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Movies',
      value: stats.totalMovies,
      icon: Film,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'Total Halls',
      value: stats.totalHalls,
      icon: Building,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'Total Showtimes',
      value: stats.totalShowtimes,
      icon: Calendar,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Users,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    },
    {
      title: 'Total Revenue',
      value: `IDR ${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/20'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Dashboard</h1>
        <p className="text-slate-400">Overview of your cinema management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => navigate('/admin/movies?openModal=true')} className="btn btn-primary w-full text-left">
              Add New Movie
            </button>
            <button onClick={() => navigate('/admin/showtimes?openModal=true')} className="btn btn-secondary w-full text-left">
              Create Showtime
            </button>
            <button onClick={() => navigate('/admin/report?openModal=true')} className="btn btn-secondary w-full text-left">
              View Report
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">New booking received</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-slate-300">Movie added to catalog</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-slate-300">Showtime scheduled</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Database</span>
              <span className="text-green-400">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Payment Gateway</span>
              <span className="text-green-400">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Booking System</span>
              <span className="text-green-400">Running</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">New Bookings</span>
              <span className="text-white font-medium">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Revenue</span>
              <span className="text-white font-medium">IDR 2,450,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Occupancy Rate</span>
              <span className="text-white font-medium">78%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
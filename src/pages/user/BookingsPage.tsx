import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Eye, X } from 'lucide-react'
import { supabase, type Booking } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          showtime:showtimes(
            *,
            movie:movies(*),
            hall:halls(*)
          )
        `)
        .eq('user_id', user?.id)
        .order('booking_date', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('booking_id', bookingId)

      if (error) throw error

      toast.success('Booking cancelled successfully')
      fetchBookings() // Refresh the list
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Failed to cancel booking')
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'status-badge'
    switch (status) {
      case 'confirmed':
        return `${baseClasses} status-confirmed`
      case 'cancelled':
        return `${baseClasses} status-cancelled`
      default:
        return `${baseClasses} status-pending`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-display font-bold mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-6">
              You don't have any bookings yet.
            </p>
            <Link to="/movies" className="btn btn-primary">
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.booking_id} className="card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                    <img
                      src={booking.showtime?.movie?.poster_url || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=100&h=150&fit=crop'}
                      alt={booking.showtime?.movie?.title}
                      className="w-16 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {booking.showtime?.movie?.title}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-slate-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.showtime?.hall?.hall_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(booking.showtime?.show_date || '').toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{booking.showtime?.start_time}</span>
                        </div>
                        <div>
                          <span>Seats: {booking.selected_seats?.join(', ')}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center space-x-4">
                        <span className={getStatusBadge(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <span className="text-lg font-semibold text-primary-400">
                          IDR {booking.total_amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Link
                      to={`/bookings/${booking.booking_id}`}
                      className="btn btn-secondary flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </Link>
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking.booking_id)}
                        className="btn btn-danger flex items-center space-x-2"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
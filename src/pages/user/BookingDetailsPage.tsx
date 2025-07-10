import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users, Ticket, ArrowLeft } from 'lucide-react'
import { IBooking } from '@/lib/mongodb' // Updated import
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [booking, setBooking] = useState<IBooking | null>(null) // Updated state type
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id && user) {
      fetchBookingDetails(id)
    }
  }, [id, user])

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      // Fetch booking details from your Express API
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }
      const data = await response.json();

      // Basic check to ensure the logged-in user owns this booking
      if (data.user._id !== user?.id) {
          throw new Error("You are not authorized to view this booking.");
      }
      
      setBooking(data)
    } catch (error) {
      console.error('Error fetching booking details:', error)
    } finally {
      setLoading(false)
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

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
          <Link to="/bookings" className="btn btn-primary">
            Back to Bookings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/bookings"
            className="btn btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
          <h1 className="text-3xl font-display font-bold">Booking Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Poster */}
          <div className="lg:col-span-1">
            <img
              src={booking.showtime?.movie?.poster_url || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'}
              alt={booking.showtime?.movie?.title}
              className="w-full rounded-xl shadow-lg"
            />
          </div>

          {/* Booking Information */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">
                  {booking.showtime?.movie?.title}
                </h2>
                <span className={getStatusBadge(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Ticket className="h-6 w-6 text-primary-400" />
                    <div>
                      <p className="text-sm text-slate-400">Booking ID</p>
                      <p className="font-semibold">#{booking._id.slice(-6)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-6 w-6 text-primary-400" />
                    <div>
                      <p className="text-sm text-slate-400">Hall</p>
                      <p className="font-semibold">{booking.showtime?.hall?.hall_name}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-6 w-6 text-primary-400" />
                    <div>
                      <p className="text-sm text-slate-400">Show Date</p>
                      <p className="font-semibold">
                        {new Date(booking.showtime?.show_date || '').toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-6 w-6 text-primary-400" />
                    <div>
                      <p className="text-sm text-slate-400">Show Time</p>
                      <p className="font-semibold">{booking.showtime?.start_time}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-primary-400" />
                    <div>
                      <p className="text-sm text-slate-400">Seats</p>
                      <p className="font-semibold">{booking.selected_seats?.join(', ')}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Total Amount</p>
                    <p className="text-2xl font-bold text-primary-400">
                      IDR {booking.total_amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-dark-600">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-slate-400">Booking Date</p>
                      <p className="font-medium">
                        {new Date(booking.booking_date).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Number of Tickets</p>
                      <p className="font-medium">{booking.total_seats}</p>
                    </div>
                  </div>
                </div>

                {booking.status === 'confirmed' && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="text-green-400 font-medium">
                      🎉 Your booking is confirmed! Please arrive at the cinema at least 15 minutes before the show time.
                    </p>
                  </div>
                )}

                {booking.status === 'cancelled' && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-400 font-medium">
                      ❌ This booking has been cancelled.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
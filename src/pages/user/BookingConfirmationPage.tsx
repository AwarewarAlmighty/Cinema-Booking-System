import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, Calendar, Clock, MapPin, Users, Ticket } from 'lucide-react'
import { supabase, type Booking } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function BookingConfirmationPage() {
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookingDetails()
  }, [])

  const loadBookingDetails = async () => {
    try {
      const bookingId = sessionStorage.getItem('confirmedBookingId')
      if (!bookingId) {
        navigate('/bookings')
        return
      }

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
        .eq('booking_id', bookingId)
        .single()

      if (error) throw error

      setBooking(data)
      sessionStorage.removeItem('confirmedBookingId')
    } catch (error) {
      console.error('Error loading booking details:', error)
      navigate('/bookings')
    } finally {
      setLoading(false)
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
            View My Bookings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-slate-400">
            Your tickets have been successfully booked.
          </p>
        </div>

        <div className="card p-6 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={booking.showtime?.movie?.poster_url || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=100&h=150&fit=crop'}
              alt={booking.showtime?.movie?.title}
              className="w-20 h-30 object-cover rounded-lg"
            />
            <div>
              <h2 className="text-xl font-semibold mb-1">
                {booking.showtime?.movie?.title}
              </h2>
              <p className="text-slate-400">
                {booking.showtime?.movie?.genre} • {booking.showtime?.movie?.duration} mins
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Ticket className="h-5 w-5 text-primary-400" />
                <div>
                  <p className="text-sm text-slate-400">Booking ID</p>
                  <p className="font-semibold">#{booking.booking_id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary-400" />
                <div>
                  <p className="text-sm text-slate-400">Hall</p>
                  <p className="font-semibold">{booking.showtime?.hall?.hall_name}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary-400" />
                <div>
                  <p className="text-sm text-slate-400">Date</p>
                  <p className="font-semibold">
                    {new Date(booking.showtime?.show_date || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary-400" />
                <div>
                  <p className="text-sm text-slate-400">Time</p>
                  <p className="font-semibold">{booking.showtime?.start_time}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary-400" />
                <div>
                  <p className="text-sm text-slate-400">Seats</p>
                  <p className="font-semibold">{booking.selected_seats?.join(', ')}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Amount</p>
                <p className="font-semibold text-lg text-primary-400">
                  IDR {booking.total_amount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-slate-400">
            Please arrive at the cinema at least 15 minutes before the show time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/bookings" className="btn btn-primary">
              View My Bookings
            </Link>
            <Link to="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
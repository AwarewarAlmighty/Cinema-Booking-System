import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { CreditCard, Calendar, Clock, MapPin, Users } from 'lucide-react'
import { supabase, type Movie, type Showtime } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

interface PaymentForm {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardHolder: string
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal'
}

interface SeatSelectionData {
  movieId: string
  showtimeId: string
  selectedSeats: string[]
  totalAmount: number
}

export default function PaymentPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [bookingData, setBookingData] = useState<{
    movie: Movie
    showtime: Showtime
    selection: SeatSelectionData
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentForm>({
    defaultValues: {
      paymentMethod: 'credit_card'
    }
  })

  useEffect(() => {
    loadBookingData()
  }, [])

  const loadBookingData = async () => {
    try {
      const selectionData = sessionStorage.getItem('seatSelection')
      if (!selectionData) {
        toast.error('No booking data found')
        navigate('/movies')
        return
      }

      const selection: SeatSelectionData = JSON.parse(selectionData)

      // Fetch movie and showtime details
      const [movieResponse, showtimeResponse] = await Promise.all([
        supabase
          .from('movies')
          .select('*')
          .eq('movie_id', selection.movieId)
          .single(),
        supabase
          .from('showtimes')
          .select(`
            *,
            hall:halls(*)
          `)
          .eq('showtime_id', selection.showtimeId)
          .single()
      ])

      if (movieResponse.error) throw movieResponse.error
      if (showtimeResponse.error) throw showtimeResponse.error

      setBookingData({
        movie: movieResponse.data,
        showtime: showtimeResponse.data,
        selection
      })
    } catch (error) {
      console.error('Error loading booking data:', error)
      toast.error('Failed to load booking data')
      navigate('/movies')
    }
  }

  const onSubmit = async (data: PaymentForm) => {
    if (!bookingData || !user) return

    setLoading(true)
    try {
      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          showtime_id: bookingData.selection.showtimeId,
          total_seats: bookingData.selection.selectedSeats.length,
          total_amount: bookingData.selection.totalAmount,
          selected_seats: bookingData.selection.selectedSeats,
          status: 'pending'
        })
        .select()
        .single()

      if (bookingError) throw bookingError

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: booking.booking_id,
          amount: bookingData.selection.totalAmount,
          payment_method: data.paymentMethod,
          status: 'success'
        })

      if (paymentError) throw paymentError

      // Update booking status to confirmed
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('booking_id', booking.booking_id)

      if (updateError) throw updateError

      // Store booking ID for confirmation page
      sessionStorage.setItem('confirmedBookingId', booking.booking_id)
      sessionStorage.removeItem('seatSelection')

      toast.success('Payment successful!')
      navigate('/booking-confirmation')
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const { movie, showtime, selection } = bookingData

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-display font-bold mb-8">Payment Information</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={movie.poster_url || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=100&h=150&fit=crop'}
                  alt={movie.title}
                  className="w-16 h-24 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{movie.title}</h3>
                  <p className="text-slate-400 text-sm">{movie.genre} • {movie.duration} mins</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-dark-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Hall:</span>
                  <span>{showtime.hall?.hall_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date:</span>
                  <span>{new Date(showtime.show_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time:</span>
                  <span>{showtime.start_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Seats:</span>
                  <span>{selection.selectedSeats.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantity:</span>
                  <span>{selection.selectedSeats.length} ticket(s)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-dark-600">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-primary-400">
                    IDR {selection.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="credit_card"
                      className="text-primary-500"
                    />
                    <span className="text-sm">Credit Card</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="debit_card"
                      className="text-primary-500"
                    />
                    <span className="text-sm">Debit Card</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="paypal"
                      className="text-primary-500"
                    />
                    <span className="text-sm">PayPal</span>
                  </label>
                </div>
              </div>

              {/* Card Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Card Number
                  </label>
                  <input
                    {...register('cardNumber', {
                      required: 'Card number is required',
                      pattern: {
                        value: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
                        message: 'Invalid card number format'
                      }
                    })}
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="input"
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-400">{errors.cardNumber.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      {...register('expiryDate', {
                        required: 'Expiry date is required',
                        pattern: {
                          value: /^\d{2}\/\d{2}$/,
                          message: 'Format: MM/YY'
                        }
                      })}
                      type="text"
                      placeholder="MM/YY"
                      className="input"
                    />
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-400">{errors.expiryDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      CVV
                    </label>
                    <input
                      {...register('cvv', {
                        required: 'CVV is required',
                        pattern: {
                          value: /^\d{3,4}$/,
                          message: 'Invalid CVV'
                        }
                      })}
                      type="text"
                      placeholder="123"
                      className="input"
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-400">{errors.cvv.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Card Holder Name
                  </label>
                  <input
                    {...register('cardHolder', {
                      required: 'Card holder name is required'
                    })}
                    type="text"
                    placeholder="John Doe"
                    className="input"
                  />
                  {errors.cardHolder && (
                    <p className="mt-1 text-sm text-red-400">{errors.cardHolder.message}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    `Pay IDR ${selection.totalAmount.toLocaleString()}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
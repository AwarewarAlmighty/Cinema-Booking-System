import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import { supabase, type Movie, type Showtime } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

interface SeatSelectionData {
  movieId: string
  showtimeId: string
  selectedSeats: string[]
  totalAmount: number
}

export default function SeatSelectionPage() {
  const { movieId } = useParams<{ movieId: string }>()
  const navigate = useNavigate()
  
  const [movie, setMovie] = useState<Movie | null>(null)
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (movieId) {
      fetchMovieAndShowtimes(movieId)
    }
  }, [movieId])

  const fetchMovieAndShowtimes = async (id: string) => {
    try {
      // Fetch movie
      const { data: movieData, error: movieError } = await supabase
        .from('movies')
        .select('*')
        .eq('movie_id', id)
        .single()

      if (movieError) throw movieError

      // Fetch showtimes
      const { data: showtimesData, error: showtimesError } = await supabase
        .from('showtimes')
        .select(`
          *,
          hall:halls(*)
        `)
        .eq('movie_id', id)
        .gte('show_date', new Date().toISOString().split('T')[0])
        .order('show_date')
        .order('start_time')

      if (showtimesError) throw showtimesError

      setMovie(movieData)
      setShowtimes(showtimesData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load movie details')
    } finally {
      setLoading(false)
    }
  }

  const generateSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    const seatsPerRow = 10
    const seats = []
    
    for (const row of rows) {
      for (let i = 1; i <= seatsPerRow; i++) {
        const seatId = `${row}${i}`
        const isOccupied = Math.random() < 0.2 // Randomly mark some seats as occupied
        seats.push({
          id: seatId,
          row,
          number: i,
          isOccupied,
          isSelected: selectedSeats.includes(seatId)
        })
      }
    }
    
    return seats
  }

  const handleSeatClick = (seatId: string, isOccupied: boolean) => {
    if (isOccupied) return

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId)
      } else {
        return [...prev, seatId]
      }
    })
  }

  const handleProceedToPayment = () => {
    if (!selectedShowtime || selectedSeats.length === 0) {
      toast.error('Please select a showtime and at least one seat')
      return
    }

    const selectionData: SeatSelectionData = {
      movieId: movieId!,
      showtimeId: selectedShowtime.showtime_id,
      selectedSeats,
      totalAmount: selectedSeats.length * selectedShowtime.ticket_price
    }

    // Store selection in sessionStorage
    sessionStorage.setItem('seatSelection', JSON.stringify(selectionData))
    navigate('/payment')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Movie Not Found</h1>
          <button onClick={() => navigate('/movies')} className="btn btn-primary">
            Back to Movies
          </button>
        </div>
      </div>
    )
  }

  const seats = generateSeats()

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Movie Header */}
        <div className="flex items-center space-x-4 mb-8">
          <img
            src={movie.poster_url || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&fit=crop'}
            alt={movie.title}
            className="w-20 h-30 object-cover rounded-lg"
          />
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">{movie.title}</h1>
            <p className="text-slate-400">{movie.genre} • {movie.duration} mins</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Showtime Selection */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Choose Showtime</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {showtimes.map((showtime) => (
                  <div
                    key={showtime.showtime_id}
                    className={`card p-4 cursor-pointer transition-all ${
                      selectedShowtime?.showtime_id === showtime.showtime_id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'hover:border-primary-500/50'
                    }`}
                    onClick={() => setSelectedShowtime(showtime)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-accent-400">
                        {showtime.hall?.hall_name}
                      </h3>
                      <span className="text-primary-400 font-bold">
                        IDR {showtime.ticket_price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(showtime.show_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{showtime.start_time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seat Selection */}
            {selectedShowtime && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Select Your Seats</h2>
                
                {/* Screen */}
                <div className="text-center mb-8">
                  <div className="inline-block bg-gradient-to-r from-primary-500 to-accent-500 text-white px-8 py-2 rounded-lg font-semibold">
                    SCREEN
                  </div>
                </div>

                {/* Seat Grid */}
                <div className="grid grid-cols-10 gap-2 mb-6 max-w-2xl mx-auto">
                  {seats.map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id, seat.isOccupied)}
                      className={`seat ${
                        seat.isOccupied
                          ? 'seat-occupied'
                          : selectedSeats.includes(seat.id)
                          ? 'seat-selected'
                          : 'seat-available'
                      }`}
                      disabled={seat.isOccupied}
                    >
                      {seat.id}
                    </button>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex justify-center space-x-6 mb-8">
                  <div className="flex items-center space-x-2">
                    <div className="seat seat-available w-4 h-4"></div>
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="seat seat-selected w-4 h-4"></div>
                    <span className="text-sm">Selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="seat seat-occupied w-4 h-4"></div>
                    <span className="text-sm">Occupied</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Movie:</span>
                  <span className="font-medium">{movie.title}</span>
                </div>
                
                {selectedShowtime && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hall:</span>
                      <span className="font-medium">{selectedShowtime.hall?.hall_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date:</span>
                      <span className="font-medium">
                        {new Date(selectedShowtime.show_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Time:</span>
                      <span className="font-medium">{selectedShowtime.start_time}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Seats:</span>
                  <span className="font-medium">
                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
                  </span>
                </div>
              </div>

              {selectedShowtime && selectedSeats.length > 0 && (
                <div className="border-t border-dark-600 pt-4 mb-6">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-primary-400">
                      IDR {(selectedSeats.length * selectedShowtime.ticket_price).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleProceedToPayment}
                disabled={!selectedShowtime || selectedSeats.length === 0}
                className="btn btn-primary w-full"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
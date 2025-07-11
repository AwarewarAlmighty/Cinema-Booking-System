import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { IMovie, IShowtime } from '@/lib/mongodb';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import BookingProgress from '@/components/BookingProgress';

interface SeatSelectionData {
  movieId: string;
  showtimeId: string;
  selectedSeats: string[];
  totalAmount: number;
}

export default function BookingPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState<IMovie | null>(null);
  const [showtimes, setShowtimes] = useState<IShowtime[]>([]);
  const [selectedShowtime, setSelectedShowtime] = useState<IShowtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (movieId) {
      fetchMovieAndShowtimes(movieId);
    }
  }, [movieId]);

  useEffect(() => {
    if (selectedShowtime) {
      fetchOccupiedSeats(selectedShowtime._id);
    }
    // Reset selected seats when showtime changes
    setSelectedSeats([]);
  }, [selectedShowtime]);

  const fetchMovieAndShowtimes = async (id: string) => {
    try {
      const [movieResponse, showtimesResponse] = await Promise.all([
        fetch(`/api/movies/${id}`),
        fetch(`/api/showtimes/movie/${id}`)
      ]);

      if (!movieResponse.ok) throw new Error('Movie not found');
      if (!showtimesResponse.ok) throw new Error('Could not fetch showtimes');

      const movieData = await movieResponse.json();
      const showtimesData = await showtimesResponse.json();
      
      // Filter out past showtimes
      const now = new Date();
      const upcomingShowtimes = showtimesData.filter((showtime: IShowtime) => {
        const [hours, minutes] = showtime.start_time.split(':');
        const showtimeDate = new Date(showtime.show_date);
        showtimeDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        return showtimeDate > now;
      });

      setMovie(movieData);
      setShowtimes(upcomingShowtimes || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const fetchOccupiedSeats = async (showtimeId: string) => {
    try {
      const response = await fetch(`/api/bookings/showtime/${showtimeId}`);
      if (!response.ok) {
        throw new Error('Could not fetch seat status');
      }
      const data = await response.json();
      setOccupiedSeats(data);
    } catch (error) {
      console.error("Error fetching occupied seats:", error);
      toast.error("Could not load seat information.");
    }
  };

  const generateSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 10;
    const seats = [];
    
    for (const row of rows) {
      for (let i = 1; i <= seatsPerRow; i++) {
        const seatId = `${row}${i}`;
        const isOccupied = occupiedSeats.includes(seatId);
        seats.push({
          id: seatId,
          isOccupied,
        });
      }
    }
    
    return seats;
  };

  const handleSeatClick = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return;

    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(s => s !== seatId) 
        : [...prev, seatId]
    );
  };

  const handleProceedToPayment = () => {
    if (!selectedShowtime || selectedSeats.length === 0) {
      toast.error('Please select a showtime and at least one seat');
      return;
    }

    const selectionData: SeatSelectionData = {
      movieId: movieId!,
      showtimeId: selectedShowtime._id,
      selectedSeats,
      totalAmount: selectedSeats.length * selectedShowtime.ticket_price
    };

    sessionStorage.setItem('seatSelection', JSON.stringify(selectionData));
    navigate('/payment');
  };

  if (loading || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <header className="bg-dark-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/movies" className="btn btn-secondary flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
          <BookingProgress currentStep="selection" />
          <div></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <img src={movie.poster_url} alt={movie.title} className="w-24 sm:w-32 rounded-lg shadow-lg"/>
          <div>
            <h1 className="text-3xl font-bold font-display">{movie.title}</h1>
            <p className="text-slate-400">Select your preferred date and time.</p>
          </div>
        </div>
        
        <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Available Times</h2>
            <div className="flex flex-wrap gap-3">
            {showtimes.map((showtime) => (
                <button
                    key={showtime._id}
                    className={`btn ${selectedShowtime?._id === showtime._id ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedShowtime(showtime)}
                >
                    {new Date(showtime.show_date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })} - {showtime.start_time}
                </button>
            ))}
            </div>
        </div>

        {selectedShowtime && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-dark-800 p-6 rounded-lg">
              <div className="bg-black text-center text-white py-2 rounded-t-lg mb-8 font-semibold tracking-widest uppercase">Screen</div>
              <div className="grid grid-cols-10 gap-2 mb-6 max-w-2xl mx-auto">
                  {generateSeats().map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={seat.isOccupied}
                      className={`seat ${
                        seat.isOccupied
                          ? 'seat-occupied'
                          : selectedSeats.includes(seat.id)
                          ? 'seat-selected'
                          : 'seat-available'
                      }`}
                    >
                      {seat.id}
                    </button>
                  ))}
              </div>
               <div className="flex justify-center space-x-6">
                  <div className="flex items-center space-x-2"><div className="seat seat-available w-4 h-4"></div><span className="text-sm">Available</span></div>
                  <div className="flex items-center space-x-2"><div className="seat seat-selected w-4 h-4"></div><span className="text-sm">Selected</span></div>
                  <div className="flex items-center space-x-2"><div className="seat seat-occupied w-4 h-4"></div><span className="text-sm">Occupied</span></div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-dark-800 p-6 rounded-lg sticky top-24">
                <h3 className="text-xl font-semibold mb-4">Selected Seats</h3>
                <ul className="space-y-2 mb-4 h-40 overflow-y-auto">
                  {selectedSeats.map(seat => (
                    <li key={seat} className="flex justify-between items-center">
                      <span>Seat {seat}</span>
                      <span>IDR {selectedShowtime.ticket_price.toLocaleString()}</span>
                    </li>
                  ))}
                  {selectedSeats.length === 0 && <p className="text-slate-400">No seats selected.</p>}
                </ul>
                <div className="border-t border-dark-700 pt-4">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>IDR {(selectedSeats.length * selectedShowtime.ticket_price).toLocaleString()}</span>
                    </div>
                </div>
                <button
                  onClick={handleProceedToPayment}
                  disabled={selectedSeats.length === 0}
                  className="btn btn-primary w-full mt-6 text-lg"
                >
                  Purchase
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
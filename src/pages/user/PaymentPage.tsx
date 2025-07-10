import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { IMovie, IShowtime } from '@/lib/mongodb';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import BookingProgress from '@/components/BookingProgress';

interface PaymentForm {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolder: string;
}

interface SeatSelectionData {
  movieId: string;
  showtimeId: string;
  selectedSeats: string[];
  totalAmount: number;
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<{
    movie: IMovie;
    showtime: IShowtime;
    selection: SeatSelectionData;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentForm>();

  useEffect(() => {
    loadBookingData();
  }, []);

  const loadBookingData = async () => {
    try {
      const selectionData = sessionStorage.getItem('seatSelection');
      if (!selectionData) {
        toast.error('No booking data found');
        navigate('/movies');
        return;
      }

      const selection: SeatSelectionData = JSON.parse(selectionData);

      const [movieResponse, showtimeResponse] = await Promise.all([
        fetch(`/api/movies/${selection.movieId}`),
        fetch(`/api/showtimes/${selection.showtimeId}`)
      ]);

      if (!movieResponse.ok || !showtimeResponse.ok) {
        throw new Error('Failed to load booking details');
      }

      const movieData = await movieResponse.json();
      const showtimeData = await showtimeResponse.json();

      setBookingData({
        movie: movieData,
        showtime: showtimeData,
        selection
      });
    } catch (error) {
      console.error('Error loading booking data:', error);
      toast.error('Failed to load booking data');
      navigate('/movies');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PaymentForm) => {
    if (!bookingData || !user) return;

    setLoading(true);
    try {
      const bookingPayload = {
        user: user.id,
        showtime: bookingData.selection.showtimeId,
        total_seats: bookingData.selection.selectedSeats.length,
        total_amount: bookingData.selection.totalAmount,
        selected_seats: bookingData.selection.selectedSeats,
        status: 'confirmed'
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      });

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      const confirmedBooking = await response.json();
      sessionStorage.setItem('confirmedBookingId', confirmedBooking._id);
      sessionStorage.removeItem('seatSelection');
      toast.success('Booking confirmed!');
      navigate('/booking-confirmation');
    } catch (error) {
      console.error('Error processing booking:', error);
      toast.error('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  const { movie, showtime, selection } = bookingData;

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <header className="bg-dark-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <button onClick={() => navigate(-1)} className="btn btn-secondary flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <BookingProgress currentStep="payment" />
          <div></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Card Holder Name</label>
                <input {...register('cardHolder', { required: true })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Card Number</label>
                <input {...register('cardNumber', { required: true })} className="input" placeholder="0000 0000 0000 0000" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input {...register('expiryDate', { required: true })} className="input" placeholder="MM/YY" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">CVV</label>
                  <input {...register('cvv', { required: true })} className="input" placeholder="123" />
                </div>
              </div>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img src={movie.poster_url} alt={movie.title} className="w-20 rounded-lg" />
                <div>
                  <h3 className="font-semibold text-lg">{movie.title}</h3>
                  <p className="text-sm text-slate-400">{showtime.hall.hall_name}</p>
                </div>
              </div>
              <div className="border-t border-dark-700 pt-4 space-y-2">
                <div className="flex justify-between"><span className="text-slate-400">Date</span><span>{new Date(showtime.show_date).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Time</span><span>{showtime.start_time}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Seats</span><span>{selection.selectedSeats.join(', ')}</span></div>
              </div>
              <div className="border-t border-dark-700 pt-4">
                <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>IDR {selection.totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={handleSubmit(onSubmit)} disabled={loading} className="btn btn-primary w-full text-lg mt-4">
                {loading ? <LoadingSpinner size="sm" /> : 'Confirm and Pay'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
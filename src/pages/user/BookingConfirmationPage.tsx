import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, Users, Ticket, ArrowLeft } from 'lucide-react';
import { IBooking } from '@/lib/mongodb';
import LoadingSpinner from '@/components/LoadingSpinner';
import BookingProgress from '@/components/BookingProgress';

export default function BookingConfirmationPage() {
  const navigate = useNavigate();
  const [booking, setBooking] = useState<IBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookingId = sessionStorage.getItem('confirmedBookingId');
    if (bookingId) {
      fetch(`/api/bookings/${bookingId}`)
        .then(res => res.json())
        .then(data => {
          setBooking(data);
          sessionStorage.removeItem('confirmedBookingId');
        })
        .catch(() => navigate('/bookings'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      navigate('/bookings');
    }
  }, [navigate]);

  if (loading) {
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
          <Link to="/" className="btn btn-secondary flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <BookingProgress currentStep="finish" />
          <div></div>
        </div>
      </header>
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-display font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-slate-400 mb-8">Your e-tickets have been sent to your email.</p>
        
        {booking && (
          <div className="bg-dark-800 p-6 rounded-lg text-left space-y-4">
            <div className="flex items-center gap-4">
              <img src={booking.showtime.movie.poster_url} alt={booking.showtime.movie.title} className="w-24 rounded-lg" />
              <div>
                <h2 className="text-xl font-semibold">{booking.showtime.movie.title}</h2>
                <p className="text-slate-400">{booking.showtime.movie.genre} • {booking.showtime.movie.duration} mins</p>
              </div>
            </div>
            <div className="border-t border-dark-700 pt-4 grid grid-cols-2 gap-4">
              <div><p className="text-sm text-slate-400">Hall</p><p>{booking.showtime.hall.hall_name}</p></div>
              <div><p className="text-sm text-slate-400">Date</p><p>{new Date(booking.showtime.show_date).toLocaleDateString()}</p></div>
              <div><p className="text-sm text-slate-400">Time</p><p>{booking.showtime.start_time}</p></div>
              <div><p className="text-sm text-slate-400">Seats</p><p>{booking.selected_seats.join(', ')}</p></div>
            </div>
          </div>
        )}
        
        <div className="mt-8">
            <Link to="/bookings" className="btn btn-primary w-full max-w-xs text-lg">
                View My Bookings
            </Link>
        </div>
      </main>
    </div>
  );
}
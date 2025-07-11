import { useEffect, useState } from 'react';
import { Eye, CheckCircle, XCircle, Filter, Download } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

// Define interfaces to match the populated data structure from your backend
export interface IMovie {
  _id: string;
  title: string;
  poster_url: string;
}

export interface IHall {
  _id: string;
  hall_name: string;
}

export interface IShowtime {
  _id: string;
  movie: IMovie;
  hall: IHall;
  show_date: string;
  start_time: string;
}

export interface IBooking {
  _id: string;
  showtime: IShowtime;
  booking_date: string;
  total_seats: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  selected_seats: string[];
}

// ============== AdminBookingsPage Component ==============
export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  // Fetch all bookings from the backend API
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data || []);
    } catch (error) {
      toast.error('Failed to load bookings');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update the status of a specific booking
  const handleUpdateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      toast.success(`Booking ${status} successfully`);
      fetchBookings(); // Refresh the list after updating
    } catch (error) {
      toast.error('Failed to update booking status');
      console.error('Error updating booking status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'status-badge';
    switch (status) {
      case 'confirmed':
        return `${baseClasses} status-confirmed`;
      case 'cancelled':
        return `${baseClasses} status-cancelled`;
      default:
        return `${baseClasses} status-pending`;
    }
  };

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter(booking => booking.status === statusFilter);

  const totalRevenue = bookings
    .filter(booking => booking.status === 'confirmed')
    .reduce((sum, booking) => sum + booking.total_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Bookings</h1>
          <p className="text-slate-400">Manage customer bookings</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="btn btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <p className="text-sm text-slate-400">Total Bookings</p>
          <p className="text-2xl font-bold text-white">{bookings.length}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-slate-400">Confirmed</p>
          <p className="text-2xl font-bold text-green-400">{bookings.filter(b => b.status === 'confirmed').length}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-slate-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{bookings.filter(b => b.status === 'pending').length}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-slate-400">Total Revenue</p>
          <p className="text-2xl font-bold text-primary-400">IDR {totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-slate-400 text-lg">No bookings found for the selected filter.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Movie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Seats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-dark-800/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">#{booking._id.slice(-6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={booking.showtime?.movie?.poster_url || 'https://placehold.co/60x90/0f172a/94a3b8?text=N/A'}
                          alt={booking.showtime?.movie?.title}
                          className="w-10 h-15 object-cover rounded"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">{booking.showtime?.movie?.title}</div>
                          <div className="text-sm text-slate-400">{booking.showtime?.hall?.hall_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      <div>{new Date(booking.showtime?.show_date || '').toLocaleDateString()}</div>
                      <div className="text-slate-400">{booking.showtime?.start_time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{booking.selected_seats?.join(', ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-400">IDR {booking.total_amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-400 hover:text-blue-300"><Eye className="h-4 w-4" /></button>
                        {booking.status === 'pending' && (
                          <>
                            <button onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')} className="text-green-400 hover:text-green-300">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')} className="text-red-400 hover:text-red-300">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
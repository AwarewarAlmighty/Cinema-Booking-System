import { useEffect, useState } from 'react';
import { Film, Building, TrendingUp, RefreshCcw } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';



interface IMovie {
  _id: string;
  title: string;
  is_now_showing: boolean;
}

interface IHall {
  _id: string;
  hall_name: string;
  is_active: boolean;
}

interface IBooking {
  total_amount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  booking_date: string;
}

export default function AdminReportsPage() {
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [halls, setHalls] = useState<IHall[]>([]);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData(); 
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [movieRes, hallRes, bookingRes] = await Promise.all([
        fetch('/api/movies'),
        fetch('/api/halls'),
        fetch('/api/bookings')
      ]);

      if (!movieRes.ok || !hallRes.ok || !bookingRes.ok) {
        throw new Error('Failed to fetch report data');
      }

      const moviesData = await movieRes.json();
      const hallsData = await hallRes.json();
      const bookingsData = await bookingRes.json();

      setMovies(moviesData);
      setHalls(hallsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error(error);
      toast.error('Error loading report data');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayRevenue = bookings
    .filter(b => b.status === 'confirmed' && b.booking_date.startsWith(today))
    .reduce((sum, b) => sum + b.total_amount, 0);

  const currentMovies = movies.filter(m => m.is_now_showing);
  const activeHalls = halls.filter(h => h.is_active);

// Fallback dummy chart data
const dummyWeeklyRevenue = [
  { date: '2025-07-04', revenue: 80000 },
  { date: '2025-07-05', revenue: 120000 },
  { date: '2025-07-06', revenue: 90000 },
  { date: '2025-07-07', revenue: 70000 },
  { date: '2025-07-08', revenue: 110000 },
  { date: '2025-07-09', revenue: 95000 },
  { date: '2025-07-10', revenue: 105000 }
];

const getWeeklyRevenueData = (bookings: IBooking[]) => {

    const now = new Date();
    const days = [...Array(7)].map((_, i) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - i));
      const dayStr = date.toISOString().split('T')[0];
      return { date: dayStr, revenue: 0 };
    });

    bookings
      .filter(b => b.status === 'confirmed')
      .forEach(b => {
        const day = days.find(d => b.booking_date.startsWith(d.date));
        if (day) {
          day.revenue += b.total_amount;
        }
      });

    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Revenue",
      value: `IDR ${todayRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/20'
    },
    {
      title: 'Now Showing Movies',
      value: currentMovies.length,
      icon: Film,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'Active Halls',
      value: activeHalls.length,
      icon: Building,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Reports</h1>
          <p className="text-slate-400">Daily performance overview</p>
        </div>
        <button
          onClick={fetchReportData}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <RefreshCcw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
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
          );
        })}
      </div>

      {/* Weekly Revenue Chart */}
      <div className="card p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Weekly Revenue</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={bookings.length > 0 ? getWeeklyRevenueData(bookings) : dummyWeeklyRevenue}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#cbd5e1" />
            <YAxis stroke="#cbd5e1" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
            <Bar dataKey="revenue" fill="#D70654" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

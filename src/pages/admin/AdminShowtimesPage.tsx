import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Calendar, Clock } from 'lucide-react'
import { supabase, type Showtime } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function AdminShowtimesPage() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShowtimes()
  }, [])

  const fetchShowtimes = async () => {
    try {
      const { data, error } = await supabase
        .from('showtimes')
        .select(`
          *,
          movie:movies(*),
          hall:halls(*)
        `)
        .order('show_date')
        .order('start_time')

      if (error) throw error
      setShowtimes(data || [])
    } catch (error) {
      console.error('Error fetching showtimes:', error)
      toast.error('Failed to load showtimes')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteShowtime = async (showtimeId: string) => {
    if (!confirm('Are you sure you want to delete this showtime?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('showtimes')
        .delete()
        .eq('showtime_id', showtimeId)

      if (error) throw error

      toast.success('Showtime deleted successfully')
      fetchShowtimes()
    } catch (error) {
      console.error('Error deleting showtime:', error)
      toast.error('Failed to delete showtime')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Showtimes</h1>
          <p className="text-slate-400">Manage movie showtimes</p>
        </div>
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Showtime</span>
        </button>
      </div>

      {showtimes.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-4">No showtimes found</p>
          <button className="btn btn-primary">Add Your First Showtime</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Movie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Hall
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {showtimes.map((showtime) => (
                  <tr key={showtime.showtime_id} className="hover:bg-dark-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={showtime.movie?.poster_url || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=60&h=90&fit=crop'}
                          alt={showtime.movie?.title}
                          className="w-10 h-15 object-cover rounded"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">
                            {showtime.movie?.title}
                          </div>
                          <div className="text-sm text-slate-400">
                            {showtime.movie?.genre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                        {showtime.hall?.hall_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-300">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        {new Date(showtime.show_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-300">
                        <Clock className="h-4 w-4 mr-2 text-slate-400" />
                        {showtime.start_time} - {showtime.end_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-400">
                      IDR {showtime.ticket_price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-green-400 hover:text-green-300">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteShowtime(showtime.showtime_id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
  )
}
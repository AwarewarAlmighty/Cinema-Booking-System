import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Building } from 'lucide-react'
import { supabase, type Hall } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function AdminHallsPage() {
  const [halls, setHalls] = useState<Hall[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHalls()
  }, [])

  const fetchHalls = async () => {
    try {
      const { data, error } = await supabase
        .from('halls')
        .select('*')
        .order('hall_name')

      if (error) throw error
      setHalls(data || [])
    } catch (error) {
      console.error('Error fetching halls:', error)
      toast.error('Failed to load halls')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHall = async (hallId: string) => {
    if (!confirm('Are you sure you want to delete this hall? This will also delete all related showtimes.')) {
      return
    }

    try {
      // First delete related showtimes
      await supabase
        .from('showtimes')
        .delete()
        .eq('hall_id', hallId)

      // Then delete the hall
      const { error } = await supabase
        .from('halls')
        .delete()
        .eq('hall_id', hallId)

      if (error) throw error

      toast.success('Hall deleted successfully')
      fetchHalls()
    } catch (error) {
      console.error('Error deleting hall:', error)
      toast.error('Failed to delete hall')
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
          <h1 className="text-3xl font-display font-bold">Halls</h1>
          <p className="text-slate-400">Manage your cinema halls</p>
        </div>
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Hall</span>
        </button>
      </div>

      {halls.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-4">No halls found</p>
          <button className="btn btn-primary">Add Your First Hall</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls.map((hall) => (
            <div key={hall.hall_id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{hall.hall_name}</h3>
                    <p className="text-sm text-slate-400">Hall ID: {hall.hall_id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-green-400 hover:text-green-300">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteHall(hall.hall_id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Seats</span>
                  <span className="text-white font-medium">{hall.total_seats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Layout</span>
                  <span className="text-white font-medium">
                    {hall.layout_rows} × {hall.layout_columns}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created</span>
                  <span className="text-white font-medium">
                    {new Date(hall.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-dark-600">
                <button className="btn btn-secondary w-full text-sm">
                  View Layout
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
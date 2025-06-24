import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { supabase, type Movie } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMovies(data || [])
    } catch (error) {
      console.error('Error fetching movies:', error)
      toast.error('Failed to load movies')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm('Are you sure you want to delete this movie? This will also delete all related showtimes.')) {
      return
    }

    try {
      // First delete related showtimes
      await supabase
        .from('showtimes')
        .delete()
        .eq('movie_id', movieId)

      // Then delete the movie
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('movie_id', movieId)

      if (error) throw error

      toast.success('Movie deleted successfully')
      fetchMovies()
    } catch (error) {
      console.error('Error deleting movie:', error)
      toast.error('Failed to delete movie')
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
          <h1 className="text-3xl font-display font-bold">Movies</h1>
          <p className="text-slate-400">Manage your movie catalog</p>
        </div>
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Movie</span>
        </button>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg mb-4">No movies found</p>
          <button className="btn btn-primary">Add Your First Movie</button>
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
                    Genre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Release Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {movies.map((movie) => (
                  <tr key={movie.movie_id} className="hover:bg-dark-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={movie.poster_url || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=100&h=150&fit=crop'}
                          alt={movie.title}
                          className="w-12 h-18 object-cover rounded"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {movie.title}
                          </div>
                          <div className="text-sm text-slate-400 line-clamp-2 max-w-xs">
                            {movie.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-primary-500/20 text-primary-400 rounded-full">
                        {movie.genre}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {movie.duration} mins
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {new Date(movie.release_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-400 hover:text-blue-300">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-400 hover:text-green-300">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMovie(movie.movie_id)}
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
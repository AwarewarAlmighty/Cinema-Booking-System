import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, Calendar, Play, Ticket } from 'lucide-react'
import { supabase, type Movie } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchMovie(id)
    }
  }, [id])

  const fetchMovie = async (movieId: string) => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('movie_id', movieId)
        .single()

      if (error) throw error
      setMovie(data)
    } catch (error) {
      console.error('Error fetching movie:', error)
    } finally {
      setLoading(false)
    }
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
          <Link to="/movies" className="btn btn-primary">
            Back to Movies
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Poster */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <img
                src={movie.poster_url || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=600&h=900&fit=crop'}
                alt={movie.title}
                className="w-full rounded-xl shadow-2xl"
              />
            </div>
          </div>

          {/* Movie Details */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-display font-bold mb-4">
                  {movie.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-slate-400 mb-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>{movie.duration} minutes</span>
                  </div>
                  <div className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium">
                    {movie.genre}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">Synopsis</h2>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {movie.description}
                </p>
              </div>

              {/* Trailer */}
              {movie.trailer_url && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Trailer</h2>
                  <div className="aspect-video rounded-xl overflow-hidden bg-dark-800">
                    <iframe
                      src={movie.trailer_url}
                      title={`${movie.title} Trailer`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link
                  to={`/seat-selection/${movie.movie_id}`}
                  className="btn btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
                >
                  <Ticket className="h-5 w-5" />
                  <span>Book Tickets</span>
                </Link>
                {movie.trailer_url && (
                  <button className="btn btn-secondary text-lg px-8 py-3 flex items-center justify-center space-x-2">
                    <Play className="h-5 w-5" />
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Star, Ticket } from 'lucide-react'
import { supabase, type Movie } from '@/lib/supabase'
import MovieCard from '@/components/MovieCard'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null)

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .lte('release_date', new Date().toISOString().split('T')[0])
        .order('release_date', { ascending: false })
        .limit(8)

      if (error) throw error

      setMovies(data || [])
      if (data && data.length > 0) {
        setFeaturedMovie(data[0])
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {featuredMovie && (
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${featuredMovie.poster_url || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-dark-950/90 via-dark-950/70 to-dark-950/90" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              <span className="text-gradient">Experience Cinema</span>
              <br />
              <span className="text-white">Like Never Before</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Immerse yourself in the latest blockbusters with premium sound, 
              comfortable seating, and an unforgettable movie experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/movies" className="btn btn-primary text-lg px-8 py-3">
                <Ticket className="h-5 w-5 mr-2" />
                Book Now
              </Link>
              <Link to={`/movies/${featuredMovie.movie_id}`} className="btn btn-secondary text-lg px-8 py-3">
                <Play className="h-5 w-5 mr-2" />
                Watch Trailer
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Now Showing Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="text-gradient">Now Showing</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Discover the latest movies playing in our theaters. From action-packed blockbusters 
              to heartwarming dramas, we have something for everyone.
            </p>
          </div>

          {movies.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {movies.map((movie) => (
                  <MovieCard key={movie.movie_id} movie={movie} />
                ))}
              </div>
              
              <div className="text-center">
                <Link to="/movies" className="btn btn-accent text-lg px-8 py-3">
                  View All Movies
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No movies currently showing.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Why Choose <span className="text-gradient">Cinema Indonesia</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Experience</h3>
              <p className="text-slate-400">
                State-of-the-art sound systems and crystal-clear projection for the ultimate viewing experience.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="h-8 w-8 text-accent-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-slate-400">
                Simple and secure online booking system. Reserve your seats in just a few clicks.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Latest Movies</h3>
              <p className="text-slate-400">
                Always up-to-date with the latest releases and blockbuster movies from around the world.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
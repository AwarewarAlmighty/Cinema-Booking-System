import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Ticket } from 'lucide-react';
import { IMovie } from '@/lib/mongodb';
import MovieCard from '@/components/MovieCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredMovie, setFeaturedMovie] = useState<IMovie | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/movies');
      const data = await response.json();

      setMovies(data || []);
      if (data && data.length > 0) {
        // Use a random movie for the hero section for variety
        const randomIndex = Math.floor(Math.random() * data.length);
        setFeaturedMovie(data[randomIndex]);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
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
              <Link to={`/movie/${featuredMovie._id}`} className="btn btn-secondary text-lg px-8 py-3">
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
                {/* The fix is here: using movie._id as the key */}
                {movies.map((movie) => (
                  <MovieCard key={movie._id} movie={movie} />
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
    </div>
  );
}
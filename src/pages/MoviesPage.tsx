import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { IMovie } from '@/lib/mongodb';
import MovieCard from '@/components/MovieCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { apiFetch } from '@/lib/api';

export default function MoviesPage() {
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<IMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const moviesPerPage = 8;


  useEffect(() => {
    fetchMovies();
  }, [currentPage]);

  useEffect(() => {
    filterMovies();
  }, [movies, searchTerm, selectedGenre]);

  const fetchMovies = async () => {
  setLoading(true);
  try {
    const response = await fetch(`/api/movies?page=${currentPage}&perPage=${moviesPerPage}`);
    if (!response.ok) throw new Error('Failed to fetch movies');
    const data = await response.json();

    setMovies(data || []);

    // You can’t get total pages unless backend includes it — let's manually assume max 30 for now
    setTotalPages(Math.ceil(30 / moviesPerPage)); // OR better: send totalPages in the API response
  } catch (error) {
    console.error('Error fetching movies:', error);
  } finally {
    setLoading(false);
  }
};


  const filterMovies = () => {
    let filtered = movies;

    if (searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre) {
      filtered = filtered.filter(movie => movie.genre === selectedGenre);
    }

    setFilteredMovies(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">
            <span className="text-gradient">Available Movies</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Browse our collection of the latest movies and find your next favorite film.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="input pl-10 pr-8 appearance-none bg-dark-800"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">
              {searchTerm || selectedGenre 
                ? 'No movies found matching your criteria.' 
                : 'No movies currently available.'
              }
            </p>
          </div>
        )}
        <div className="flex justify-center mt-8 space-x-4">
          <button
            className="btn btn-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span className="text-white text-sm flex items-center">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}
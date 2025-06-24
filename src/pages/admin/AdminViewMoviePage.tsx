// src/pages/admin/AdminViewMoviePage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Movie } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminViewMoviePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('movie_id', id)
        .single();

      if (!error) setMovie(data);
      setLoading(false);
    };

    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!movie) return <p className="p-6">Movie not found</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/admin/movies')}
        className="btn btn-secondary mb-4"
      >
        ← Back to Movie List
      </button>

      <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
      <img src={movie.poster_url} className="w-40 h-auto rounded mb-4" alt={movie.title} />
      <p className="text-slate-300 mb-2">{movie.description}</p>
      <p className="text-sm text-slate-400">Genre: {movie.genre}</p>
      <p className="text-sm text-slate-400">Duration: {movie.duration} mins</p>
      <p className="text-sm text-slate-400">
        Release: {new Date(movie.release_date).toLocaleDateString()}
      </p>
    </div>
  );
}

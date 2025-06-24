import { Link } from 'react-router-dom'
import { Clock, Calendar } from 'lucide-react'
import type { Movie } from '@/lib/supabase'

interface MovieCardProps {
  movie: Movie
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="movie-card group">
      <div className="aspect-[2/3] overflow-hidden">
        <img
          src={movie.poster_url || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center space-x-4 text-sm text-slate-400 mb-3">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{movie.duration} mins</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(movie.release_date).getFullYear()}</span>
          </div>
        </div>
        <p className="text-slate-300 text-sm mb-4 line-clamp-2">
          {movie.description}
        </p>
        <Link
          to={`/movies/${movie.movie_id}`}
          className="btn btn-primary w-full"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
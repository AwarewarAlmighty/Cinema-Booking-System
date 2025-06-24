// src/pages/admin/AdminEditMoviePage.tsx
import { useNavigate } from 'react-router-dom';
import EditMovieForm from '@/components/EditMovieForm';

export default function AdminEditMoviePage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button
        onClick={() => navigate('/admin/movies')}
        className="btn btn-secondary mb-4"
      >
        ← Back to Movie List
      </button>

      <h1 className="text-2xl font-bold mb-4">Edit Movie</h1>
      <EditMovieForm />
    </div>
  );
}

// src/pages/admin/AdminAddMoviePage.tsx
import { useNavigate } from 'react-router-dom';
import AddMovieForm from '@/components/AddMovieForm';

export default function AdminAddMoviePage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button
        onClick={() => navigate('/admin/movies')}
        className="btn btn-primary mb-4"
      >
        ← Back to Movie List
      </button>

      <h1 className="text-2xl font-bold mb-4">Add New Movie</h1>
      <AddMovieForm />
    </div>
  );
}

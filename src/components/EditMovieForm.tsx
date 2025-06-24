// src/components/EditMovieForm.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function EditMovieForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    genre: '',
    duration: '',
    release_date: '',
    poster_url: '',
    trailer_url: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('movie_id', id)
        .single();

      if (error) {
        toast.error('Movie not found');
        return;
      }

      setForm({
        ...data,
        duration: String(data.duration),
        release_date: data.release_date.slice(0, 10), // format YYYY-MM-DD
      });
    };

    fetchMovie();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('movies')
      .update({ ...form, duration: parseInt(form.duration) })
      .eq('movie_id', id);

    setLoading(false);

    if (error) {
      toast.error('Failed to update movie');
    } else {
      toast.success('Movie updated successfully');
      navigate('/admin/movies');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
      <Textarea label="Description" name="description" value={form.description} onChange={handleChange} />
      <Input label="Genre" name="genre" value={form.genre} onChange={handleChange} required />
      <Input label="Duration (minutes)" name="duration" type="number" value={form.duration} onChange={handleChange} required />
      <Input label="Release Date" name="release_date" type="date" value={form.release_date} onChange={handleChange} required />
      <Input label="Poster URL" name="poster_url" value={form.poster_url} onChange={handleChange} />
      <Input label="Trailer URL" name="trailer_url" value={form.trailer_url} onChange={handleChange} />
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Updating...' : 'Update Movie'}
      </button>
    </form>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <input {...props} className="input input-bordered w-full" />
    </div>
  );
}

function Textarea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <textarea {...props} className="textarea textarea-bordered w-full" rows={4} />
    </div>
  );
}

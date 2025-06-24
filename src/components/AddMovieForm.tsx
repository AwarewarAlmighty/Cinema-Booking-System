// src/components/AddMovieForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function AddMovieForm() {
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
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.genre || !form.duration || !form.release_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('movies').insert({
      ...form,
      duration: parseInt(form.duration),
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to add movie');
      console.error('Error fetching movies:', error)
    } else {
      toast.success('Movie added successfully');
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
        {loading ? 'Adding...' : 'Add Movie'}
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

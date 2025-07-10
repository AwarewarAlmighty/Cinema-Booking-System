import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

// Define interfaces to match MongoDB models
// These help ensure type safety in the frontend code
export interface IMovie {
  _id: string;
  title: string;
}

export interface IHall {
  _id: string;
  hall_name: string;
}

export interface IShowtime {
  _id: string;
  movie: IMovie; // Populated from the backend
  hall: IHall;   // Populated from the backend
  show_date: string;
  start_time: string;
  end_time: string;
  ticket_price: number;
}

// Form data type for creating/editing showtimes
// It uses IDs instead of populated documents
type ShowtimeFormData = {
  movie_id: string;
  hall_id: string;
  show_date: string;
  start_time: string;
  end_time: string;
  ticket_price: number;
};

// Props for the ShowtimeForm component
interface ShowtimeFormProps {
  showtimeToEdit: IShowtime | null;
  onClose: () => void;
  onSave: () => void;
}

// ============== ShowtimeForm Component ==============
const ShowtimeForm: React.FC<ShowtimeFormProps> = ({ showtimeToEdit, onClose, onSave }) => {
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [halls, setHalls] = useState<IHall[]>([]);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShowtimeFormData>();

  // Fetch movies and halls for the dropdown selectors
  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const [moviesRes, hallsRes] = await Promise.all([
          fetch('/api/movies'),
          fetch('/api/halls')
        ]);
        const moviesData = await moviesRes.json();
        const hallsData = await hallsRes.json();
        setMovies(moviesData);
        setHalls(hallsData);
      } catch (error) {
        toast.error('Could not load movies or halls.');
      }
    };
    fetchPrerequisites();
  }, []);
  
  useEffect(() => {
    if (showtimeToEdit) {
      reset({
        movie_id: showtimeToEdit.movie._id,
        hall_id: showtimeToEdit.hall._id,
        show_date: new Date(showtimeToEdit.show_date).toISOString().split('T')[0],
        start_time: showtimeToEdit.start_time,
        end_time: showtimeToEdit.end_time,
        ticket_price: showtimeToEdit.ticket_price,
      });
    } else {
      reset();
    }
  }, [showtimeToEdit, reset]);

  const onSubmit: SubmitHandler<ShowtimeFormData> = async (formData) => {
    try {
      const dataToSubmit = {
        movie: formData.movie_id,
        hall: formData.hall_id,
        show_date: formData.show_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        ticket_price: Number(formData.ticket_price),
      };

      const url = showtimeToEdit ? `/api/showtimes/${showtimeToEdit._id}` : '/api/showtimes';
      const method = showtimeToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        throw new Error('Failed to save showtime.');
      }

      toast.success(`Showtime ${showtimeToEdit ? 'updated' : 'added'} successfully!`);
      onSave();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-dark-900/80 z-50 flex items-center justify-center">
      <div className="card w-full max-w-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">&times;</button>
        <h2 className="text-2xl font-bold mb-6">{showtimeToEdit ? 'Edit Showtime' : 'Add New Showtime'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Movie</label>
              <select {...register('movie_id', { required: 'Movie is required' })} className="input">
                <option value="">Select a movie</option>
                {movies.map(movie => <option key={movie._id} value={movie._id}>{movie.title}</option>)}
              </select>
              {errors.movie_id && <p className="text-red-400 text-sm mt-1">{errors.movie_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hall</label>
              <select {...register('hall_id', { required: 'Hall is required' })} className="input">
                <option value="">Select a hall</option>
                {halls.map(hall => <option key={hall._id} value={hall._id}>{hall.hall_name}</option>)}
              </select>
              {errors.hall_id && <p className="text-red-400 text-sm mt-1">{errors.hall_id.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Show Date</label>
              <input type="date" {...register('show_date', { required: 'Show date is required' })} className="input" />
              {errors.show_date && <p className="text-red-400 text-sm mt-1">{errors.show_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ticket Price (IDR)</label>
              <input type="number" {...register('ticket_price', { required: 'Price is required' })} className="input" />
              {errors.ticket_price && <p className="text-red-400 text-sm mt-1">{errors.ticket_price.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input type="time" {...register('start_time', { required: 'Start time is required' })} className="input" />
              {errors.start_time && <p className="text-red-400 text-sm mt-1">{errors.start_time.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input type="time" {...register('end_time', { required: 'End time is required' })} className="input" />
              {errors.end_time && <p className="text-red-400 text-sm mt-1">{errors.end_time.message}</p>}
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Save Showtime'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============== DeleteConfirmationModal Component ==============
interface DeleteModalProps {
    showtime: IShowtime;
    onClose: () => void;
    onConfirm: (showtimeId: string) => void;
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ showtime, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-dark-900/80 z-50 flex items-center justify-center">
            <div className="card p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                <p className="text-slate-300 mb-6">
                    Are you sure you want to delete the showtime for "<strong>{showtime.movie?.title}</strong>" on {new Date(showtime.show_date).toLocaleDateString()} at {showtime.start_time}?
                </p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(showtime._id)}
                        className="btn btn-danger"
                    >
                        Delete Showtime
                    </button>
                </div>
            </div>
        </div>
    );
};


// ============== AdminShowtimesPage Component ==============
export default function AdminShowtimesPage() {
  const [showtimes, setShowtimes] = useState<IShowtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<IShowtime | null>(null);
  const [showtimeToDelete, setShowtimeToDelete] = useState<IShowtime | null>(null);

  useEffect(() => {
    fetchShowtimes();
  }, []);

  const fetchShowtimes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/showtimes');
      if (!response.ok) throw new Error('Failed to fetch showtimes');
      const data = await response.json();
      setShowtimes(data || []);
    } catch (error) {
      toast.error('Failed to load showtimes');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenModal = (showtime: IShowtime | null) => {
    setEditingShowtime(showtime);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShowtime(null);
  };
  
  const handleSave = () => {
    fetchShowtimes();
    handleCloseModal();
  };

  const handleDeleteClick = (showtime: IShowtime) => {
    setShowtimeToDelete(showtime);
  };

  const handleConfirmDelete = async (showtimeId: string) => {
    try {
      const response = await fetch(`/api/showtimes/${showtimeId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete showtime.');
      toast.success('Showtime deleted successfully');
      fetchShowtimes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete showtime');
    } finally {
      setShowtimeToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
       {isModalOpen && (
          <ShowtimeForm 
            showtimeToEdit={editingShowtime}
            onClose={handleCloseModal}
            onSave={handleSave}
          />
       )}
       {showtimeToDelete && (
          <DeleteConfirmationModal
              showtime={showtimeToDelete}
              onClose={() => setShowtimeToDelete(null)}
              onConfirm={handleConfirmDelete}
          />
       )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Showtimes</h1>
          <p className="text-slate-400">Manage movie showtimes</p>
        </div>
        <button onClick={() => handleOpenModal(null)} className="btn btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Showtime</span>
        </button>
      </div>

      {showtimes.length === 0 ? (
        <div className="text-center py-12 card">
          <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-4">No showtimes found</p>
          <button onClick={() => handleOpenModal(null)} className="btn btn-primary">Add Your First Showtime</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Movie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Hall
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {showtimes.map((showtime) => (
                  <tr key={showtime._id} className="hover:bg-dark-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white max-w-xs truncate">
                            {showtime.movie?.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                        {showtime.hall?.hall_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      <div>{new Date(showtime.show_date).toLocaleDateString()}</div>
                      <div className="text-slate-400">{showtime.start_time} - {showtime.end_time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-400">
                      IDR {showtime.ticket_price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleOpenModal(showtime)} className="text-green-400 hover:text-green-300 p-2 rounded-full hover:bg-dark-700">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(showtime)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-dark-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
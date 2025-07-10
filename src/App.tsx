import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailsPage from './pages/MovieDetailsPage'; // Ensure this is imported
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User pages
import BookingsPage from './pages/user/BookingsPage';
import BookingDetailsPage from './pages/user/BookingDetailsPage';
import BookingPage from './pages/user/BookingPage';
import PaymentPage from './pages/user/PaymentPage';
import BookingConfirmationPage from './pages/user/BookingConfirmationPage';

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminMoviesPage from './pages/admin/AdminMoviesPage';
import AdminHallsPage from './pages/admin/AdminHallsPage';
import AdminShowtimesPage from './pages/admin/AdminShowtimesPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminBookingDetailsPage from './pages/admin/AdminBookingDetailsPage';

function App() {
  return (
    <Routes>
      {/* Public and User routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="movies" element={<MoviesPage />} />
        {/* This is the new, restored route for movie details */}
        <Route path="movie/:id" element={<MovieDetailsPage />} />
        <Route path="book/:movieId" element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        } />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* Protected user routes */}
        <Route path="bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path="bookings/:id" element={<ProtectedRoute><BookingDetailsPage /></ProtectedRoute>} />
        <Route path="payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="booking-confirmation" element={<ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="movies" element={<AdminMoviesPage />} />
        <Route path="halls" element={<AdminHallsPage />} />
        <Route path="showtimes" element={<AdminShowtimesPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="bookings/:id" element={<AdminBookingDetailsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
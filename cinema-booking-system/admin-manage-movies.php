<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Handle movie deletion
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    
    $movie_id = intval($_GET['id']);
    
    // Delete related showtimes and their dependencies
    $conn = dbConnect();
    
    // Delete related payments
    $sqlPayments = "DELETE p FROM payments p 
                    JOIN bookings b ON p.booking_id = b.booking_id 
                    JOIN showtimes s ON b.showtime_id = s.showtime_id 
                    WHERE s.movie_id = ?";
    $stmtPayments = $conn->prepare($sqlPayments);
    $stmtPayments->bind_param('i', $movie_id);
    
    if ($stmtPayments->execute()) {
        // Delete related bookings
        $sqlBookings = "DELETE b FROM bookings b 
                        JOIN showtimes s ON b.showtime_id = s.showtime_id 
                        WHERE s.movie_id = ?";
        $stmtBookings = $conn->prepare($sqlBookings);
        $stmtBookings->bind_param('i', $movie_id);
        
        if ($stmtBookings->execute()) {
            // Delete related showtimes
            $sqlShowtimes = "DELETE FROM showtimes WHERE movie_id = ?";
            $stmtShowtimes = $conn->prepare($sqlShowtimes);
            $stmtShowtimes->bind_param('i', $movie_id);
            
            if ($stmtShowtimes->execute()) {
                // Now delete the movie
                $sqlMovie = "DELETE FROM movies WHERE movie_id = ?";
                $stmtMovie = $conn->prepare($sqlMovie);
                $stmtMovie->bind_param('i', $movie_id);
                
                if ($stmtMovie->execute()) {
                    $delete_success = "Movie deleted successfully";
                } else {
                    $delete_error = "Failed to delete movie: " . $stmtMovie->error;
                }
                
            } else {
                $delete_error = "Failed to delete related showtimes: " . $stmtShowtimes->error;
            }
            
            $stmtShowtimes->close();
        } else {
            $delete_error = "Failed to delete related bookings: " . $stmtBookings->error;
        }
        
        $stmtBookings->close();
    } else {
        $delete_error = "Failed to delete related payments: " . $stmtPayments->error;
    }
    
    $stmtPayments->close();
    $conn->close();
}

// Get all movies from database
$conn = dbConnect();
$sql = "SELECT * FROM movies ORDER BY title";
$result = $conn->query($sql);
$movies = $result->fetch_all(MYSQLI_ASSOC);
$conn->close();
?>

<section class="admin-manage-movies">
    <h2>Manage Movies</h2>
    
    <?php if (isset($delete_success)): ?>
        <div class="success-message"><?php echo $delete_success; ?></div>
    <?php elseif (isset($delete_error)): ?>
        <div class="error-message"><?php echo $delete_error; ?></div>
    <?php endif; ?>
    
    <div class="manage-actions">
        <a href="admin-add-movie.php" class="btn add-btn">Add New Movie</a>
    </div>
    
    <div class="movies-table">
        <table>
            <thead>
                <tr>
                    <th>Movie ID</th>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Duration</th>
                    <th>Release Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (!empty($movies)): ?>
                    <?php foreach ($movies as $movie): ?>
                        <tr>
                            <td><?php echo $movie['movie_id']; ?></td>
                            <td><?php echo htmlspecialchars($movie['title']); ?></td>
                            <td><?php echo htmlspecialchars($movie['genre']); ?></td>
                            <td><?php echo $movie['duration']; ?> mins</td>
                            <td><?php echo date('M d, Y', strtotime($movie['release_date'])); ?></td>
                            <td>
                                <a href="admin-edit-movie.php?id=<?php echo $movie['movie_id']; ?>" class="btn edit-btn">Edit</a>
                                <a href="admin-manage-movies.php?action=delete&id=<?php echo $movie['movie_id']; ?>" class="btn delete-btn" onclick="return confirm('Are you sure you want to delete this movie?');">Delete</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="6" class="no-data">No movies found</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
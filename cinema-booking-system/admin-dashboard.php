<?php
include 'includes/header.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

$conn = dbConnect();

// Get movies count
$sqlMovies = "SELECT COUNT(*) AS total FROM movies";
$resultMovies = $conn->query($sqlMovies);
$moviesCount = $resultMovies->fetch_assoc()['total'];

// Get showtimes count
$sqlShowtimes = "SELECT COUNT(*) AS total FROM showtimes";
$resultShowtimes = $conn->query($sqlShowtimes);
$showtimesCount = $resultShowtimes->fetch_assoc()['total'];

// Get bookings count
$sqlBookings = "SELECT COUNT(*) AS total FROM bookings";
$resultBookings = $conn->query($sqlBookings);
$bookingsCount = $resultBookings->fetch_assoc()['total'];

// Get users count
$sqlUsers = "SELECT COUNT(*) AS total FROM users";
$resultUsers = $conn->query($sqlUsers);
$usersCount = $resultUsers->fetch_assoc()['total'];

// Get recent bookings
$sqlRecentBookings = "SELECT b.booking_id, u.full_name, m.title, h.hall_name, s.show_date, s.start_time, b.total_amount, b.booking_date 
                      FROM bookings b 
                      JOIN users u ON b.user_id = u.user_id 
                      JOIN showtimes s ON b.showtime_id = s.showtime_id 
                      JOIN movies m ON s.movie_id = m.movie_id 
                      JOIN halls h ON s.hall_id = h.hall_id 
                      ORDER BY b.booking_date DESC 
                      LIMIT 5";
$resultRecentBookings = $conn->query($sqlRecentBookings);
$recentBookings = $resultRecentBookings->fetch_all(MYSQLI_ASSOC);

$conn->close();
?>

<section class="admin-dashboard">
    <h2>Admin Dashboard</h2>
    
    <div class="dashboard-stats">
        <div class="stat-card">
            <h3>Total Movies</h3>
            <p class="stat-number"><?php echo $moviesCount; ?></p>
        </div>
        <div class="stat-card">
            <h3>Total Showtimes</h3>
            <p class="stat-number"><?php echo $showtimesCount; ?></p>
        </div>
        <div class="stat-card">
            <h3>Total Bookings</h3>
            <p class="stat-number"><?php echo $bookingsCount; ?></p>
        </div>
        <div class="stat-card">
            <h3>Total Users</h3>
            <p class="stat-number"><?php echo $usersCount; ?></p>
        </div>
    </div>
    
    <div class="dashboard-sections">
        <div class="dashboard-section">
            <h3>Recent Bookings</h3>
            <div class="bookings-table">
                <table>
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>User</th>
                            <th>Movie</th>
                            <th>Hall</th>
                            <th>Date & Time</th>
                            <th>Total</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($recentBookings as $booking) { ?>
                            <tr>
                                <td><?php echo $booking['booking_id']; ?></td>
                                <td><?php echo $booking['full_name']; ?></td>
                                <td><?php echo $booking['title']; ?></td>
                                <td><?php echo $booking['hall_name']; ?></td>
                                <td>
                                    <?php echo date('M d, Y', strtotime($booking['show_date'])); ?><br>
                                    <?php echo date('h:ia', strtotime($booking['start_time'])); ?>
                                </td>
                                <td>IDR <?php echo number_format($booking['total_amount']); ?></td>
                                <td><?php echo date('M d, Y h:ia', strtotime($booking['booking_date'])); ?></td>
                            </tr>
                        <?php } ?>
                    </tbody>
                </table>
            </div>
            <a href="admin-reports.php" class="btn view-all-btn">View All Bookings</a>
        </div>
        
        <div class="dashboard-section">
            <h3>Manage Movies</h3>
            <div class="action-buttons">
                <a href="admin-add-movie.php" class="btn add-btn">Add New Movie</a>
                <a href="admin-manage-movies.php" class="btn manage-btn">Manage Movies</a>
            </div>
        </div>
        
        <div class="dashboard-section">
            <h3>Manage Showtimes</h3>
            <div class="action-buttons">
                <a href="admin-add-showtime.php" class="btn add-btn">Add New Showtime</a>
                <a href="admin-manage-showtimes.php" class="btn manage-btn">Manage Showtimes</a>
            </div>
        </div>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
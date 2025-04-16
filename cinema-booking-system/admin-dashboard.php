<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

$conn = dbConnect();

// Get statistics
$sqlMovies = "SELECT COUNT(*) AS total FROM movies";
$resultMovies = $conn->query($sqlMovies);
$moviesCount = $resultMovies->fetch_assoc()['total'];

$sqlShowtimes = "SELECT COUNT(*) AS total FROM showtimes";
$resultShowtimes = $conn->query($sqlShowtimes);
$showtimesCount = $resultShowtimes->fetch_assoc()['total'];

$sqlBookings = "SELECT COUNT(*) AS total FROM bookings";
$resultBookings = $conn->query($sqlBookings);
$bookingsCount = $resultBookings->fetch_assoc()['total'];

$sqlUsers = "SELECT COUNT(*) AS total FROM users";
$resultUsers = $conn->query($sqlUsers);
$usersCount = $resultUsers->fetch_assoc()['total'];

$sqlHalls = "SELECT COUNT(*) AS total FROM halls";
$resultHalls = $conn->query($sqlHalls);
$hallsCount = $resultHalls->fetch_assoc()['total'];

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
        <div class="stat-card">
            <h3>Total Halls</h3>
            <p class="stat-number"><?php echo $hallsCount; ?></p>
        </div>
    </div>
    
    <div class="dashboard-sections">
        <div class="dashboard-section">
            <h3>Recent Bookings</h3>
            <div class="bookings-table">
                <!-- Recent bookings would be displayed here -->
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
            <h3>Manage Halls</h3>
            <div class="action-buttons">
                <a href="admin-add-hall.php" class="btn add-btn">Add New Hall</a>
                <a href="admin-manage-halls.php" class="btn manage-btn">Manage Halls</a>
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
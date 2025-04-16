<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Get showtime ID from URL
$showtime_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($showtime_id <= 0) {
    header('Location: admin-manage-showtimes.php');
    exit();
}

// Get showtime details
$conn = dbConnect();
$sql = "SELECT s.*, m.title AS movie_title, h.hall_name 
        FROM showtimes s 
        JOIN movies m ON s.movie_id = m.movie_id 
        JOIN halls h ON s.hall_id = h.hall_id 
        WHERE s.showtime_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $showtime_id);
$stmt->execute();
$result = $stmt->get_result();
$showtime = $result->fetch_assoc();

$conn->close();

// If showtime not found
if (!$showtime) {
    header('Location: admin-manage-showtimes.php');
    exit();
}
?>

<section class="admin-view-showtime">
    <h2>Showtime Details</h2>
    
    <div class="showtime-details">
        <div class="detail-card">
            <h3>Showtime Information</h3>
            <div class="detail-item">
                <span class="label">Showtime ID:</span>
                <span class="value"><?php echo $showtime['showtime_id']; ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Movie:</span>
                <span class="value"><?php echo htmlspecialchars($showtime['movie_title']); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Hall:</span>
                <span class="value"><?php echo htmlspecialchars($showtime['hall_name']); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Date:</span>
                <span class="value"><?php echo date('M d, Y', strtotime($showtime['show_date'])); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Start Time:</span>
                <span class="value"><?php echo date('h:ia', strtotime($showtime['start_time'])); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">End Time:</span>
                <span class="value"><?php echo date('h:ia', strtotime($showtime['end_time'])); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Ticket Price:</span>
                <span class="value">IDR <?php echo number_format($showtime['ticket_price']); ?></span>
            </div>
        </div>
        
        <div class="actions">
            <a href="admin-edit-showtime.php?id=<?php echo $showtime['showtime_id']; ?>" class="btn edit-btn">Edit Showtime</a>
            <a href="admin-manage-showtimes.php" class="btn back-btn">Back to Showtimes</a>
        </div>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
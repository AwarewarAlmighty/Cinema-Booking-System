<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Get booking ID from URL
$booking_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($booking_id <= 0) {
    header('Location: admin-manage-bookings.php');
    exit();
}

// Get booking details
$conn = dbConnect();
$sql = "SELECT b.*, u.full_name AS user_name, m.title AS movie_title, h.hall_name 
        FROM bookings b
        JOIN users u ON b.user_id = u.user_id
        JOIN showtimes s ON b.showtime_id = s.showtime_id
        JOIN movies m ON s.movie_id = m.movie_id
        JOIN halls h ON s.hall_id = h.hall_id
        WHERE b.booking_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $booking_id);
$stmt->execute();
$result = $stmt->get_result();
$booking = $result->fetch_assoc();

$conn->close();

// If booking not found
if (!$booking) {
    header('Location: admin-manage-bookings.php');
    exit();
}

// Handle success/error messages
$success = isset($_GET['success']) ? urldecode($_GET['success']) : '';
$error = isset($_GET['error']) ? urldecode($_GET['error']) : '';
?>

<section class="admin-view-booking">
    <h2>Booking Details</h2>
    
    <?php if ($success): ?>
        <div class="success-message"><?php echo $success; ?></div>
    <?php elseif ($error): ?>
        <div class="error-message"><?php echo $error; ?></div>
    <?php endif; ?>
    
    <div class="booking-details">
        <div class="detail-card">
            <h3>Booking Information</h3>
            <div class="detail-item">
                <span class="label">Booking ID:</span>
                <span class="value"><?php echo $booking['booking_id']; ?></span>
            </div>
            <div class="detail-item">
                <span class="label">User:</span>
                <span class="value"><?php echo htmlspecialchars($booking['user_name']); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Movie:</span>
                <span class="value"><?php echo htmlspecialchars($booking['movie_title']); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Hall:</span>
                <span class="value"><?php echo htmlspecialchars($booking['hall_name']); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Date:</span>
                <span class="value"><?php echo date('M d, Y', strtotime($booking['show_date'])); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Time:</span>
                <span class="value"><?php echo date('h:ia', strtotime($booking['start_time'])); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Seats:</span>
                <span class="value"><?php echo $booking['total_seats']; ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Total Amount:</span>
                <span class="value">IDR <?php echo number_format($booking['total_amount']); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Status:</span>
                <span class="value status <?php echo strtolower($booking['status']); ?>"><?php echo ucfirst($booking['status']); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Booking Date:</span>
                <span class="value"><?php echo date('M d, Y h:ia', strtotime($booking['booking_date'])); ?></span>
            </div>
        </div>
        
        <div class="actions">
            <?php if ($booking['status'] === 'pending' || $booking['status'] === 'confirmed'): ?>
                <a href="admin-cancel-booking.php?id=<?php echo $booking['booking_id']; ?>" class="btn cancel-btn" onclick="return confirm('Are you sure you want to cancel this booking?');">Cancel Booking</a>
            <?php endif; ?>
            <a href="admin-manage-bookings.php" class="btn back-btn">Back to Bookings</a>
        </div>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Check if booking ID is provided
if (!isset($_GET['id'])) {
    header('Location: admin-manage-bookings.php');
    exit();
}

$booking_id = intval($_GET['id']);

// Get booking details
$conn = dbConnect();
$sql = "SELECT b.booking_id, b.total_amount, b.total_seats, b.booking_date, b.status, 
               s.show_date, s.start_time, m.title, h.hall_name, u.full_name
        FROM bookings b
        JOIN showtimes s ON b.showtime_id = s.showtime_id
        JOIN movies m ON s.movie_id = m.movie_id
        JOIN halls h ON s.hall_id = h.hall_id
        JOIN users u ON b.user_id = u.user_id
        WHERE b.booking_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $booking_id);
$stmt->execute();
$result = $stmt->get_result();
$booking = $result->fetch_assoc();

$conn->close();

// If booking not found or already cancelled
if (!$booking || $booking['status'] === 'cancelled') {
    header('Location: admin-manage-bookings.php');
    exit();
}

// Handle booking cancellation
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn = dbConnect();
    $sql = "UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $booking_id);
    
    if ($stmt->execute()) {
        $success = "Booking cancelled successfully";
    } else {
        $error = "Failed to cancel booking: " . $conn->error;
    }
    
    $stmt->close();
    $conn->close();
}
?>

<section class="admin-cancel-booking">
    <h2>Cancel Booking</h2>
    
    <?php if (isset($success)): ?>
        <div class="success-message"><?php echo $success; ?></div>
    <?php elseif (isset($error)): ?>
        <div class="error-message"><?php echo $error; ?></div>
    <?php endif; ?>
    
    <div class="booking-details">
        <h3>Booking Information</h3>
        <div class="detail-item">
            <span class="label">Booking ID:</span>
            <span class="value"><?php echo $booking['booking_id']; ?></span>
        </div>
        <div class="detail-item">
            <span class="label">User:</span>
            <span class="value"><?php echo htmlspecialchars($booking['full_name']); ?></span>
        </div>
        <div class="detail-item">
            <span class="label">Movie:</span>
            <span class="value"><?php echo htmlspecialchars($booking['title']); ?></span>
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
            <span class="value"><span class="status <?php echo strtolower($booking['status']); ?>"><?php echo ucfirst($booking['status']); ?></span></span>
        </div>
        <div class="detail-item">
            <span class="label">Booking Date:</span>
            <span class="value"><?php echo date('M d, Y h:ia', strtotime($booking['booking_date'])); ?></span>
        </div>
    </div>
    
    <form action="admin-cancel-booking.php?id=<?php echo $booking['booking_id']; ?>" method="post">
        <div class="form-actions">
            <button type="submit" class="btn cancel-btn">Cancel Booking</button>
            <a href="admin-manage-bookings.php" class="btn back-btn">Back to Bookings</a>
        </div>
    </form>
</section>

<?php
include 'includes/footer.php';
?>
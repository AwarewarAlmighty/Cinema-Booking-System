<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Get booking ID from URL
$booking_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($booking_id <= 0) {
    header('Location: bookings.php');
    exit();
}

// Get booking details
$conn = dbConnect();
$user_id = $_SESSION['user_id'];

$sql = "SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ii', $booking_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();
$booking = $result->fetch_assoc();

$conn->close();

// If booking not found or doesn't belong to user
if (!$booking) {
    header('Location: bookings.php');
    exit();
}

// Handle booking cancellation
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn = dbConnect();
    $sql = "UPDATE bookings SET status = 'cancelled' WHERE booking_id = ? AND user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $booking_id, $user_id);
    
    if ($stmt->execute()) {
        $success = "Booking cancelled successfully";
    } else {
        $error = "Failed to cancel booking: " . $conn->error;
    }
    
    $stmt->close();
    $conn->close();
    
    // Redirect back to bookings page
    header('Location: bookings.php?' . (isset($success) ? 'success=' . urlencode($success) : 'error=' . urlencode($error)));
    exit();
}
?>

<section class="cancel-booking">
    <div class="cancel-container">
        <h2>Cancel Booking</h2>
        
        <div class="booking-summary">
            <h3>Are you sure you want to cancel this booking?</h3>
            <p>This action cannot be undone.</p>
            
            <div class="summary-item">
                <span>Movie:</span>
                <span><?php echo htmlspecialchars($booking['movie_title']); ?></span>
            </div>
            <div class="summary-item">
                <span>Date:</span>
                <span><?php echo date('M d, Y', strtotime($booking['show_date'])); ?></span>
            </div>
            <div class="summary-item">
                <span>Time:</span>
                <span><?php echo date('h:ia', strtotime($booking['start_time'])); ?></span>
            </div>
            <div class="summary-item">
                <span>Seats:</span>
                <span><?php echo $booking['total_seats']; ?></span>
            </div>
            <div class="summary-item total">
                <span>Total:</span>
                <span>IDR <?php echo number_format($booking['total_amount']); ?></span>
            </div>
        </div>
        
        <form action="cancel-booking.php?id=<?php echo $booking_id; ?>" method="post">
            <div class="form-actions">
                <button type="submit" class="btn cancel-btn">Yes, Cancel Booking</button>
                <a href="bookings.php" class="btn back-btn">No, Go Back</a>
            </div>
        </form>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
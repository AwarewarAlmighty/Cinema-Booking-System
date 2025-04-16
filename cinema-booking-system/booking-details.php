<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Check if booking ID is provided
if (!isset($_GET['id'])) {
    header('Location: bookings.php');
    exit();
}

$booking_id = intval($_GET['id']);

// Get booking details
$conn = dbConnect();
$user_id = $_SESSION['user_id'];

$sql = "SELECT b.*, s.show_date, s.start_time, m.title, h.hall_name 
        FROM bookings b
        JOIN showtimes s ON b.showtime_id = s.showtime_id
        JOIN movies m ON s.movie_id = m.movie_id
        JOIN halls h ON s.hall_id = h.hall_id
        WHERE b.booking_id = ? AND b.user_id = ?";
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
?>

<section class="booking-details">
    <h2>Booking Details</h2>
    
    <div class="details-card">
        <div class="movie-info">
            <h3><?php echo htmlspecialchars($booking['title']); ?></h3>
            <p>Booking ID: #<?php echo $booking['booking_id']; ?></p>
            <p>Date: <?php echo date('M d, Y', strtotime($booking['show_date'])); ?></p>
            <p>Time: <?php echo date('h:ia', strtotime($booking['start_time'])); ?></p>
            <p>Hall: <?php echo htmlspecialchars($booking['hall_name']); ?></p>
            <p>Seats: <?php echo $booking['total_seats']; ?></p>
            <p>Total: IDR <?php echo number_format($booking['total_amount']); ?></p>
            <p>Status: <span class="status <?php echo strtolower($booking['status']); ?>"><?php echo ucfirst($booking['status']); ?></span></p>
        </div>
        
        <div class="actions">
            <a href="bookings.php" class="btn back-btn">Back to Bookings</a>
            <?php if ($booking['status'] === 'pending'): ?>
                <a href="cancel-booking.php?id=<?php echo $booking['booking_id']; ?>" class="btn cancel-btn" onclick="return confirm('Are you sure you want to cancel this booking?');">Cancel Booking</a>
            <?php endif; ?>
        </div>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
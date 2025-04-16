<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Get booking details
$conn = dbConnect();
$user_id = $_SESSION['user_id'];

// Get the most recent confirmed booking
$sql = "SELECT b.booking_id, b.total_amount, b.total_seats, b.booking_date, b.status, 
               s.show_date, s.start_time, m.title, h.hall_name
        FROM bookings b
        JOIN showtimes s ON b.showtime_id = s.showtime_id
        JOIN movies m ON s.movie_id = m.movie_id
        JOIN halls h ON s.hall_id = h.hall_id
        WHERE b.user_id = ? AND b.status = 'confirmed'
        ORDER BY b.booking_date DESC
        LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $user_id);
$stmt->execute();
$result = $stmt->get_result();
$booking = $result->fetch_assoc();

$conn->close();

// If no recent booking found, redirect to bookings page
if (!$booking) {
    header('Location: bookings.php');
    exit();
}
?>

<section class="booking-confirmation">
    <div class="confirmation-card">
        <h2>Booking Confirmed!</h2>
        <div class="confirmation-details">
            <h3>Thank you for your booking</h3>
            <p>Your tickets have been successfully booked.</p>
            
            <div class="booking-summary">
                <h4>Booking Details</h4>
                <div class="summary-item">
                    <span>Movie:</span>
                    <span><?php echo htmlspecialchars($booking['title']); ?></span>
                </div>
                <div class="summary-item">
                    <span>Hall:</span>
                    <span><?php echo htmlspecialchars($booking['hall_name']); ?></span>
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
            
            <div class="actions">
                <a href="bookings.php" class="btn view-bookings-btn">View My Bookings</a>
                <a href="index.php" class="btn home-btn">Back to Home</a>
            </div>
        </div>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
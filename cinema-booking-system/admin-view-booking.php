<?php
// filepath: c:\xampp\htdocs\Cinema-Booking-System-main\cinema-booking-system\admin-view-booking.php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Check if booking ID is provided
if (!isset($_GET['id']) || empty($_GET['id'])) {
    header('Location: admin-reports.php');
    exit();
}

$booking_id = intval($_GET['id']);
$conn = dbConnect();

// Get booking details
$sql = "SELECT b.booking_id, u.full_name, u.email, u.phone, m.title, h.hall_name, s.show_date, s.start_time, b.total_amount, b.booking_date, b.status 
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

if (!$booking) {
    $error = "Booking not found.";
}

$stmt->close();
$conn->close();
?>

<section class="admin-view-booking">
    <h2>View Booking</h2>
    
    <?php if (isset($error)): ?>
        <div class="error-message"><?php echo $error; ?></div>
    <?php else: ?>
        <div class="booking-details">
            <h3>Booking Information</h3>
            <p><strong>Booking ID:</strong> <?php echo $booking['booking_id']; ?></p>
            <p><strong>User:</strong> <?php echo $booking['full_name']; ?> (<?php echo $booking['email']; ?>, <?php echo $booking['phone']; ?>)</p>
            <p><strong>Movie:</strong> <?php echo $booking['title']; ?></p>
            <p><strong>Hall:</strong> <?php echo $booking['hall_name']; ?></p>
            <p><strong>Show Date & Time:</strong> 
                <?php echo date('M d, Y', strtotime($booking['show_date'])); ?> at 
                <?php echo date('h:ia', strtotime($booking['start_time'])); ?>
            </p>
            <p><strong>Total Amount:</strong> IDR <?php echo number_format($booking['total_amount']); ?></p>
            <p><strong>Status:</strong> <span class="status <?php echo strtolower($booking['status']); ?>"><?php echo ucfirst($booking['status']); ?></span></p>
            <p><strong>Booking Date:</strong> <?php echo date('M d, Y h:ia', strtotime($booking['booking_date'])); ?></p>
        </div>
        
        <div class="booking-actions">
            <?php if ($booking['status'] === 'pending'): ?>
                <a href="admin-confirm-booking.php?id=<?php echo $booking['booking_id']; ?>" class="btn confirm-btn">Confirm</a>
                <a href="admin-cancel-booking.php?id=<?php echo $booking['booking_id']; ?>" class="btn cancel-btn">Cancel</a>
            <?php endif; ?>
            <a href="admin-reports.php" class="btn back-btn">Back to Reports</a>
        </div>
    <?php endif; ?>
</section>

<?php
include 'includes/footer.php';
?>
<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Handle booking cancellation
if (isset($_GET['action']) && $_GET['action'] === 'cancel' && isset($_GET['id'])) {
    $booking_id = intval($_GET['id']);
    
    // Cancel booking
    $conn = dbConnect();
    $sql = "UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $booking_id);
    
    if ($stmt->execute()) {
        $cancel_success = "Booking cancelled successfully";
    } else {
        $cancel_error = "Failed to cancel booking: " . $conn->error;
    }
    
    $stmt->close();
    $conn->close();
}

// Get date range from form or use default
$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-01');
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-d');

// Get all bookings with filtering
$conn = dbConnect();
$sql = "SELECT b.booking_id, b.total_amount, b.total_seats, b.booking_date, b.status, 
               s.show_date, s.start_time, m.title, h.hall_name, u.full_name 
        FROM bookings b
        JOIN showtimes s ON b.showtime_id = s.showtime_id
        JOIN movies m ON s.movie_id = m.movie_id
        JOIN halls h ON s.hall_id = h.hall_id
        JOIN users u ON b.user_id = u.user_id
        WHERE DATE(b.booking_date) BETWEEN ? AND ?
        ORDER BY b.booking_date DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ss', $startDate, $endDate);
$stmt->execute();
$result = $stmt->get_result();
$bookings = $result->fetch_all(MYSQLI_ASSOC);
$conn->close();
?>

<section class="admin-manage-bookings">
    <h2>Manage Bookings</h2>
    
    <?php if (isset($cancel_success)): ?>
        <div class="success-message"><?php echo $cancel_success; ?></div>
    <?php elseif (isset($cancel_error)): ?>
        <div class="error-message"><?php echo $cancel_error; ?></div>
    <?php endif; ?>
    
    <div class="manage-actions">
        <a href="admin-reports.php" class="btn view-all-btn">View Detailed Reports</a>
    </div>
    
    <div class="booking-filters">
        <form action="admin-manage-bookings.php" method="get" class="date-filter-form">
            <div class="form-group">
                <label for="start_date">Start Date</label>
                <input type="date" id="start_date" name="start_date" value="<?php echo $startDate; ?>" required>
            </div>
            <div class="form-group">
                <label for="end_date">End Date</label>
                <input type="date" id="end_date" name="end_date" value="<?php echo $endDate; ?>" required>
            </div>
            <button type="submit" class="btn filter-btn">Filter</button>
        </form>
    </div>
    
    <div class="bookings-table">
        <table>
            <thead>
                <tr>
                    <th>Booking ID</th>
                    <th>User</th>
                    <th>Movie</th>
                    <th>Hall</th>
                    <th>Show Date & Time</th>
                    <th>Seats</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Booking Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (!empty($bookings)): ?>
                    <?php foreach ($bookings as $booking): ?>
                        <tr>
                            <td><?php echo $booking['booking_id']; ?></td>
                            <td><?php echo htmlspecialchars($booking['full_name']); ?></td>
                            <td><?php echo htmlspecialchars($booking['title']); ?></td>
                            <td><?php echo htmlspecialchars($booking['hall_name']); ?></td>
                            <td>
                                <?php echo date('M d, Y', strtotime($booking['show_date'])); ?><br>
                                <?php echo date('h:ia', strtotime($booking['start_time'])); ?>
                            </td>
                            <td><?php echo $booking['total_seats']; ?></td>
                            <td>IDR <?php echo number_format($booking['total_amount']); ?></td>
                            <td><span class="status <?php echo strtolower($booking['status']); ?>"><?php echo ucfirst($booking['status']); ?></span></td>
                            <td><?php echo date('M d, Y h:ia', strtotime($booking['booking_date'])); ?></td>
                            <td>
                                <a href="admin-view-booking.php?id=<?php echo $booking['booking_id']; ?>" class="btn view-btn">View</a>
                                <?php if ($booking['status'] === 'pending' || $booking['status'] === 'confirmed'): ?>
                                    <a href="admin-manage-bookings.php?action=cancel&id=<?php echo $booking['booking_id']; ?>" class="btn cancel-btn" onclick="return confirm('Are you sure you want to cancel this booking?');">Cancel</a>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="10" class="no-data">No bookings found</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
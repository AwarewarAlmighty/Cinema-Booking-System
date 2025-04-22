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

// Get all bookings from database
$conn = dbConnect();
$sql = "SELECT b.booking_id, b.total_amount, b.total_seats, b.booking_date, b.status, 
               s.show_date, s.start_time, m.title, h.hall_name, u.full_name
        FROM bookings b
        JOIN showtimes s ON b.showtime_id = s.showtime_id
        JOIN movies m ON s.movie_id = m.movie_id
        JOIN halls h ON s.hall_id = h.hall_id
        JOIN users u ON b.user_id = u.user_id
        ORDER BY b.booking_date DESC";
$result = $conn->query($sql);
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
        <div class="search-container">
            <input type="text" id="search-bookings" placeholder="Search bookings...">
        </div>
    </div>
    
    <div class="bookings-table">
        <table>
            <thead>
                <tr>
                    <th>Booking ID</th>
                    <th>User</th>
                    <th>Movie</th>
                    <th>Hall</th>
                    <th>Date & Time</th>
                    <th>Seats</th>
                    <th>Total</th>
                    <th>Status</th>
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
                            <td>
                                <a href="admin-view-booking.php?id=<?php echo $booking['booking_id']; ?>" class="btn view-btn">View</a>
                                <?php if ($booking['status'] === 'pending'): ?>
                                    <a href="admin-confirm-booking.php?id=<?php echo $booking['booking_id']; ?>" class="btn confirm-btn">Confirm</a>
                                    <a href="admin-manage-bookings.php?action=cancel&id=<?php echo $booking['booking_id']; ?>" class="btn cancel-btn" onclick="return confirm('Are you sure you want to cancel this booking?');">Cancel</a>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="9" class="no-data">No bookings found</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</section>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.getElementById('search-bookings');
    const tableRows = document.querySelectorAll('.bookings-table tbody tr');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        tableRows.forEach(row => {
            const userId = row.cells[1].textContent;
            const movieTitle = row.cells[2].textContent.toLowerCase();
            const hallName = row.cells[3].textContent.toLowerCase();
            const bookingId = row.cells[0].textContent;
            
            if (userId.includes(searchTerm) || 
                movieTitle.includes(searchTerm) || 
                hallName.includes(searchTerm) || 
                bookingId.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
});
</script>

<?php
include 'includes/footer.php';
?>
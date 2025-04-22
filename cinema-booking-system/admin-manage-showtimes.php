<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Handle showtime deletion
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $showtime_id = intval($_GET['id']);
    
    // Delete related bookings and payments
    $conn = dbConnect();
    
    // Delete related payments
    $sqlPayments = "DELETE FROM payments WHERE booking_id IN (SELECT booking_id FROM bookings WHERE showtime_id = ?)";
    $stmtPayments = $conn->prepare($sqlPayments);
    $stmtPayments->bind_param('i', $showtime_id);
    
    if ($stmtPayments->execute()) {
        // Delete related bookings
        $sqlBookings = "DELETE FROM bookings WHERE showtime_id = ?";
        $stmtBookings = $conn->prepare($sqlBookings);
        $stmtBookings->bind_param('i', $showtime_id);
        
        if ($stmtBookings->execute()) {
            // Now delete the showtime
            $sqlShowtime = "DELETE FROM showtimes WHERE showtime_id = ?";
            $stmtShowtime = $conn->prepare($sqlShowtime);
            $stmtShowtime->bind_param('i', $showtime_id);
            
            if ($stmtShowtime->execute()) {
                $delete_success = "Showtime deleted successfully";
            } else {
                $delete_error = "Failed to delete showtime: " . $stmtShowtime->error;
            }
            
            $stmtShowtime->close();
        } else {
            $delete_error = "Failed to delete related bookings: " . $stmtBookings->error;
        }
        
        $stmtBookings->close();
    } else {
        $delete_error = "Failed to delete related payments: " . $stmtPayments->error;
    }
    
    $stmtPayments->close();
    $conn->close();
}

// Get all showtimes from database
$conn = dbConnect();
$sql = "SELECT s.showtime_id, m.title, h.hall_name, s.show_date, s.start_time, s.end_time 
        FROM showtimes s 
        JOIN movies m ON s.movie_id = m.movie_id 
        JOIN halls h ON s.hall_id = h.hall_id 
        ORDER BY s.show_date, s.start_time";
$result = $conn->query($sql);
$showtimes = $result->fetch_all(MYSQLI_ASSOC);
$conn->close();
?>

<section class="admin-manage-showtimes">
    <h2>Manage Showtimes</h2>
    
    <?php if (isset($delete_success)): ?>
        <div class="success-message"><?php echo $delete_success; ?></div>
    <?php elseif (isset($delete_error)): ?>
        <div class="error-message"><?php echo $delete_error; ?></div>
    <?php endif; ?>
    
    <div class="manage-actions">
        <a href="admin-add-showtime.php" class="btn add-btn">Add New Showtime</a>
    </div>
    
    <div class="showtimes-table">
        <table>
            <thead>
                <tr>
                    <th>Showtime ID</th>
                    <th>Movie</th>
                    <th>Hall</th>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (!empty($showtimes)): ?>
                    <?php foreach ($showtimes as $showtime): ?>
                        <tr>
                            <td><?php echo $showtime['showtime_id']; ?></td>
                            <td><?php echo htmlspecialchars($showtime['title']); ?></td>
                            <td><?php echo htmlspecialchars($showtime['hall_name']); ?></td>
                            <td><?php echo date('M d, Y', strtotime($showtime['show_date'])); ?></td>
                            <td><?php echo date('h:ia', strtotime($showtime['start_time'])); ?></td>
                            <td><?php echo date('h:ia', strtotime($showtime['end_time'])); ?></td>
                            <td>
                                <a href="admin-edit-showtime.php?id=<?php echo $showtime['showtime_id']; ?>" class="btn edit-btn">Edit</a>
                                <a href="admin-manage-showtimes.php?action=delete&id=<?php echo $showtime['showtime_id']; ?>" class="btn delete-btn" onclick="return confirm('Are you sure you want to delete this showtime?');">Delete</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="7" class="no-data">No showtimes found</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
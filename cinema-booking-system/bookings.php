<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Get bookings for the current user
$conn = dbConnect();
$user_id = $_SESSION['user_id'];

// Pagination variables
$perPage = 5;
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$offset = ($page - 1) * $perPage;

// Get total bookings count
$sqlCount = "SELECT COUNT(*) AS total FROM bookings WHERE user_id = ?";
$stmtCount = $conn->prepare($sqlCount);
$stmtCount->bind_param('i', $user_id);
$stmtCount->execute();
$resultCount = $stmtCount->get_result();
$totalBookings = $resultCount->fetch_assoc()['total'];
$totalPages = ceil($totalBookings / $perPage);

// Get bookings with pagination
$sqlBookings = "SELECT b.booking_id, b.total_amount, b.total_seats, b.booking_date, b.status, 
                       s.show_date, s.start_time, m.title, h.hall_name
                FROM bookings b
                JOIN showtimes s ON b.showtime_id = s.showtime_id
                JOIN movies m ON s.movie_id = m.movie_id
                JOIN halls h ON s.hall_id = h.hall_id
                WHERE b.user_id = ?
                ORDER BY b.booking_date DESC
                LIMIT ? OFFSET ?";
$stmtBookings = $conn->prepare($sqlBookings);
$stmtBookings->bind_param('iii', $user_id, $perPage, $offset);
$stmtBookings->execute();
$resultBookings = $stmtBookings->get_result();
$bookings = $resultBookings->fetch_all(MYSQLI_ASSOC);

$conn->close();
?>

<section class="user-bookings">
    <h2>My Bookings</h2>
    
    <?php if (empty($bookings)): ?>
        <div class="no-bookings">
            <p>You don't have any bookings yet.</p>
            <a href="index.php" class="btn browse-btn">Browse Movies</a>
        </div>
    <?php else: ?>
        <div class="bookings-table">
            <table>
                <thead>
                    <tr>
                        <th>Booking ID</th>
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
                    <?php foreach ($bookings as $booking): ?>
                        <tr>
                            <td><?php echo $booking['booking_id']; ?></td>
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
                                <a href="booking-details.php?id=<?php echo $booking['booking_id']; ?>" class="btn view-btn">View</a>
                                <?php if ($booking['status'] === 'pending'): ?>
                                    <a href="cancel-booking.php?id=<?php echo $booking['booking_id']; ?>" class="btn cancel-btn" onclick="return confirm('Are you sure you want to cancel this booking?');">Cancel</a>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        
        <?php if ($totalPages > 1): ?>
            <div class="pagination">
                <?php if ($page > 1): ?>
                    <a href="bookings.php?page=<?php echo $page - 1; ?>" class="btn prev-btn">Previous</a>
                <?php endif; ?>
                
                <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                    <a href="bookings.php?page=<?php echo $i; ?>" class="page-link <?php echo ($i == $page) ? 'active' : ''; ?>"><?php echo $i; ?></a>
                <?php endfor; ?>
                
                <?php if ($page < $totalPages): ?>
                    <a href="bookings.php?page=<?php echo $page + 1; ?>" class="btn next-btn">Next</a>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    <?php endif; ?>
</section>

<?php
include 'includes/footer.php';
?>
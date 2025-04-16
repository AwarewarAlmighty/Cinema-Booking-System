<?php
include 'includes/header.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

$conn = dbConnect();

// Get date range from form or use default
$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-01');
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-d');

// Get bookings report
$sqlBookings = "SELECT b.booking_id, u.full_name, m.title, h.hall_name, s.show_date, s.start_time, b.total_amount, b.booking_date, b.status 
                FROM bookings b 
                JOIN users u ON b.user_id = u.user_id 
                JOIN showtimes s ON b.showtime_id = s.showtime_id 
                JOIN movies m ON s.movie_id = m.movie_id 
                JOIN halls h ON s.hall_id = h.hall_id 
                WHERE DATE(b.booking_date) BETWEEN ? AND ?
                ORDER BY b.booking_date DESC";
$stmt = $conn->prepare($sqlBookings);
$stmt->bind_param('ss', $startDate, $endDate);
$stmt->execute();
$result = $stmt->get_result();
$bookings = $result->fetch_all(MYSQLI_ASSOC);

// Calculate total revenue
$totalRevenue = 0;
foreach ($bookings as $booking) {
    $totalRevenue += $booking['total_amount'];
}

$conn->close();
?>

<section class="admin-reports">
    <h2>Bookings Report</h2>
    
    <div class="report-filters">
        <form action="admin-reports.php" method="get" class="date-filter-form">
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
    
    <div class="report-summary">
        <h3>Summary</h3>
        <div class="summary-item">
            <span>Total Bookings:</span>
            <span><?php echo count($bookings); ?></span>
        </div>
        <div class="summary-item">
            <span>Total Revenue:</span>
            <span>IDR <?php echo number_format($totalRevenue); ?></span>
        </div>
    </div>
    
    <div class="report-table">
        <table>
            <thead>
                <tr>
                    <th>Booking ID</th>
                    <th>User</th>
                    <th>Movie</th>
                    <th>Hall</th>
                    <th>Date & Time</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($bookings as $booking) { ?>
                    <tr>
                        <td><?php echo $booking['booking_id']; ?></td>
                        <td><?php echo $booking['full_name']; ?></td>
                        <td><?php echo $booking['title']; ?></td>
                        <td><?php echo $booking['hall_name']; ?></td>
                        <td>
                            <?php echo date('M d, Y', strtotime($booking['show_date'])); ?><br>
                            <?php echo date('h:ia', strtotime($booking['start_time'])); ?>
                        </td>
                        <td>IDR <?php echo number_format($booking['total_amount']); ?></td>
                        <td><span class="status <?php echo strtolower($booking['status']); ?>"><?php echo ucfirst($booking['status']); ?></span></td>
                        <td><?php echo date('M d, Y h:ia', strtotime($booking['booking_date'])); ?></td>
                        <td>
                            <a href="admin-view-booking.php?id=<?php echo $booking['booking_id']; ?>" class="btn view-btn">View</a>
                            <?php if ($booking['status'] === 'pending') { ?>
                                <a href="admin-confirm-booking.php?id=<?php echo $booking['booking_id']; ?>" class="btn confirm-btn">Confirm</a>
                                <a href="admin-cancel-booking.php?id=<?php echo $booking['booking_id']; ?>" class="btn cancel-btn">Cancel</a>
                            <?php } ?>
                        </td>
                    </tr>
                <?php } ?>
            </tbody>
        </table>
    </div>
    
    <div class="report-actions">
        <a href="admin-export-report.php?start_date=<?php echo $startDate; ?>&end_date=<?php echo $endDate; ?>" class="btn export-btn">Export to CSV</a>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
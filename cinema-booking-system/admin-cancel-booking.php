<?php
// filepath: c:\xampp\htdocs\Cinema-Booking-System-main\cinema-booking-system\admin-cancel-booking.php
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

// Update booking status to "cancelled"
$sql = "UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $booking_id);

if ($stmt->execute()) {
    $cancel_success = "Booking has been successfully cancelled.";
} else {
    $cancel_error = "Failed to cancel booking: " . $conn->error;
}

$stmt->close();
$conn->close();

// Redirect back to the reports page with a success or error message
if (isset($cancel_success)) {
    header("Location: admin-reports.php?message=" . urlencode($cancel_success));
} else {
    header("Location: admin-reports.php?error=" . urlencode($cancel_error));
}
exit();
?>
<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Get booking ID from URL
$booking_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($booking_id <= 0) {
    header('Location: admin-manage-bookings.php');
    exit();
}

// Cancel booking
$conn = dbConnect();
$sql = "UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $booking_id);

if ($stmt->execute()) {
    $success = "Booking cancelled successfully";
} else {
    $error = "Failed to cancel booking: " . $conn->error;
}

$stmt->close();
$conn->close();

// Redirect back to bookings page with message
header('Location: admin-view-booking.php?id=' . $booking_id . '&' . (isset($success) ? 'success=' . urlencode($success) : 'error=' . urlencode($error)));
exit();
?>
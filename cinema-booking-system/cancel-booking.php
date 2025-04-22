<?php
include 'includes/functions.php';
include 'includes/config.php';
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Check if booking ID is provided
if (!isset($_GET['id']) || empty($_GET['id'])) {
    header('Location: bookings.php');
    exit();
}

$booking_id = intval($_GET['id']);
$user_id = $_SESSION['user_id'];

// Connect to the database
$conn = dbConnect();

// Verify if the booking belongs to the logged-in user and is pending
$sqlVerify = "SELECT status FROM bookings WHERE booking_id = ? AND user_id = ?";
$stmtVerify = $conn->prepare($sqlVerify);
$stmtVerify->bind_param('ii', $booking_id, $user_id);
$stmtVerify->execute();
$resultVerify = $stmtVerify->get_result();

if ($resultVerify->num_rows === 0) {
    $conn->close();
    header('Location: bookings.php');
    exit();
}

$booking = $resultVerify->fetch_assoc();
if ($booking['status'] !== 'pending') {
    $conn->close();
    header('Location: bookings.php');
    exit();
}

// Update the booking status to 'cancelled'
$sqlCancel = "UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?";
$stmtCancel = $conn->prepare($sqlCancel);
$stmtCancel->bind_param('i', $booking_id);
$stmtCancel->execute();

$conn->close();

// Redirect back to bookings page with a success message
header('Location: bookings.php?message=Booking cancelled successfully');
exit();
?>
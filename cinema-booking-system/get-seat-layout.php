<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if showtime ID is provided
if (!isset($_GET['showtime_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Showtime ID is required']);
    exit();
}

$showtime_id = intval($_GET['showtime_id']);

// Get hall ID for the showtime
$conn = dbConnect();
$sqlShowtime = "SELECT hall_id FROM showtimes WHERE showtime_id = ?";
$stmtShowtime = $conn->prepare($sqlShowtime);
$stmtShowtime->bind_param('i', $showtime_id);
$stmtShowtime->execute();
$resultShowtime = $stmtShowtime->get_result();
$showtime = $resultShowtime->fetch_assoc();

if (!$showtime) {
    http_response_code(404);
    echo json_encode(['error' => 'Showtime not found']);
    exit();
}

$hall_id = $showtime['hall_id'];

// Get seat layout for the hall
$sqlSeats = "SELECT s.seat_id, s.is_available 
             FROM seats s 
             WHERE s.hall_id = ? 
             ORDER BY s.row, s.column";
$stmtSeats = $conn->prepare($sqlSeats);
$stmtSeats->bind_param('i', $hall_id);
$stmtSeats->execute();
$resultSeats = $stmtSeats->get_result();
$seats = $resultSeats->fetch_all(MYSQLI_ASSOC);

$conn->close();

echo json_encode($seats);
?>
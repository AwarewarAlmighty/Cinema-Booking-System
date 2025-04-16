<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Check if showtime and seats are selected
if (!isset($_POST['showtime_id']) || !isset($_POST['selected_seats'])) {
    header('Location: seat-selection.php');
    exit();
}

$showtime_id = intval($_POST['showtime_id']);
$selected_seats = $_POST['selected_seats'];
$seat_count = count($selected_seats);

// Get showtime details
$conn = dbConnect();
$sqlShowtime = "SELECT s.*, m.title, h.hall_name 
                FROM showtimes s 
                JOIN movies m ON s.movie_id = m.movie_id 
                JOIN halls h ON s.hall_id = h.hall_id 
                WHERE s.showtime_id = ?";
$stmtShowtime = $conn->prepare($sqlShowtime);
$stmtShowtime->bind_param('i', $showtime_id);
$stmtShowtime->execute();
$resultShowtime = $stmtShowtime->get_result();
$showtime = $resultShowtime->fetch_assoc();

if (!$showtime) {
    $error = "Showtime not found";
    header('Location: seat-selection.php?error=' . urlencode($error));
    exit();
}

// Calculate total amount
$total_amount = $seat_count * $showtime['ticket_price'];

// Create booking
$booking_id = createBooking($_SESSION['user_id'], $showtime_id, $seat_count, $total_amount);

if ($booking_id) {
    // Update seat availability
    $hall_id = $showtime['hall_id'];
    $seatUpdates = [];
    $seatParams = [];
    
    foreach ($selected_seats as $seat) {
        $seatUpdates[] = "(?, ?, 0)";
        $seatParams[] = $hall_id;
        $seatParams[] = $seat;
    }
    
    $sqlUpdateSeats = "UPDATE seats SET is_available = 0 
                       WHERE hall_id = ? AND seat_id IN (" . implode(',', array_fill(0, count($selected_seats), '?')) . ")";
    
    $stmtUpdateSeats = $conn->prepare($sqlUpdateSeats);
    
    if ($stmtUpdateSeats) {
        $types = str_repeat('s', count($selected_seats) + 1);
        $stmtUpdateSeats->bind_param($types, ...$seatParams);
        
        if ($stmtUpdateSeats->execute()) {
            // Redirect to payment page
            $_SESSION['booking_data'] = [
                'movie_id' => $showtime['movie_id'],
                'movie_title' => $showtime['title'],
                'hall_id' => $hall_id,
                'hall_name' => $showtime['hall_name'],
                'show_date' => $showtime['show_date'],
                'start_time' => $showtime['start_time'],
                'selected_seats' => $selected_seats,
                'total_amount' => $total_amount
            ];
            
            header('Location: payment.php');
            exit();
        } else {
            $error = "Failed to update seat availability: " . $stmtUpdateSeats->error;
        }
        
        $stmtUpdateSeats->close();
    } else {
        $error = "Failed to prepare seat update statement: " . $conn->error;
    }
    
    // Rollback booking if seat update fails
    $sqlRollback = "DELETE FROM bookings WHERE booking_id = ?";
    $stmtRollback = $conn->prepare($sqlRollback);
    $stmtRollback->bind_param('i', $booking_id);
    $stmtRollback->execute();
    $stmtRollback->close();
} else {
    $error = "Failed to create booking: " . $conn->error;
}

$conn->close();

// Redirect back with error
header('Location: seat-selection.php?error=' . urlencode($error));
exit();
?>
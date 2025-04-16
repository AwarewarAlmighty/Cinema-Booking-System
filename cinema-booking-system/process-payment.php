<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Check if booking data is available
if (!isset($_SESSION['booking_data'])) {
    header('Location: seat-selection.php');
    exit();
}

// Process payment
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $payment_method = $_POST['payment_method'];
    $card_number = $_POST['card_number'];
    $expiry_date = $_POST['card_expiry'];
    $cvv = $_POST['card_cvv'];
    
    // Validate payment details
    $errors = validatePayment($_POST);
    
    if (empty($errors)) {
        // Create payment record
        $booking_id = $_SESSION['booking_data']['booking_id'];
        $total_amount = $_SESSION['booking_data']['total_amount'];
        
        if (createPayment($booking_id, $total_amount, $payment_method)) {
            // Update booking status to confirmed
            updateBookingStatus($booking_id, 'confirmed');
            
            // Clear booking data from session
            unset($_SESSION['booking_data']);
            
            // Redirect to booking confirmation
            header('Location: booking-confirmation.php');
            exit();
        } else {
            $error = "Payment processing failed. Please try again.";
        }
    } else {
        $error = "Invalid payment details. Please check your information.";
    }
}

// Redirect back to payment page with error
header('Location: payment.php?error=' . urlencode($error));
exit();
?>
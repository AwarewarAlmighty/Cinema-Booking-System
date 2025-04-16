<?php
include 'includes/header.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Check if showtime and seats are selected
if (!isset($_SESSION['booking_data'])) {
    header('Location: seat-selection.php');
    exit();
}

$bookingData = $_SESSION['booking_data'];
?>

<section class="payment-section">
    <h2>Payment Information</h2>
    
    <form action="process-payment.php" method="post" class="payment-form">
        <div class="payment-details">
            <h3>Booking Summary</h3>
            <div class="summary-details">
                <div class="summary-item">
                    <span>Movie:</span>
                    <span><?php echo $bookingData['movie_title']; ?></span>
                </div>
                <div class="summary-item">
                    <span>Hall:</span>
                    <span><?php echo $bookingData['hall_name']; ?></span>
                </div>
                <div class="summary-item">
                    <span>Date:</span>
                    <span><?php echo date('M d, Y', strtotime($bookingData['show_date'])); ?></span>
                </div>
                <div class="summary-item">
                    <span>Time:</span>
                    <span><?php echo date('h:ia', strtotime($bookingData['start_time'])); ?></span>
                </div>
                <div class="summary-item">
                    <span>Seats:</span>
                    <span><?php echo implode(', ', $bookingData['selected_seats']); ?></span>
                </div>
                <div class="summary-item total">
                    <span>Total:</span>
                    <span>IDR <?php echo number_format($bookingData['total_amount']); ?></span>
                </div>
            </div>
        </div>
        
        <div class="payment-method">
            <h3>Payment Method</h3>
            <div class="payment-options">
                <div class="payment-option">
                    <input type="radio" id="credit_card" name="payment_method" value="credit_card" checked>
                    <label for="credit_card">Credit Card</label>
                </div>
                <div class="payment-option">
                    <input type="radio" id="debit_card" name="payment_method" value="debit_card">
                    <label for="debit_card">Debit Card</label>
                </div>
                <div class="payment-option">
                    <input type="radio" id="paypal" name="payment_method" value="paypal">
                    <label for="paypal">PayPal</label>
                </div>
            </div>
        </div>
        
        <div class="payment-info">
            <h3>Payment Details</h3>
            <div class="form-group">
                <label for="card_number">Card Number</label>
                <input type="text" id="card_number" name="card_number" placeholder="1234 5678 9012 3456" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="expiry_date">Expiry Date</label>
                    <input type="text" id="expiry_date" name="expiry_date" placeholder="MM/YY" required>
                </div>
                <div class="form-group">
                    <label for="cvv">CVV</label>
                    <input type="text" id="cvv" name="cvv" placeholder="123" required>
                </div>
            </div>
            <div class="form-group">
                <label for="card_holder">Card Holder Name</label>
                <input type="text" id="card_holder" name="card_holder" required>
            </div>
        </div>
        
        <div class="form-actions">
            <a href="seat-selection.php" class="btn cancel-btn">Cancel</a>
            <button type="submit" class="btn pay-btn">Pay IDR <?php echo number_format($bookingData['total_amount']); ?></button>
        </div>
    </form>
</section>

<?php
include 'includes/footer.php';
?>
<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Get movie details
$movie_id = isset($_GET['movie_id']) ? intval($_GET['movie_id']) : 0;

if ($movie_id <= 0) {
    header('Location: index.php');
    exit();
}

$conn = dbConnect();
$sql = "SELECT * FROM movies WHERE movie_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $movie_id);
$stmt->execute();
$result = $stmt->get_result();
$movie = $result->fetch_assoc();

if (!$movie) {
    echo '<p>Movie not found.</p>';
    $conn->close();
    include 'includes/footer.php';
    exit();
}

// Get showtimes for the movie
$sqlShowtimes = "SELECT s.*, h.hall_name 
                 FROM showtimes s 
                 JOIN halls h ON s.hall_id = h.hall_id 
                 WHERE s.movie_id = ? AND s.show_date >= CURDATE() 
                 ORDER BY s.show_date, s.start_time";
$stmtShowtimes = $conn->prepare($sqlShowtimes);
$stmtShowtimes->bind_param('i', $movie_id);
$stmtShowtimes->execute();
$resultShowtimes = $stmtShowtimes->get_result();
$showtimes = $resultShowtimes->fetch_all(MYSQLI_ASSOC);

$conn->close();

// Handle seat selection
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['showtime_id']) && isset($_POST['selected_seats'])) {
    $showtime_id = intval($_POST['showtime_id']);
    $selected_seats = $_POST['selected_seats'];
    
    // Ensure selected_seats is an array
    if (!is_array($selected_seats)) {
        $selected_seats = explode(',', $selected_seats);
    }
    
    // Validate selection
    if (empty($selected_seats)) {
        $error = "Please select at least one seat";
    } else {
        // Create booking
        $conn = dbConnect();
        $user_id = $_SESSION['user_id'];
        
        // Get showtime details
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
        
        if ($showtime) {
            $seat_count = count($selected_seats);
            $total_amount = $seat_count * $showtime['ticket_price'];
            
            // Create booking
            $sqlBooking = "INSERT INTO bookings (user_id, showtime_id, total_seats, total_amount, status) 
                           VALUES (?, ?, ?, ?, 'pending')";
            $stmtBooking = $conn->prepare($sqlBooking);
            $stmtBooking->bind_param('iidd', $user_id, $showtime_id, $seat_count, $total_amount);
            
            if ($stmtBooking->execute()) {
                $booking_id = $conn->insert_id;
                
                // Store booking data in session
                $_SESSION['booking_data'] = [
                    'booking_id' => $booking_id,
                    'movie_id' => $showtime['movie_id'],
                    'movie_title' => $showtime['title'],
                    'hall_id' => $showtime['hall_id'],
                    'hall_name' => $showtime['hall_name'],
                    'show_date' => $showtime['show_date'],
                    'start_time' => $showtime['start_time'],
                    'selected_seats' => $selected_seats,
                    'total_amount' => $total_amount
                ];
                
                // Redirect to payment page
                header('Location: payment.php');
                exit();
            } else {
                $error = "Failed to create booking: " . $conn->error;
            }
            
            $stmtBooking->close();
        } else {
            $error = "Showtime not found";
        }
        
        $conn->close();
    }
}
?>

<section class="seat-selection">
    <h2>Select Your Seat</h2>
    
    <div class="movie-header">
        <img src="<?php echo $movie['poster_url']; ?>" alt="<?php echo $movie['title']; ?>">
        <div>
            <h3><?php echo $movie['title']; ?></h3>
            <p><?php echo $movie['genre']; ?> | <?php echo $movie['duration']; ?> mins</p>
        </div>
    </div>
    
    <form action="seat-selection.php?movie_id=<?php echo $movie_id; ?>" method="post">
        <input type="hidden" name="movie_id" value="<?php echo $movie_id; ?>">
        
        <div class="showtime-selection">
            <h3>Choose Showtime</h3>
            <div class="showtime-options">
                <?php foreach ($showtimes as $showtime): ?>
                    <div class="showtime-option">
                        <input type="radio" id="showtime_<?php echo $showtime['showtime_id']; ?>" name="showtime_id" value="<?php echo $showtime['showtime_id']; ?>">
                        <label for="showtime_<?php echo $showtime['showtime_id']; ?>">
                            <span class="hall"><?php echo $showtime['hall_name']; ?></span>
                            <span class="date"><?php echo date('M d', strtotime($showtime['show_date'])); ?></span>
                            <span class="time"><?php echo date('h:ia', strtotime($showtime['start_time'])); ?></span>
                            <span class="price">IDR <?php echo number_format($showtime['ticket_price']); ?></span>
                        </label>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        
        <div class="seat-grid-container">
            <h3>Available Seats</h3>
            <div id="seat-grid">
                <p>Select a showtime to view available seats.</p>
            </div>
        </div>
        
        <div class="seat-legend">
            <div class="legend-item available"><span></span> Available</div>
            <div class="legend-item selected"><span></span> Selected</div>
            <div class="legend-item occupied"><span></span> Occupied</div>
        </div>
        
        <div class="booking-summary">
            <h3>Booking Summary</h3>
            <div class="summary-details">
                <div class="summary-item">
                    <span>Movie:</span>
                    <span id="summary-movie"><?php echo $movie['title']; ?></span>
                </div>
                <div class="summary-item">
                    <span>Hall:</span>
                    <span id="summary-hall"></span>
                </div>
                <div class="summary-item">
                    <span>Date:</span>
                    <span id="summary-date"></span>
                </div>
                <div class="summary-item">
                    <span>Time:</span>
                    <span id="summary-time"></span>
                </div>
                <div class="summary-item">
                    <span>Seats:</span>
                    <span id="summary-seats">0</span>
                </div>
                <div class="summary-item total">
                    <span>Total:</span>
                    <span id="summary-total">IDR 0</span>
                </div>
            </div>
            <button type="submit" class="btn proceed-btn" disabled>Proceed to Payment</button>
        </div>
        
        <!-- Hidden input to store selected seats -->
        <input type="hidden" name="selected_seats" id="selected_seats" value="">
    </form>
    
    <?php if (isset($error)): ?>
        <div class="error-message"><?php echo $error; ?></div>
    <?php endif; ?>
</section>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const showtimeRadios = document.querySelectorAll('input[name="showtime_id"]');
    const seatGrid = document.getElementById('seat-grid');
    const summaryHall = document.getElementById('summary-hall');
    const summaryDate = document.getElementById('summary-date');
    const summaryTime = document.getElementById('summary-time');
    const summarySeats = document.getElementById('summary-seats');
    const summaryTotal = document.getElementById('summary-total');
    const proceedBtn = document.querySelector('.proceed-btn');
    const selectedSeatsInput = document.getElementById('selected_seats');
    
    let selectedSeats = [];
    let ticketPrice = 0;
    
    showtimeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const showtimeId = this.value;
                const showtimeLabel = this.nextElementSibling;
                const hallName = showtimeLabel.querySelector('.hall').textContent;
                const date = showtimeLabel.querySelector('.date').textContent;
                const time = showtimeLabel.querySelector('.time').textContent;
                const priceText = showtimeLabel.querySelector('.price').textContent;
                
                summaryHall.textContent = hallName;
                summaryDate.textContent = date;
                summaryTime.textContent = time;
                
                ticketPrice = parseFloat(priceText.replace('IDR ', '').replace(/,/g, ''));
                
                fetchSeatLayout(showtimeId);
            }
        });
    });
    
    function fetchSeatLayout(showtimeId) {
        // This would typically fetch seat layout from the server
        // For demonstration, we'll generate a simple grid
        seatGrid.innerHTML = '<div class="screen">SCREEN</div><div class="seats-container"></div>';
        const seatsContainer = seatGrid.querySelector('.seats-container');
        
        const rows = 'ABCDEFGHIJ';
        const columns = 10;
        let availableSeats = [];
        
        for (let i = 0; i < rows.length; i++) {
            for (let j = 1; j <= columns; j++) {
                const seatId = rows[i] + j;
                const isOccupied = Math.random() < 0.2; // Randomly mark some seats as occupied
                
                if (!isOccupied) {
                    availableSeats.push(seatId);
                }
                
                const seat = document.createElement('div');
                seat.className = isOccupied ? 'seat occupied' : 'seat available';
                seat.dataset.seatId = seatId;
                seat.textContent = seatId;
                
                seat.addEventListener('click', function() {
                    if (this.classList.contains('occupied')) return;
                    
                    if (this.classList.contains('selected')) {
                        this.classList.remove('selected');
                        this.classList.add('available');
                        selectedSeats = selectedSeats.filter(seat => seat !== seatId);
                    } else {
                        this.classList.remove('available');
                        this.classList.add('selected');
                        selectedSeats.push(seatId);
                    }
                    
                    updateSummary();
                });
                
                seatsContainer.appendChild(seat);
            }
        }
        
        updateSummary();
    }
    
    function updateSummary() {
        summarySeats.textContent = selectedSeats.length;
        summaryTotal.textContent = 'IDR ' + (selectedSeats.length * ticketPrice).toLocaleString();
        
        proceedBtn.disabled = selectedSeats.length === 0;
        
        // Update hidden input with selected seats
        selectedSeatsInput.value = selectedSeats.join(',');
    }
});
</script>

<?php
include 'includes/footer.php';
?>
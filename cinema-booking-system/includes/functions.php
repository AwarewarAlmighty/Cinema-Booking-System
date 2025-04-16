<?php
/**
 * User Authentication Functions
 */
function login($username, $password) {
    $conn = dbConnect();
    
    $sql = "SELECT * FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['full_name'] = $user['full_name'];
            return true;
        }
    }
    
    return false;
}

function adminLogin($username, $password) {
    $conn = dbConnect();
    
    $sql = "SELECT * FROM admins WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $admin = $result->fetch_assoc();
        
        if (password_verify($password, $admin['password'])) {
            $_SESSION['admin_id'] = $admin['admin_id'];
            $_SESSION['admin_username'] = $admin['username'];
            $_SESSION['admin_full_name'] = $admin['full_name'];
            return true;
        }
    }
    
    return false;
}

function register($username, $password, $full_name, $email, $phone = '') {
    $conn = dbConnect();
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    $sql = "INSERT INTO users (username, password, full_name, email, phone) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sssss', $username, $hashedPassword, $full_name, $email, $phone);
    
    return $stmt->execute();
}

function logout() {
    session_unset();
    session_destroy();
    return true;
}

/**
 * Movie Functions
 */
function getMovies($limit = 0, $offset = 0) {
    $conn = dbConnect();
    
    $sql = "SELECT * FROM movies WHERE release_date <= CURDATE() ORDER BY release_date DESC";
    if ($limit > 0) {
        $sql .= " LIMIT $limit";
        if ($offset > 0) {
            $sql .= " OFFSET $offset";
        }
    }
    
    $result = $conn->query($sql);
    return $result->fetch_all(MYSQLI_ASSOC);
}

function getMovieById($movie_id) {
    $conn = dbConnect();
    
    $sql = "SELECT * FROM movies WHERE movie_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $movie_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_assoc();
}

/**
 * Showtime Functions
 */
function getShowtimesByMovie($movie_id) {
    $conn = dbConnect();
    
    $sql = "SELECT s.*, h.hall_name 
            FROM showtimes s 
            JOIN halls h ON s.hall_id = h.hall_id 
            WHERE s.movie_id = ? AND s.show_date >= CURDATE() 
            ORDER BY s.show_date, s.start_time";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $movie_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_all(MYSQLI_ASSOC);
}

/**
 * Booking Functions
 */
function createBooking($user_id, $showtime_id, $seat_count, $total_amount) {
    $conn = dbConnect();
    
    $sql = "INSERT INTO bookings (user_id, showtime_id, total_seats, total_amount, status) 
            VALUES (?, ?, ?, ?, 'pending')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iidd', $user_id, $showtime_id, $seat_count, $total_amount);
    
    if ($stmt->execute()) {
        return $conn->insert_id;
    }
    
    return false;
}

function updateBookingStatus($booking_id, $status) {
    $conn = dbConnect();
    
    $sql = "UPDATE bookings SET status = ? WHERE booking_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('si', $status, $booking_id);
    
    return $stmt->execute();
}

/**
 * Payment Functions
 */
function createPayment($booking_id, $amount, $payment_method) {
    $conn = dbConnect();
    
    $sql = "INSERT INTO payments (booking_id, amount, payment_method, status) 
            VALUES (?, ?, ?, 'success')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ids', $booking_id, $amount, $payment_method);
    
    return $stmt->execute();
}

/**
 * Utility Functions
 */
function generateSeatLayout($hall_id) {
    $conn = dbConnect();
    
    $sql = "SELECT layout_rows, layout_columns FROM halls WHERE hall_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $hall_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $hall = $result->fetch_assoc();
    
    $rows = range('A', 'J');
    $layout = [];
    
    for ($i = 0; $i < $hall['layout_rows']; $i++) {
        for ($j = 1; $j <= $hall['layout_columns']; $j++) {
            $seatId = $rows[$i] . $j;
            $layout[] = [
                'seat_id' => $seatId,
                'is_available' => rand(0, 1) // Random availability for demo
            ];
        }
    }
    
    return $layout;
}

function getSelectedSeats($booking_id) {
    $conn = dbConnect();
    
    $sql = "SELECT s.seat_id, s.seat_row, s.seat_number 
            FROM bookings b 
            JOIN showtimes s ON b.showtime_id = s.showtime_id 
            JOIN seats se ON s.hall_id = se.hall_id 
            WHERE b.booking_id = ? AND se.is_available = 0";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $booking_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_all(MYSQLI_ASSOC);
}

/**
 * Validation Functions
 */
function validateRegistration($data) {
    $errors = [];
    
    if (empty($data['username'])) {
        $errors[] = 'Username is required';
    }
    
    if (empty($data['password'])) {
        $errors[] = 'Password is required';
    } elseif (strlen($data['password']) < 6) {
        $errors[] = 'Password must be at least 6 characters';
    }
    
    if (empty($data['confirm_password'])) {
        $errors[] = 'Confirm password is required';
    } elseif ($data['password'] !== $data['confirm_password']) {
        $errors[] = 'Passwords do not match';
    }
    
    if (empty($data['full_name'])) {
        $errors[] = 'Full name is required';
    }
    
    if (empty($data['email'])) {
        $errors[] = 'Email is required';
    } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Invalid email format';
    }
    
    return $errors;
}

function validatePayment($data) {
    $errors = [];
    
    if (empty($data['card_number'])) {
        $errors[] = 'Card number is required';
    } elseif (!preg_match('/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/', $data['card_number'])) {
        $errors[] = 'Invalid card number format';
    }
    
    if (empty($data['expiry_date'])) {
        $errors[] = 'Expiry date is required';
    } elseif (!preg_match('/^\d{2}\/\d{2}$/', $data['expiry_date'])) {
        $errors[] = 'Invalid expiry date format';
    }
    
    if (empty($data['cvv'])) {
        $errors[] = 'CVV is required';
    } elseif (!preg_match('/^\d{3,4}$/', $data['cvv'])) {
        $errors[] = 'Invalid CVV format';
    }
    
    if (empty($data['card_holder'])) {
        $errors[] = 'Card holder name is required';
    }
    
    return $errors;
}
?>
<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Get showtime ID from URL
$showtime_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($showtime_id <= 0) {
    header('Location: admin-manage-showtimes.php');
    exit();
}

// Get showtime details
$conn = dbConnect();
$sql = "SELECT s.*, m.title AS movie_title, h.hall_name 
        FROM showtimes s 
        JOIN movies m ON s.movie_id = m.movie_id 
        JOIN halls h ON s.hall_id = h.hall_id 
        WHERE s.showtime_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $showtime_id);
$stmt->execute();
$result = $stmt->get_result();
$showtime = $result->fetch_assoc();

// Check if showtime exists
if (!$showtime) {
    $error = "Showtime not found";
    include 'includes/footer.php';
    exit();
}

// Get movies and halls for dropdowns
$sqlMovies = "SELECT movie_id, title FROM movies WHERE release_date <= CURDATE() ORDER BY title";
$resultMovies = $conn->query($sqlMovies);
$movies = $resultMovies->fetch_all(MYSQLI_ASSOC);

$sqlHalls = "SELECT hall_id, hall_name FROM halls ORDER BY hall_name";
$resultHalls = $conn->query($sqlHalls);
$halls = $resultHalls->fetch_all(MYSQLI_ASSOC);

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $movie_id = intval($_POST['movie_id']);
    $hall_id = intval($_POST['hall_id']);
    $show_date = $_POST['show_date'];
    $start_time = $_POST['start_time'];
    $end_time = $_POST['end_time'];
    $ticket_price = floatval($_POST['ticket_price']);
    
    // Validate required fields
    $errors = [];
    if (empty($movie_id)) {
        $errors[] = 'Movie is required';
    }
    if (empty($hall_id)) {
        $errors[] = 'Hall is required';
    }
    if (empty($show_date)) {
        $errors[] = 'Show date is required';
    }
    if (empty($start_time)) {
        $errors[] = 'Start time is required';
    }
    if (empty($end_time)) {
        $errors[] = 'End time is required';
    }
    if ($ticket_price <= 0) {
        $errors[] = 'Ticket price must be a positive number';
    }
    
    // Validate date and time
    if (!empty($show_date) && !empty($start_time) && !empty($end_time)) {
        $startDate = strtotime("$show_date $start_time");
        $endDate = strtotime("$show_date $end_time");
        
        if ($startDate >= $endDate) {
            $errors[] = 'End time must be after start time';
        }
    }
    
    if (empty($errors)) {
        // Update showtime in database
        $sql = "UPDATE showtimes 
                SET movie_id = ?, hall_id = ?, show_date = ?, start_time = ?, end_time = ?, ticket_price = ? 
                WHERE showtime_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iisssdi', $movie_id, $hall_id, $show_date, $start_time, $end_time, $ticket_price, $showtime_id);
        
        if ($stmt->execute()) {
            $success = "Showtime updated successfully";
            // Refresh showtime data
            $sqlRefresh = "SELECT s.*, m.title AS movie_title, h.hall_name 
                           FROM showtimes s 
                           JOIN movies m ON s.movie_id = m.movie_id 
                           JOIN halls h ON s.hall_id = h.hall_id 
                           WHERE s.showtime_id = ?";
            $stmtRefresh = $conn->prepare($sqlRefresh);
            $stmtRefresh->bind_param('i', $showtime_id);
            $stmtRefresh->execute();
            $resultRefresh = $stmtRefresh->get_result();
            $showtime = $resultRefresh->fetch_assoc();
        } else {
            $errors[] = "Failed to update showtime: " . $conn->error;
        }
        
        $stmt->close();
    }
}

$conn->close();
?>

<section class="admin-edit-showtime">
    <h2>Edit Showtime</h2>
    
    <?php if (isset($success)): ?>
        <div class="success-message"><?php echo $success; ?></div>
    <?php elseif (!empty($errors)): ?>
        <div class="error-message">
            <?php foreach ($errors as $error): ?>
                <p><?php echo $error; ?></p>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
    
    <form action="admin-edit-showtime.php?id=<?php echo $showtime_id; ?>" method="post" class="admin-showtime-form">
        <div class="form-group">
            <label for="movie_id">Movie *</label>
            <select id="movie_id" name="movie_id" required>
                <?php foreach ($movies as $movie): ?>
                    <option value="<?php echo $movie['movie_id']; ?>" <?php echo ($movie['movie_id'] == $showtime['movie_id']) ? 'selected' : ''; ?>>
                        <?php echo htmlspecialchars($movie['title']); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        
        <div class="form-group">
            <label for="hall_id">Hall *</label>
            <select id="hall_id" name="hall_id" required>
                <?php foreach ($halls as $hall): ?>
                    <option value="<?php echo $hall['hall_id']; ?>" <?php echo ($hall['hall_id'] == $showtime['hall_id']) ? 'selected' : ''; ?>>
                        <?php echo htmlspecialchars($hall['hall_name']); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        
        <div class="form-group">
            <label for="show_date">Show Date *</label>
            <input type="date" id="show_date" name="show_date" value="<?php echo $showtime['show_date']; ?>" required>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="start_time">Start Time *</label>
                <input type="time" id="start_time" name="start_time" value="<?php echo $showtime['start_time']; ?>" required>
            </div>
            <div class="form-group">
                <label for="end_time">End Time *</label>
                <input type="time" id="end_time" name="end_time" value="<?php echo $showtime['end_time']; ?>" required>
            </div>
        </div>
        
        <div class="form-group">
            <label for="ticket_price">Ticket Price (IDR) *</label>
            <input type="number" id="ticket_price" name="ticket_price" value="<?php echo $showtime['ticket_price']; ?>" min="1" required>
        </div>
        
        <div class="form-actions">
            <button type="submit" class="btn submit-btn">Update Showtime</button>
            <a href="admin-manage-showtimes.php" class="btn cancel-btn">Cancel</a>
        </div>
    </form>
</section>

<?php
include 'includes/footer.php';
?>
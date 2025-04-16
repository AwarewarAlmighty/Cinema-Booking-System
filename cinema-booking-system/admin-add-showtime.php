<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Initialize variables
$movie_id = $hall_id = $show_date = $start_time = $end_time = $ticket_price = '';
$errors = [];
$success = '';

// Get movies and halls for dropdowns
$conn = dbConnect();
$movies = [];
$halls = [];

// Get movies
$sqlMovies = "SELECT movie_id, title FROM movies WHERE release_date <= CURDATE() ORDER BY title";
$resultMovies = $conn->query($sqlMovies);
if ($resultMovies) {
    $movies = $resultMovies->fetch_all(MYSQLI_ASSOC);
}

// Get halls
$sqlHalls = "SELECT hall_id, hall_name FROM halls ORDER BY hall_name";
$resultHalls = $conn->query($sqlHalls);
if ($resultHalls) {
    $halls = $resultHalls->fetch_all(MYSQLI_ASSOC);
}

// Handle showtime addition
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $movie_id = intval($_POST['movie_id']);
    $hall_id = intval($_POST['hall_id']);
    $show_date = $_POST['show_date'];
    $start_time = $_POST['start_time'];
    $end_time = $_POST['end_time'];
    $ticket_price = floatval($_POST['ticket_price']);
    
    // Validate required fields
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
        // Insert showtime into database
        $sql = "INSERT INTO showtimes (movie_id, hall_id, show_date, start_time, end_time, ticket_price) 
                VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iissss', $movie_id, $hall_id, $show_date, $start_time, $end_time, $ticket_price);
        
        if ($stmt->execute()) {
            $success = "Showtime added successfully";
            $movie_id = $hall_id = $show_date = $start_time = $end_time = $ticket_price = '';
        } else {
            $errors[] = "Failed to add showtime: " . $stmt->error;
        }
        
        $stmt->close();
    }
}

$conn->close();
?>

<section class="admin-add-showtime">
    <h2>Add New Showtime</h2>
    
    <?php if (!empty($errors)): ?>
        <div class="error-message">
            <?php foreach ($errors as $error): ?>
                <p><?php echo $error; ?></p>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
    
    <?php if (!empty($success)): ?>
        <div class="success-message"><?php echo $success; ?></div>
    <?php endif; ?>
    
    <form action="admin-add-showtime.php" method="post" class="admin-showtime-form">
        <div class="form-group">
            <label for="movie_id">Movie *</label>
            <select id="movie_id" name="movie_id" required>
                <option value="">Select a movie</option>
                <?php foreach ($movies as $movie): ?>
                    <option value="<?php echo $movie['movie_id']; ?>" <?php echo ($movie['movie_id'] == $movie_id) ? 'selected' : ''; ?>>
                        <?php echo htmlspecialchars($movie['title']); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        
        <div class="form-group">
            <label for="hall_id">Hall *</label>
            <select id="hall_id" name="hall_id" required>
                <option value="">Select a hall</option>
                <?php foreach ($halls as $hall): ?>
                    <option value="<?php echo $hall['hall_id']; ?>" <?php echo ($hall['hall_id'] == $hall_id) ? 'selected' : ''; ?>>
                        <?php echo htmlspecialchars($hall['hall_name']); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        
        <div class="form-group">
            <label for="show_date">Show Date *</label>
            <input type="date" id="show_date" name="show_date" value="<?php echo $show_date; ?>" min="<?php echo date('Y-m-d'); ?>" required>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="start_time">Start Time *</label>
                <input type="time" id="start_time" name="start_time" value="<?php echo $start_time; ?>" required>
            </div>
            <div class="form-group">
                <label for="end_time">End Time *</label>
                <input type="time" id="end_time" name="end_time" value="<?php echo $end_time; ?>" required>
            </div>
        </div>
        
        <div class="form-group">
            <label for="ticket_price">Ticket Price (IDR) *</label>
            <input type="number" id="ticket_price" name="ticket_price" value="<?php echo $ticket_price; ?>" min="1" step="1000" required>
        </div>
        
        <div class="form-actions">
            <button type="submit" class="btn submit-btn">Add Showtime</button>
            <a href="admin-dashboard.php" class="btn cancel-btn">Cancel</a>
        </div>
    </form>
</section>

<?php
include 'includes/footer.php';
?>
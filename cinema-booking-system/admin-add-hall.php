<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Handle hall addition
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate and sanitize input
    $hall_name = trim($_POST['hall_name']);
    $total_seats = intval($_POST['total_seats']);
    $layout_rows = intval($_POST['layout_rows']);
    $layout_columns = intval($_POST['layout_columns']);
    
    // Validate required fields
    $errors = [];
    if (empty($hall_name)) {
        $errors[] = 'Hall name is required';
    }
    if ($total_seats <= 0) {
        $errors[] = 'Total seats must be a positive number';
    }
    if ($layout_rows <= 0) {
        $errors[] = 'Layout rows must be a positive number';
    }
    if ($layout_columns <= 0) {
        $errors[] = 'Layout columns must be a positive number';
    }
    
    if (empty($errors)) {
        // Insert hall into database
        $conn = dbConnect();
        $sql = "INSERT INTO halls (hall_name, total_seats, layout_rows, layout_columns) 
                VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('siii', $hall_name, $total_seats, $layout_rows, $layout_columns);
        
        if ($stmt->execute()) {
            $success = "Hall added successfully";
        } else {
            $errors[] = "Failed to add hall: " . $conn->error;
        }
        
        $stmt->close();
        $conn->close();
    }
}
?>

<section class="admin-add-hall">
    <h2>Add New Hall</h2>
    
    <?php if (isset($success)): ?>
        <div class="success-message"><?php echo $success; ?></div>
    <?php elseif (!empty($errors)): ?>
        <div class="error-message">
            <?php foreach ($errors as $error): ?>
                <p><?php echo $error; ?></p>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
    
    <form action="admin-add-hall.php" method="post" class="admin-hall-form">
        <div class="form-group">
            <label for="hall_name">Hall Name *</label>
            <input type="text" id="hall_name" name="hall_name" value="<?php echo isset($hall_name) ? htmlspecialchars($hall_name) : ''; ?>" required>
        </div>
        
        <div class="form-group">
            <label for="total_seats">Total Seats *</label>
            <input type="number" id="total_seats" name="total_seats" value="<?php echo isset($total_seats) ? $total_seats : ''; ?>" min="1" required>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="layout_rows">Layout Rows *</label>
                <input type="number" id="layout_rows" name="layout_rows" value="<?php echo isset($layout_rows) ? $layout_rows : ''; ?>" min="1" required>
            </div>
            <div class="form-group">
                <label for="layout_columns">Layout Columns *</label>
                <input type="number" id="layout_columns" name="layout_columns" value="<?php echo isset($layout_columns) ? $layout_columns : ''; ?>" min="1" required>
            </div>
        </div>
        
        <div class="form-actions">
            <button type="submit" class="btn submit-btn">Add Hall</button>
            <a href="admin-manage-halls.php" class="btn cancel-btn">Cancel</a>
        </div>
    </form>
</section>

<?php
include 'includes/footer.php';
?>
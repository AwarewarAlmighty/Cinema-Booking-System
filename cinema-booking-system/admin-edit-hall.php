<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Get hall ID from URL
$hall_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($hall_id <= 0) {
    header('Location: admin-manage-halls.php');
    exit();
}

// Get hall details
$conn = dbConnect();
$sql = "SELECT * FROM halls WHERE hall_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $hall_id);
$stmt->execute();
$result = $stmt->get_result();
$hall = $result->fetch_assoc();

// Check if hall exists
if (!$hall) {
    $error = "Hall not found";
    include 'includes/footer.php';
    exit();
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
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
        // Update hall in database
        $sql = "UPDATE halls 
                SET hall_name = ?, total_seats = ?, layout_rows = ?, layout_columns = ? 
                WHERE hall_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('siiii', $hall_name, $total_seats, $layout_rows, $layout_columns, $hall_id);
        
        if ($stmt->execute()) {
            $success = "Hall updated successfully";
            // Refresh hall data
            $sqlRefresh = "SELECT * FROM halls WHERE hall_id = ?";
            $stmtRefresh = $conn->prepare($sqlRefresh);
            $stmtRefresh->bind_param('i', $hall_id);
            $stmtRefresh->execute();
            $resultRefresh = $stmtRefresh->get_result();
            $hall = $resultRefresh->fetch_assoc();
        } else {
            $errors[] = "Failed to update hall: " . $conn->error;
        }
        
        $stmt->close();
    }
}

$conn->close();
?>

<section class="admin-edit-hall">
    <h2>Edit Hall</h2>
    
    <?php if (isset($success)): ?>
        <div class="success-message"><?php echo $success; ?></div>
    <?php elseif (!empty($errors)): ?>
        <div class="error-message">
            <?php foreach ($errors as $error): ?>
                <p><?php echo $error; ?></p>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
    
    <form action="admin-edit-hall.php?id=<?php echo $hall_id; ?>" method="post" class="admin-hall-form">
        <div class="form-group">
            <label for="hall_name">Hall Name *</label>
            <input type="text" id="hall_name" name="hall_name" value="<?php echo htmlspecialchars($hall['hall_name']); ?>" required>
        </div>
        
        <div class="form-group">
            <label for="total_seats">Total Seats *</label>
            <input type="number" id="total_seats" name="total_seats" value="<?php echo $hall['total_seats']; ?>" min="1" required>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="layout_rows">Layout Rows *</label>
                <input type="number" id="layout_rows" name="layout_rows" value="<?php echo $hall['layout_rows']; ?>" min="1" required>
            </div>
            <div class="form-group">
                <label for="layout_columns">Layout Columns *</label>
                <input type="number" id="layout_columns" name="layout_columns" value="<?php echo $hall['layout_columns']; ?>" min="1" required>
            </div>
        </div>
        
        <div class="form-actions">
            <button type="submit" class="btn submit-btn">Update Hall</button>
            <a href="admin-manage-halls.php" class="btn cancel-btn">Cancel</a>
        </div>
    </form>
</section>

<?php
include 'includes/footer.php';
?>
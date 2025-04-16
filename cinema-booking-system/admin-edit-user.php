<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Get user ID from URL
$user_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($user_id <= 0) {
    header('Location: admin-manage-users.php');
    exit();
}

// Get user details
$conn = dbConnect();
$sql = "SELECT * FROM users WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

// Check if user exists
if (!$user) {
    $error = "User not found";
    include 'includes/footer.php';
    exit();
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $username = trim($_POST['username']);
    $full_name = trim($_POST['full_name']);
    $email = trim($_POST['email']);
    $phone = trim($_POST['phone']);
    
    // Validate required fields
    $errors = [];
    if (empty($username)) {
        $errors[] = 'Username is required';
    }
    if (empty($full_name)) {
        $errors[] = 'Full name is required';
    }
    if (empty($email)) {
        $errors[] = 'Email is required';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Invalid email format';
    }
    
    if (empty($errors)) {
        // Update user in database
        $sql = "UPDATE users 
                SET username = ?, full_name = ?, email = ?, phone = ? 
                WHERE user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ssssi', $username, $full_name, $email, $phone, $user_id);
        
        if ($stmt->execute()) {
            $success = "User updated successfully";
            // Refresh user data
            $sqlRefresh = "SELECT * FROM users WHERE user_id = ?";
            $stmtRefresh = $conn->prepare($sqlRefresh);
            $stmtRefresh->bind_param('i', $user_id);
            $stmtRefresh->execute();
            $resultRefresh = $stmtRefresh->get_result();
            $user = $resultRefresh->fetch_assoc();
        } else {
            $errors[] = "Failed to update user: " . $conn->error;
        }
        
        $stmt->close();
    }
}

$conn->close();
?>

<section class="admin-edit-user">
    <h2>Edit User</h2>
    
    <?php if (isset($success)): ?>
        <div class="success-message"><?php echo $success; ?></div>
    <?php elseif (!empty($errors)): ?>
        <div class="error-message">
            <?php foreach ($errors as $error): ?>
                <p><?php echo $error; ?></p>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
    
    <form action="admin-edit-user.php?id=<?php echo $user_id; ?>" method="post" class="admin-user-form">
        <div class="form-group">
            <label for="username">Username *</label>
            <input type="text" id="username" name="username" value="<?php echo htmlspecialchars($user['username']); ?>" required>
        </div>
        
        <div class="form-group">
            <label for="full_name">Full Name *</label>
            <input type="text" id="full_name" name="full_name" value="<?php echo htmlspecialchars($user['full_name']); ?>" required>
        </div>
        
        <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($user['email']); ?>" required>
        </div>
        
        <div class="form-group">
            <label for="phone">Phone</label>
            <input type="text" id="phone" name="phone" value="<?php echo htmlspecialchars($user['phone']); ?>">
        </div>
        
        <div class="form-actions">
            <button type="submit" class="btn submit-btn">Update User</button>
            <a href="admin-manage-users.php" class="btn cancel-btn">Cancel</a>
        </div>
    </form>
</section>

<?php
include 'includes/footer.php';
?>
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

$conn->close();

// If user not found
if (!$user) {
    header('Location: admin-manage-users.php');
    exit();
}
?>

<section class="admin-view-user">
    <h2>User Details</h2>
    
    <div class="user-details">
        <div class="detail-card">
            <h3>User Information</h3>
            <div class="detail-item">
                <span class="label">User ID:</span>
                <span class="value"><?php echo $user['user_id']; ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Username:</span>
                <span class="value"><?php echo htmlspecialchars($user['username']); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Full Name:</span>
                <span class="value"><?php echo htmlspecialchars($user['full_name']); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Email:</span>
                <span class="value"><?php echo htmlspecialchars($user['email']); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Phone:</span>
                <span class="value"><?php echo htmlspecialchars($user['phone']); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Created At:</span>
                <span class="value"><?php echo date('M d, Y', strtotime($user['created_at'])); ?></span>
            </div>
        </div>
        
        <div class="actions">
            <a href="admin-edit-user.php?id=<?php echo $user['user_id']; ?>" class="btn edit-btn">Edit User</a>
            <a href="admin-manage-users.php" class="btn back-btn">Back to Users</a>
        </div>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
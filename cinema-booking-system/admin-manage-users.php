<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Handle user deletion
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $user_id = intval($_GET['id']);
    
    // Delete user from database
    $conn = dbConnect();
    $sql = "DELETE FROM users WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user_id);
    
    if ($stmt->execute()) {
        $delete_success = "User deleted successfully";
    } else {
        $delete_error = "Failed to delete user: " . $conn->error;
    }
    
    $stmt->close();
    $conn->close();
}

// Get all users from database
$conn = dbConnect();
$sql = "SELECT * FROM users ORDER BY full_name";
$result = $conn->query($sql);
$users = $result->fetch_all(MYSQLI_ASSOC);
$conn->close();
?>

<section class="admin-manage-users">
    <h2>Manage Users</h2>
    
    <?php if (isset($delete_success)): ?>
        <div class="success-message"><?php echo $delete_success; ?></div>
    <?php elseif (isset($delete_error)): ?>
        <div class="error-message"><?php echo $delete_error; ?></div>
    <?php endif; ?>
    
    <div class="users-table">
        <table>
            <thead>
                <tr>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Created At</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (!empty($users)): ?>
                    <?php foreach ($users as $user): ?>
                        <tr>
                            <td><?php echo $user['user_id']; ?></td>
                            <td><?php echo htmlspecialchars($user['username']); ?></td>
                            <td><?php echo htmlspecialchars($user['full_name']); ?></td>
                            <td><?php echo htmlspecialchars($user['email']); ?></td>
                            <td><?php echo htmlspecialchars($user['phone']); ?></td>
                            <td><?php echo date('M d, Y', strtotime($user['created_at'])); ?></td>
                            <td>
                                <a href="admin-view-user.php?id=<?php echo $user['user_id']; ?>" class="btn view-btn">View</a>
                                <a href="admin-edit-user.php?id=<?php echo $user['user_id']; ?>" class="btn edit-btn">Edit</a>
                                <a href="admin-manage-users.php?action=delete&id=<?php echo $user['user_id']; ?>" class="btn delete-btn" onclick="return confirm('Are you sure you want to delete this user?');">Delete</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="7" class="no-data">No users found</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
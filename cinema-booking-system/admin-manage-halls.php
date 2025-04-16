<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Handle hall deletion
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $hall_id = intval($_GET['id']);
    
    // Delete hall from database
    $conn = dbConnect();
    $sql = "DELETE FROM halls WHERE hall_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $hall_id);
    
    if ($stmt->execute()) {
        $delete_success = "Hall deleted successfully";
    } else {
        $delete_error = "Failed to delete hall: " . $conn->error;
    }
    
    $stmt->close();
    $conn->close();
}

// Get all halls from database
$conn = dbConnect();
$sql = "SELECT * FROM halls ORDER BY hall_name";
$result = $conn->query($sql);
$halls = $result->fetch_all(MYSQLI_ASSOC);
$conn->close();
?>

<section class="admin-manage-halls">
    <h2>Manage Halls</h2>
    
    <?php if (isset($delete_success)): ?>
        <div class="success-message"><?php echo $delete_success; ?></div>
    <?php elseif (isset($delete_error)): ?>
        <div class="error-message"><?php echo $delete_error; ?></div>
    <?php endif; ?>
    
    <div class="manage-actions">
        <a href="admin-add-hall.php" class="btn add-btn">Add New Hall</a>
    </div>
    
    <div class="halls-table">
        <table>
            <thead>
                <tr>
                    <th>Hall ID</th>
                    <th>Hall Name</th>
                    <th>Total Seats</th>
                    <th>Layout Rows</th>
                    <th>Layout Columns</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (!empty($halls)): ?>
                    <?php foreach ($halls as $hall): ?>
                        <tr>
                            <td><?php echo $hall['hall_id']; ?></td>
                            <td><?php echo htmlspecialchars($hall['hall_name']); ?></td>
                            <td><?php echo $hall['total_seats']; ?></td>
                            <td><?php echo $hall['layout_rows']; ?></td>
                            <td><?php echo $hall['layout_columns']; ?></td>
                            <td>
                                <a href="admin-edit-hall.php?id=<?php echo $hall['hall_id']; ?>" class="btn edit-btn">Edit</a>
                                <a href="admin-manage-halls.php?action=delete&id=<?php echo $hall['hall_id']; ?>" class="btn delete-btn" onclick="return confirm('Are you sure you want to delete this hall?');">Delete</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="6" class="no-data">No halls found</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
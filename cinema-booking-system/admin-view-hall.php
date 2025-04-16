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

$conn->close();

// If hall not found
if (!$hall) {
    header('Location: admin-manage-halls.php');
    exit();
}
?>

<section class="admin-view-hall">
    <h2>Hall Details</h2>
    
    <div class="hall-details">
        <div class="detail-card">
            <h3>Hall Information</h3>
            <div class="detail-item">
                <span class="label">Hall ID:</span>
                <span class="value"><?php echo $hall['hall_id']; ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Hall Name:</span>
                <span class="value"><?php echo htmlspecialchars($hall['hall_name']); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Total Seats:</span>
                <span class="value"><?php echo $hall['total_seats']; ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Layout Rows:</span>
                <span class="value"><?php echo $hall['layout_rows']; ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Layout Columns:</span>
                <span class="value"><?php echo $hall['layout_columns']; ?></span>
            </div>
        </div>
        
        <div class="actions">
            <a href="admin-edit-hall.php?id=<?php echo $hall['hall_id']; ?>" class="btn edit-btn">Edit Hall</a>
            <a href="admin-manage-halls.php" class="btn back-btn">Back to Halls</a>
        </div>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
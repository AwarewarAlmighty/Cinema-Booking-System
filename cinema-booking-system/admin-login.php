<?php
include 'includes/header.php';
include 'includes/functions.php';

// Handle admin login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];
    
    if (adminLogin($username, $password)) {
        header('Location: admin-dashboard.php');
        exit();
    } else {
        $error = "Invalid username or password";
    }
}
?>

<section class="admin-login-section">
    <div class="admin-login-container">
        <h2>Admin Login</h2>
        <?php if (isset($error)): ?>
            <div class="error-message"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <form action="admin-login.php" method="post" class="admin-login-form">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn login-btn">Login</button>
            </div>
        </form>
        
        <div class="form-footer">
            <p>Back to <a href="login.php">User Login</a></p>
        </div>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
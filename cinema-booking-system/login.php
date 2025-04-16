<?php
include 'includes/header.php';
include 'includes/functions.php';

// Handle login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];
    
    if (login($username, $password)) {
        // Redirect based on user role
        if (isset($_SESSION['admin_id'])) {
            header('Location: admin-dashboard.php');
        } else {
            header('Location: index.php');
        }
        exit();
    } else {
        $error = "Invalid username or password";
    }
}
?>

<section class="login-section">
    <div class="login-container">
        <h2>Login</h2>
        <?php if (isset($error)): ?>
            <div class="error-message"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <form action="login.php" method="post" class="login-form">
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
            <p>Don't have an account? <a href="register.php">Register</a></p>
            <p><a href="admin-login.php">Admin Login</a></p>
        </div>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
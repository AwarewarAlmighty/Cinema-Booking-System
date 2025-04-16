<?php
include 'includes/header.php';
include 'includes/functions.php';

// Handle registration form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = [
        'username' => $_POST['username'],
        'password' => $_POST['password'],
        'confirm_password' => $_POST['confirm_password'],
        'full_name' => $_POST['full_name'],
        'email' => $_POST['email'],
        'phone' => $_POST['phone']
    ];
    
    $errors = validateRegistration($data);
    
    if (empty($errors)) {
        if (register($data['username'], $data['password'], $data['full_name'], $data['email'], $data['phone'])) {
            $success = "Registration successful! You can now login.";
            unset($data);
        } else {
            $error = "Registration failed. Please try again.";
        }
    } else {
        $error = implode('<br>', $errors);
    }
}
?>

<section class="register-section">
    <div class="register-container">
        <h2>Register</h2>
        <?php if (isset($success)): ?>
            <div class="success-message"><?php echo $success; ?></div>
            <div class="form-actions" style="margin-top: 20px;">
                <a href="login.php" class="btn login-btn">Login</a>
            </div>
        <?php elseif (isset($error)): ?>
            <div class="error-message"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <?php if (!isset($success)): ?>
            <form action="register.php" method="post" class="register-form">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required value="<?php echo isset($data['username']) ? $data['username'] : ''; ?>">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div class="form-group">
                    <label for="confirm_password">Confirm Password</label>
                    <input type="password" id="confirm_password" name="confirm_password" required>
                </div>
                <div class="form-group">
                    <label for="full_name">Full Name</label>
                    <input type="text" id="full_name" name="full_name" required value="<?php echo isset($data['full_name']) ? $data['full_name'] : ''; ?>">
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required value="<?php echo isset($data['email']) ? $data['email'] : ''; ?>">
                </div>
                <div class="form-group">
                    <label for="phone">Phone (optional)</label>
                    <input type="tel" id="phone" name="phone" value="<?php echo isset($data['phone']) ? $data['phone'] : ''; ?>">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn register-btn">Register</button>
                </div>
            </form>
            
            <div class="form-footer">
                <p>Already have an account? <a href="login.php">Login</a></p>
            </div>
        <?php endif; ?>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
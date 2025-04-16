<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if user is logged in
if (!isset($_SESSION['user_id']) && !isset($_SESSION['admin_id'])) {
    header('Location: index.php');
    exit();
}

// Logout function
logout();

// Redirect to appropriate page
if (isset($_SESSION['admin_id'])) {
    unset($_SESSION['admin_id']);
    unset($_SESSION['admin_username']);
    unset($_SESSION['admin_full_name']);
    header('Location: admin-login.php');
} else {
    unset($_SESSION['user_id']);
    unset($_SESSION['username']);
    unset($_SESSION['full_name']);
    header('Location: index.php');
}

exit();
?>
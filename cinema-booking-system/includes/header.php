<?php
session_start();
include_once 'includes/config.php';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cinema Booking System</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header>
        <div class="logo">
            <h1>Cinema Indonesia</h1>
        </div>
        <nav>
            <ul>
                <li><a href="index.php">Home</a></li>
                <li><a href="movies.php">Movies</a></li>
                <?php if (isset($_SESSION['user_id'])) { ?>
                    <li><a href="bookings.php">My Bookings</a></li>
                    <li><a href="logout.php">Logout</a></li>
                <?php } else { ?>
                    <li><a href="login.php">Login</a></li>
                    <li><a href="register.php">Register</a></li>
                <?php } ?>
                <?php if (isset($_SESSION['admin_id'])) { ?>
                    <li><a href="admin-dashboard.php">Admin</a></li>
                <?php } ?>
            </ul>
        </nav>
    </header>
    <main>
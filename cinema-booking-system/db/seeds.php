<?php
// db/seeds.php

// Seed halls table
$halls = [
    ['hall_name' => 'Hall A', 'total_seats' => 100, 'layout_rows' => 10, 'layout_columns' => 10],
    ['hall_name' => 'Hall B', 'total_seats' => 150, 'layout_rows' => 15, 'layout_columns' => 10],
];

// Seed movies table
$movies = [
    ['title' => 'Movie 1', 'description' => 'Description for Movie 1', 'genre' => 'Action', 'duration' => 120, 'release_date' => '2023-01-01', 'poster_url' => 'poster1.jpg'],
    ['title' => 'Movie 2', 'description' => 'Description for Movie 2', 'genre' => 'Comedy', 'duration' => 90, 'release_date' => '2023-02-01', 'poster_url' => 'poster2.jpg'],
];

// Seed showtimes table
$showtimes = [
    ['movie_id' => 1, 'hall_id' => 1, 'show_date' => '2023-04-22', 'start_time' => '10:00:00', 'end_time' => '12:00:00', 'ticket_price' => 50000],
    ['movie_id' => 2, 'hall_id' => 2, 'show_date' => '2023-04-22', 'start_time' => '14:00:00', 'end_time' => '15:30:00', 'ticket_price' => 40000],
];

// Seed seats table
$seats = [
    ['hall_id' => 1, 'seat_id' => 'A1', 'row' => 'A', 'column' => 1, 'is_available' => 1],
    ['hall_id' => 1, 'seat_id' => 'A2', 'row' => 'A', 'column' => 2, 'is_available' => 1],
    // Add more seats as needed
];

// Seed users table
$users = [
    ['username' => 'user1', 'password' => password_hash('password1', PASSWORD_DEFAULT), 'full_name' => 'John Doe', 'email' => 'john@example.com', 'phone' => '1234567890'],
    ['username' => 'user2', 'password' => password_hash('password2', PASSWORD_DEFAULT), 'full_name' => 'Jane Smith', 'email' => 'jane@example.com', 'phone' => '9876543210'],
];

// Seed admins table
$admins = [
    ['username' => 'admin', 'password' => password_hash('adminpassword', PASSWORD_DEFAULT), 'full_name' => 'Admin User'],
];

// Seed payments table
$payments = [
    ['booking_id' => 1, 'amount' => 150000, 'payment_method' => 'credit_card', 'payment_date' => '2023-04-20 10:00:00'],
];

// Seed bookings table
$bookings = [
    ['user_id' => 1, 'showtime_id' => 1, 'total_seats' => 3, 'total_amount' => 150000, 'status' => 'confirmed', 'booking_date' => '2023-04-20 09:00:00'],
];
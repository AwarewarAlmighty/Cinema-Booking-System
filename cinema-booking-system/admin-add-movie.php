<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Handle movie addition
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate and sanitize input
    $title = trim($_POST['title']);
    $description = trim($_POST['description']);
    $genre = trim($_POST['genre']);
    $duration = intval($_POST['duration']);
    $release_date = $_POST['release_date'];
    $poster = $_FILES['poster'];
    $trailer_url = trim($_POST['trailer_url']); // New field for trailer
    
    // Validate required fields
    $errors = [];
    if (empty($title)) {
        $errors[] = 'Title is required';
    }
    if (empty($genre)) {
        $errors[] = 'Genre is required';
    }
    if ($duration <= 0) {
        $errors[] = 'Duration must be a positive number';
    }
    if (empty($release_date)) {
        $errors[] = 'Release date is required';
    }
    if ($poster['error'] !== UPLOAD_ERR_OK) {
        $errors[] = 'Poster upload failed';
    }
    
    // Validate trailer URL format
    if (!empty($trailer_url) && !filter_var($trailer_url, FILTER_VALIDATE_URL)) {
        $errors[] = 'Invalid trailer URL format';
    }
    
    // Check for valid image upload
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($poster['type'], $allowedTypes)) {
        $errors[] = 'Invalid file type. Only JPEG, PNG, and GIF are allowed';
    }
    
    if (empty($errors)) {
        // Process poster upload
        $uploadDir = 'uploads/posters/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $posterName = uniqid() . '_' . basename($poster['name']);
        $posterPath = $uploadDir . $posterName;
        
        if (move_uploaded_file($poster['tmp_name'], $posterPath)) {
            // Insert movie into database
            $conn = dbConnect();
            $sql = "INSERT INTO movies (title, description, genre, duration, release_date, poster_url, trailer_url) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('ssssiss', $title, $description, $genre, $duration, $release_date, $posterPath, $trailer_url);
            
            if ($stmt->execute()) {
                $success = "Movie added successfully";
                $title = $description = $genre = '';
                $duration = 0;
                $release_date = '';
                $trailer_url = '';
            } else {
                $errors[] = "Failed to add movie: " . $conn->error;
            }
            
            $stmt->close();
            $conn->close();
        } else {
            $errors[] = "Failed to move uploaded file";
        }
    }
}
?>

<section class="admin-add-movie">
    <h2>Add New Movie</h2>
    
    <?php if (isset($success)): ?>
        <div class="success-message"><?php echo $success; ?></div>
    <?php elseif (!empty($errors)): ?>
        <div class="error-message">
            <?php foreach ($errors as $error): ?>
                <p><?php echo $error; ?></p>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
    
    <form action="admin-add-movie.php" method="post" enctype="multipart/form-data" class="admin-movie-form">
        <div class="form-group">
            <label for="title">Title *</label>
            <input type="text" id="title" name="title" value="<?php echo isset($title) ? htmlspecialchars($title) : ''; ?>" required>
        </div>
        
        <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="description" rows="5"><?php echo isset($description) ? htmlspecialchars($description) : ''; ?></textarea>
        </div>
        
        <div class="form-group">
            <label for="genre">Genre *</label>
            <input type="text" id="genre" name="genre" value="<?php echo isset($genre) ? htmlspecialchars($genre) : ''; ?>" required>
        </div>
        
        <div class="form-group">
            <label for="duration">Duration (minutes) *</label>
            <input type="number" id="duration" name="duration" min="1" value="<?php echo isset($duration) ? $duration : ''; ?>" required>
        </div>
        
        <div class="form-group">
            <label for="release_date">Release Date *</label>
            <input type="date" id="release_date" name="release_date" value="<?php echo isset($release_date) ? $release_date : date('Y-m-d'); ?>" required>
        </div>
        
        <div class="form-group">
            <label for="poster">Poster Image *</label>
            <input type="file" id="poster" name="poster" accept="image/jpeg,image/png,image/gif" required>
            <p class="help-text">Allowed formats: JPG, PNG, GIF. Max size: 5MB</p>
        </div>
        
        <div class="form-group">
            <label for="trailer_url">Trailer URL</label>
            <input type="text" id="trailer_url" name="trailer_url" value="<?php echo isset($trailer_url) ? htmlspecialchars($trailer_url) : ''; ?>" placeholder="https://www.youtube.com/embed/...">
            <p class="help-text">Paste a YouTube or Vimeo embed URL</p>
        </div>
        
        <div class="form-actions">
            <button type="submit" class="btn submit-btn">Add Movie</button>
            <a href="admin-dashboard.php" class="btn cancel-btn">Cancel</a>
        </div>
    </form>
</section>

<?php
include 'includes/footer.php';
?>
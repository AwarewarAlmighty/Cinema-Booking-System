<?php
include 'includes/header.php';
include 'includes/functions.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

// Get movie ID from URL
$movie_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($movie_id <= 0) {
    header('Location: admin-manage-movies.php');
    exit();
}

// Get movie details
$conn = dbConnect();
$sql = "SELECT * FROM movies WHERE movie_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $movie_id);
$stmt->execute();
$result = $stmt->get_result();
$movie = $result->fetch_assoc();

// Check if movie exists
if (!$movie) {
    $error = "Movie not found";
    include 'includes/footer.php';
    exit();
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $title = trim($_POST['title']);
    $description = trim($_POST['description']);
    $genre = trim($_POST['genre']);
    $duration = intval($_POST['duration']);
    $release_date = $_POST['release_date'];
    $trailer_url = trim($_POST['trailer_url']);
    $poster = $_FILES['poster'];
    
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
    
    // Validate trailer URL format
    if (!empty($trailer_url) && !filter_var($trailer_url, FILTER_VALIDATE_URL)) {
        $errors[] = 'Invalid trailer URL format';
    }
    
    // Check for valid image upload if poster is provided
    if (!empty($poster['name'])) {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!in_array($poster['type'], $allowedTypes)) {
            $errors[] = 'Invalid file type. Only JPEG, PNG, and GIF are allowed';
        }
    }
    
    if (empty($errors)) {
        // Process poster upload if provided
        $posterPath = $movie['poster_url']; // Default to existing poster
        
        if (!empty($poster['name'])) {
            $uploadDir = 'uploads/posters/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $posterName = uniqid() . '_' . basename($poster['name']);
            $newPosterPath = $uploadDir . $posterName;
            
            if (move_uploaded_file($poster['tmp_name'], $newPosterPath)) {
                $posterPath = $newPosterPath;
                // Delete old poster if it exists and is not the default
                if (file_exists($movie['poster_url']) && strpos($movie['poster_url'], 'uploads/posters/') === 0) {
                    unlink($movie['poster_url']);
                }
            } else {
                $errors[] = "Failed to upload new poster";
            }
        }
        
        if (empty($errors)) {
            // Update movie in database
            $sql = "UPDATE movies 
                    SET title = ?, description = ?, genre = ?, duration = ?, release_date = ?, poster_url = ?, trailer_url = ? 
                    WHERE movie_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('sssisssi', $title, $description, $genre, $duration, $release_date, $posterPath, $trailer_url, $movie_id);
            
            if ($stmt->execute()) {
                $success = "Movie updated successfully";
                // Refresh movie data
                $sqlRefresh = "SELECT * FROM movies WHERE movie_id = ?";
                $stmtRefresh = $conn->prepare($sqlRefresh);
                $stmtRefresh->bind_param('i', $movie_id);
                $stmtRefresh->execute();
                $resultRefresh = $stmtRefresh->get_result();
                $movie = $resultRefresh->fetch_assoc();
            } else {
                $errors[] = "Failed to update movie: " . $conn->error;
            }
            
            $stmt->close();
        }
    }
}

$conn->close();
?>

<section class="admin-edit-movie">
    <h2>Edit Movie</h2>
    
    <?php if (isset($success)): ?>
        <div class="success-message"><?php echo $success; ?></div>
    <?php elseif (!empty($errors)): ?>
        <div class="error-message">
            <?php foreach ($errors as $error): ?>
                <p><?php echo $error; ?></p>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
    
    <form action="admin-edit-movie.php?id=<?php echo $movie_id; ?>" method="post" enctype="multipart/form-data" class="admin-movie-form">
        <div class="form-group">
            <label for="title">Title *</label>
            <input type="text" id="title" name="title" value="<?php echo htmlspecialchars($movie['title']); ?>" required>
        </div>
        
        <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="description" rows="5"><?php echo htmlspecialchars($movie['description']); ?></textarea>
        </div>
        
        <div class="form-group">
            <label for="genre">Genre *</label>
            <input type="text" id="genre" name="genre" value="<?php echo htmlspecialchars($movie['genre']); ?>" required>
        </div>
        
        <div class="form-group">
            <label for="duration">Duration (minutes) *</label>
            <input type="number" id="duration" name="duration" min="1" value="<?php echo $movie['duration']; ?>" required>
        </div>
        
        <div class="form-group">
            <label for="release_date">Release Date *</label>
            <input type="date" id="release_date" name="release_date" value="<?php echo $movie['release_date']; ?>" required>
        </div>
        
        <div class="form-group">
            <label for="poster">Poster Image</label>
            <input type="file" id="poster" name="poster" accept="image/jpeg,image/png,image/gif">
            <p class="help-text">Allowed formats: JPG, PNG, GIF. Max size: 5MB</p>
            <div class="current-poster">
                <p>Current Poster:</p>
                <img src="<?php echo $movie['poster_url']; ?>" alt="<?php echo $movie['title']; ?>" style="max-width: 150px; max-height: 200px;">
            </div>
        </div>
        
        <div class="form-group">
            <label for="trailer_url">Trailer URL</label>
            <input type="text" id="trailer_url" name="trailer_url" value="<?php echo htmlspecialchars($movie['trailer_url']); ?>" placeholder="https://www.youtube.com/embed/...">
            <p class="help-text">Paste a YouTube or Vimeo embed URL</p>
        </div>
        
        <div class="form-actions">
            <button type="submit" class="btn submit-btn">Update Movie</button>
            <a href="admin-manage-movies.php" class="btn cancel-btn">Cancel</a>
        </div>
    </form>
</section>

<?php
include 'includes/footer.php';
?>
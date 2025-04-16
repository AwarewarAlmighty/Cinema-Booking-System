<?php
include 'includes/header.php';
include 'includes/functions.php';

// Get movie details
$movie_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($movie_id <= 0) {
    header('Location: index.php');
    exit();
}

$conn = dbConnect();
$sql = "SELECT * FROM movies WHERE movie_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $movie_id);
$stmt->execute();
$result = $stmt->get_result();
$movie = $result->fetch_assoc();

$conn->close();
?>

<section class="movie-description">
    <div class="movie-info">
        <div class="movie-poster">
            <img src="<?php echo $movie['poster_url']; ?>" alt="<?php echo $movie['title']; ?>">
        </div>
        <div class="movie-details">
            <h2><?php echo $movie['title']; ?></h2>
            <p class="movie-meta">
                <span class="genre"><?php echo $movie['genre']; ?></span>
                <span class="duration"><?php echo $movie['duration']; ?> mins</span>
                <span class="release-date">Release: <?php echo date('M d, Y', strtotime($movie['release_date'])); ?></span>
            </p>
            <p class="movie-description"><?php echo $movie['description']; ?></p>
            
            <?php if (!empty($movie['trailer_url'])): ?>
                <div class="trailer-section">
                    <h3>Trailer</h3>
                    <div class="trailer-container">
                        <iframe src="<?php echo htmlspecialchars($movie['trailer_url']); ?>" allowfullscreen></iframe>
                    </div>
                </div>
            <?php endif; ?>
            
            <a href="seat-selection.php?movie_id=<?php echo $movie_id; ?>" class="btn select-seat-btn">Select Seat</a>
        </div>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
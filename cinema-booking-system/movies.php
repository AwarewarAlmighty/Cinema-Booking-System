<?php
include 'includes/header.php';

// Get movies from database
$conn = dbConnect();
$sql = "SELECT * FROM movies WHERE release_date <= CURDATE() ORDER BY release_date DESC";
$result = $conn->query($sql);
$movies = $result->fetch_all(MYSQLI_ASSOC);
$conn->close();
?>

<section class="movies-section">
    <h2>Available Movies</h2>
    
    <div class="movie-filters">
        <form action="movies.php" method="get" class="filter-form">
            <div class="form-group">
                <label for="genre">Genre</label>
                <select id="genre" name="genre">
                    <option value="">All Genres</option>
                    <!-- Add genre options dynamically if needed -->
                </select>
            </div>
            <button type="submit" class="btn filter-btn">Apply Filters</button>
        </form>
    </div>
    
    <div class="movie-grid">
        <?php if (!empty($movies)): ?>
            <?php foreach ($movies as $movie): ?>
                <div class="movie-card">
                    <img src="<?php echo $movie['poster_url']; ?>" alt="<?php echo $movie['title']; ?>">
                    <div class="movie-info">
                        <h3><?php echo $movie['title']; ?></h3>
                        <p class="movie-meta">
                            <span class="genre"><?php echo $movie['genre']; ?></span>
                            <span class="duration"><?php echo $movie['duration']; ?> mins</span>
                            <span class="release-date">Release: <?php echo date('M d, Y', strtotime($movie['release_date'])); ?></span>
                        </p>
                        <p class="movie-description"><?php echo substr($movie['description'], 0, 100) . '...'; ?></p>
                        <a href="movie-description.php?id=<?php echo $movie['movie_id']; ?>" class="btn view-details-btn">View Details</a>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p class="no-movies">No movies currently available.</p>
        <?php endif; ?>
    </div>
    
    <div class="pagination">
        <!-- Add pagination controls if needed -->
    </div>
</section>

<?php
include 'includes/footer.php';
?>
<?php
include 'includes/header.php';

// Get genres from database
$conn = dbConnect();
$genreQuery = "SELECT DISTINCT genre FROM movies ORDER BY genre ASC";
$genreResult = $conn->query($genreQuery);
$genres = $genreResult->fetch_all(MYSQLI_ASSOC);

// Get movies from database with optional genre filter
$genreFilter = isset($_GET['genre']) && !empty($_GET['genre']) ? $_GET['genre'] : null;

$sql = "SELECT * FROM movies WHERE release_date <= CURDATE()";
if ($genreFilter) {
    $sql .= " AND genre = ?";
}
$sql .= " ORDER BY release_date DESC";

$stmt = $conn->prepare($sql);
if ($genreFilter) {
    $stmt->bind_param('s', $genreFilter);
}
$stmt->execute();
$result = $stmt->get_result();
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
                    <?php foreach ($genres as $genre): ?>
                        <option value="<?php echo $genre['genre']; ?>" 
                            <?php echo (isset($_GET['genre']) && $_GET['genre'] === $genre['genre']) ? 'selected' : ''; ?>>
                            <?php echo $genre['genre']; ?>
                        </option>
                    <?php endforeach; ?>
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
                    <div>
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
</section>

<?php
include 'includes/footer.php';
?>
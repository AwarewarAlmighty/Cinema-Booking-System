<?php
include 'includes/header.php';
?>

<section class="movie-list">
    <h2>Now Showing</h2>
    <div class="movie-grid">
        <?php
        $conn = dbConnect();
        $sql = "SELECT * FROM movies WHERE release_date <= CURDATE() ORDER BY release_date DESC";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                echo '<div class="movie-card">';
                echo '<img src="' . $row['poster_url'] . '" alt="' . $row['title'] . '">';
                echo '<h3>' . $row['title'] . '</h3>';
                echo '<p>' . $row['genre'] . ' | ' . $row['duration'] . ' mins</p>';
                echo '<a href="movie-description.php?id=' . $row['movie_id'] . '" class="btn">View Details</a>';
                echo '</div>';
            }
        } else {
            echo '<p>No movies currently showing.</p>';
        }
        $conn->close();
        ?>
    </div>
</section>

<?php
include 'includes/footer.php';
?>
CREATE TABLE IF NOT EXISTS `song` (
  `id` char(11) NOT NULL PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `duration` int NOT NULL,
  `year` int,
  `addedAt` date null NULL DEFAULT CURRENT_TIMESTAMP,
  `filename` varchar(50) NOT NULL,
  `artistId` int NOT NULL, -- make it reference artist.id
  `albumId` int NOT NULL -- make it reference album.id
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `artist` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL
)

CREATE TABLE IF NOT EXISTS `album` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` varchar(255)
)

CREATE TABLE IF NOT EXISTS `playlist` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` varchar(255) NOT NULL
)

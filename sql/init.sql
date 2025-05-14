-- Create user
do
$$
begin
  if not exists (select * from pg_user where usename = 'music_player') then
    CREATE USER music_player WITH ENCRYPTED PASSWORD 'music_player';
  end if;
end
$$
;

-- Create database
do
$$
begin
  if not exists (SELECT FROM pg_database WHERE datname = 'music_player') then
    CREATE DATABASE music_player;
  end if;
end
$$
;

\c music_player;

GRANT ALL PRIVILEGES ON DATABASE music_player TO music_player;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO music_player;

CREATE TYPE MEDIA_TYPE AS ENUM ('flac', 'mp3');


CREATE TABLE IF NOT EXISTS artist (
  "id" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "name" varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS album (
  "id" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "title" varchar(255)
);

CREATE TABLE IF NOT EXISTS playlist (
  "id" char(34) PRIMARY KEY,
  "title" varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS song (
  "id" char(11) NOT NULL PRIMARY KEY,
  "title" varchar(255) NOT NULL,
  "duration" int NOT NULL,
  "year" int,
  "addedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
  "mediaType" MEDIA_TYPE NOT NULL,
  "artistId" int REFERENCES artist(id),
  "albumId" int REFERENCES album(id)
);

CREATE TABLE IF NOT EXISTS playlist_song (
  "songId" char(11) REFERENCES song(id),
  "playlistId" char(34) REFERENCES playlist(id),
  "addedAt" timestamp DEFAULT CURRENT_TIMESTAMP
);

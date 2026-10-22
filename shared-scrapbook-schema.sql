CREATE TABLE IF NOT EXISTS shared_albums(id TEXT PRIMARY KEY,room_id TEXT NOT NULL,name TEXT NOT NULL,author_id TEXT NOT NULL,created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS shared_albums_room ON shared_albums(room_id);
CREATE TABLE IF NOT EXISTS shared_memories(id TEXT PRIMARY KEY,room_id TEXT NOT NULL,album_id TEXT NOT NULL,author_id TEXT NOT NULL,title TEXT NOT NULL,memory_date TEXT NOT NULL,caption TEXT NOT NULL,photo_data TEXT,created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS shared_memories_room ON shared_memories(room_id,album_id);

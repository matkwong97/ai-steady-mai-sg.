-- Run ONCE in existing D1 database ai-steady-mai-db.
-- Stores only shared challenge IDs and each partner's completion state.
-- Private reflection notes remain on each person's device.
CREATE TABLE IF NOT EXISTS love_journey_shared (
 room_id TEXT NOT NULL,
 challenge_id TEXT NOT NULL,
 shared_by TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 PRIMARY KEY(room_id,challenge_id)
);
CREATE TABLE IF NOT EXISTS love_journey_progress (
 room_id TEXT NOT NULL,
 challenge_id TEXT NOT NULL,
 member_id TEXT NOT NULL,
 done INTEGER NOT NULL DEFAULT 0,
 updated_at INTEGER NOT NULL,
 PRIMARY KEY(room_id,challenge_id,member_id)
);
CREATE INDEX IF NOT EXISTS idx_love_journey_room ON love_journey_shared(room_id,created_at);

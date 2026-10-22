-- Run once in the existing D1 database. Old account tables can remain; this version does not use them.
CREATE TABLE IF NOT EXISTS love_rooms (id TEXT PRIMARY KEY, active INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, ended_at INTEGER);
CREATE TABLE IF NOT EXISTS love_members (id TEXT PRIMARY KEY, room_id TEXT NOT NULL REFERENCES love_rooms(id), display_name TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, recovery_hash TEXT NOT NULL UNIQUE, joined_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_love_members_room ON love_members(room_id);
CREATE TABLE IF NOT EXISTS love_invites (code_hash TEXT PRIMARY KEY, room_id TEXT NOT NULL REFERENCES love_rooms(id), expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS love_messages (id TEXT PRIMARY KEY, room_id TEXT NOT NULL REFERENCES love_rooms(id), sender_id TEXT NOT NULL REFERENCES love_members(id), code TEXT NOT NULL, text TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_love_messages_room ON love_messages(room_id,created_at);
CREATE TABLE IF NOT EXISTS love_attempts (key TEXT NOT NULL, at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_love_attempts_key ON love_attempts(key,at);

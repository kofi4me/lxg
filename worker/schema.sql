CREATE TABLE IF NOT EXISTS registrations (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 event_id TEXT NOT NULL,
 name TEXT NOT NULL,
 email TEXT NOT NULL,
 phone TEXT NOT NULL DEFAULT '',
 attendance TEXT NOT NULL CHECK(attendance IN ('yes','no')),
 consent_version TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 UNIQUE(event_id,email)
);
CREATE TABLE IF NOT EXISTS admin_sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS request_limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at INTEGER NOT NULL);

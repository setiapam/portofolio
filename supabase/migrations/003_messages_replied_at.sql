-- Add replied_at column to track when admin replied to a message
ALTER TABLE messages ADD COLUMN replied_at timestamptz DEFAULT NULL;

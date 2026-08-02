ALTER TABLE events ADD COLUMN is_qa INTEGER NOT NULL DEFAULT 0 CHECK (is_qa IN (0, 1));

-- All events before this migration came from release verification and cannot be
-- distinguished at row level, so keep them out of product-user reporting.
UPDATE events SET is_qa = 1;

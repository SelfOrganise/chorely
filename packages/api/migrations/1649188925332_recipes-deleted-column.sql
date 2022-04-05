-- Up Migration
ALTER TABLE recipes ADD deleted bool NOT NULL DEFAULT false;

-- Down Migration
ALTER TABLE recipes DROP COLUMN deleted;

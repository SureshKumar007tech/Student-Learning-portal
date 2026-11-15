-- Align the original resource table with the columns used by ResourceRepository.
ALTER TABLE resources ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_url VARCHAR(255);
ALTER TABLE resources ADD COLUMN IF NOT EXISTS course_id_ref BIGINT;

UPDATE resources SET file_url = file_path WHERE file_url IS NULL AND file_path IS NOT NULL;

ALTER TABLE resources DROP COLUMN IF EXISTS file_path;

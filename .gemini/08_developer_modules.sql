-- Migration: Multi-Module Developers (N:M Relationship)

-- 1. Create junction table
CREATE TABLE IF NOT EXISTS developer_modules (
    developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (developer_id, module_id)
);

-- 2. Migrate existing data (preserve current assignments)
INSERT INTO developer_modules (developer_id, module_id)
SELECT id, module_id 
FROM developers 
WHERE module_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. Remove old column
-- We drop the constraint first to be safe, then the column
ALTER TABLE developers DROP CONSTRAINT IF EXISTS developers_module_id_fkey;
ALTER TABLE developers DROP COLUMN IF EXISTS module_id;

-- 4. Enable RLS on new table
ALTER TABLE developer_modules ENABLE ROW LEVEL SECURITY;

-- 5. Add RLS policies (Open for now, similar to other tables)
CREATE POLICY "Public read for all" ON developer_modules FOR SELECT USING (true);
CREATE POLICY "Public write for all" ON developer_modules FOR ALL USING (true);

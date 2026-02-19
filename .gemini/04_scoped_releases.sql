-- Migration: Link Releases to Modules

-- 1. Add module_id to releases table
ALTER TABLE releases 
ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES modules(id) ON DELETE CASCADE;

-- 2. Update existing releases to default module (optional, or manual update required)
-- For this environment, we can assign them to the first found module or leave null
-- DO $$ 
-- DECLARE 
--     first_module_id UUID;
-- BEGIN
--     SELECT id INTO first_module_id FROM modules LIMIT 1;
--     UPDATE releases SET module_id = first_module_id WHERE module_id IS NULL;
-- END $$;

-- 3. Make module_id required (after data fix if needed)
-- ALTER TABLE releases ALTER COLUMN module_id SET NOT NULL;

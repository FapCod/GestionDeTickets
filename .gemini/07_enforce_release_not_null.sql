-- Migration: Enforce release_id NOT NULL on tickets table

-- 1. Data Fix: Assign a default release to existing tickets with NULL release_id
-- We pick the most recent active release, or just the most recent release if none active.
DO $$
DECLARE
    default_release_id UUID;
BEGIN
    -- Try to find an active release first
    SELECT id INTO default_release_id 
    FROM releases 
    WHERE active = true 
    ORDER BY created_at DESC 
    LIMIT 1;

    -- If no active release, pick any release
    IF default_release_id IS NULL THEN
        SELECT id INTO default_release_id 
        FROM releases 
        ORDER BY created_at DESC 
        LIMIT 1;
    END IF;

    -- If still null (no releases exist), we might need to create one or fail.
    -- For now, we only update if we found a release. 
    -- If we didn't find one, the ALTER TABLE below will fail if there are nulls, which is correct behavior (can't enforce NOT NULL without data).
    
    IF default_release_id IS NOT NULL THEN
        UPDATE tickets 
        SET release_id = default_release_id 
        WHERE release_id IS NULL;
    END IF;
END $$;

-- 2. Enforce NOT NULL constraint
ALTER TABLE tickets 
ALTER COLUMN release_id SET NOT NULL;

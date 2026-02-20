-- Add module_id to developers table
ALTER TABLE developers 
ADD COLUMN module_id UUID REFERENCES modules(id);

-- Update RLS policies (if any) or just comment
COMMENT ON COLUMN developers.module_id IS 'Link to the module this developer belongs to';

-- Add responsible column to releases table
ALTER TABLE releases 
ADD COLUMN responsible TEXT;

COMMENT ON COLUMN releases.responsible IS 'Name of the person responsible for this release';

-- Migration: Add Releases and Comments Support

-- 1. Create Releases Table
CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    start_date DATE,
    end_date DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for releases
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read for all" ON releases FOR SELECT USING (true);
CREATE POLICY "Public write for all" ON releases FOR ALL USING (true);

-- 2. Add release_id to Tickets
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS release_id UUID REFERENCES releases(id);

-- 3. Add notes to Ticket Component Matrix (for Comments)
ALTER TABLE ticket_component_matrix 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 4. Seed Releases Data
INSERT INTO releases (name, start_date, end_date, active) 
VALUES
('Release 2024-Q1-Sprint1', '2024-01-01', '2024-01-15', TRUE),
('Release 2024-Q1-Sprint2', '2024-01-16', '2024-01-30', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 5. Seed COMMENTS Components for each Module
DO $$
DECLARE
    mod_rec RECORD;
BEGIN
    FOR mod_rec IN SELECT id, name FROM modules LOOP
        INSERT INTO components (name, module_id)
        VALUES ('COMMENTS', mod_rec.id)
        ON CONFLICT (name, module_id) DO NOTHING;
    END LOOP;
END $$;

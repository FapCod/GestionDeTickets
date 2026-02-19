-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Modules / Domains Catalog
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Components (Depends on Module)
CREATE TABLE components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, module_id)
);

-- 3. Statuses Catalog (For Ticket Status and QA Status)
CREATE TABLE statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('TICKET', 'QA')),
    color TEXT DEFAULT '#000000', -- Hex code for UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, category)
);

-- 4. Teams Catalog
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Environments Catalog
CREATE TABLE environments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Developers Catalog
CREATE TABLE developers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tickets Table (Main Transactional Table)
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status_id UUID REFERENCES statuses(id), -- Current Ticket State
    qa_status_id UUID REFERENCES statuses(id), -- Current QA State
    dev_id UUID REFERENCES developers(id),
    team_id UUID REFERENCES teams(id),
    environment_id UUID REFERENCES environments(id),
    code_freeze BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Ticket Component Matrix (Pivot Table)
CREATE TABLE ticket_component_matrix (
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    component_id UUID REFERENCES components(id) ON DELETE CASCADE,
    applies BOOLEAN DEFAULT FALSE, -- Toggle: Does this ticket affect this component?
    PRIMARY KEY (ticket_id, component_id)
);

-- RLS Policies
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_component_matrix ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read for all" ON modules FOR SELECT USING (true);
CREATE POLICY "Public read for all" ON components FOR SELECT USING (true);
CREATE POLICY "Public read for all" ON statuses FOR SELECT USING (true);
CREATE POLICY "Public read for all" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read for all" ON environments FOR SELECT USING (true);
CREATE POLICY "Public read for all" ON developers FOR SELECT USING (true);
CREATE POLICY "Public read for all" ON tickets FOR SELECT USING (true);
CREATE POLICY "Public read for all" ON ticket_component_matrix FOR SELECT USING (true);

-- Allow public write access
CREATE POLICY "Public write for all" ON modules FOR ALL USING (true);
CREATE POLICY "Public write for all" ON components FOR ALL USING (true);
CREATE POLICY "Public write for all" ON statuses FOR ALL USING (true);
CREATE POLICY "Public write for all" ON teams FOR ALL USING (true);
CREATE POLICY "Public write for all" ON environments FOR ALL USING (true);
CREATE POLICY "Public write for all" ON developers FOR ALL USING (true);
CREATE POLICY "Public write for all" ON tickets FOR ALL USING (true);
CREATE POLICY "Public write for all" ON ticket_component_matrix FOR ALL USING (true);

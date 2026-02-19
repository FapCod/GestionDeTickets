-- Seed Data

-- 1. Modules
INSERT INTO modules (name, description) VALUES
('SomosBelcorp', 'Platform for consultants'),
('Unete', 'Onboarding platform'),
('FFVV', 'Sales Force Management'),
('eCatalogo', 'Digital Catalog System');

-- 2. Components (Dynamic references)
DO $$
DECLARE
    sb_id UUID;
    unete_id UUID;
    ffvv_id UUID;
    ecat_id UUID;
BEGIN
    SELECT id INTO sb_id FROM modules WHERE name = 'SomosBelcorp';
    SELECT id INTO unete_id FROM modules WHERE name = 'Unete';
    SELECT id INTO ffvv_id FROM modules WHERE name = 'FFVV';
    SELECT id INTO ecat_id FROM modules WHERE name = 'eCatalogo';

    INSERT INTO components (name, module_id) VALUES
    ('Login Service', sb_id),
    ('Order Entry', sb_id),
    ('Profile Manager', sb_id),
    ('Registration Flow', unete_id),
    ('Document Upload', unete_id),
    ('Commission Calc', ffvv_id),
    ('Territory Map', ffvv_id),
    ('Viewer App', ecat_id),
    ('PDF Generator', ecat_id);
END $$;

-- 3. Statuses
INSERT INTO statuses (name, category, color) VALUES
('EN PROCESO', 'TICKET', '#3b82f6'), -- Blue
('FINALIZADO', 'TICKET', '#22c55e'), -- Green
('CANCELADO', 'TICKET', '#ef4444'), -- Red
('EN OBSERVACION', 'TICKET', '#f59e0b'), -- Amber
('PENDIENTE QA', 'QA', '#64748b'), -- Slate
('QA APROBADO', 'QA', '#22c55e'), -- Green
('QA RECHAZADO', 'QA', '#ef4444'), -- Red
('PRD DEPLOYMENT', 'QA', '#8b5cf6'), -- Violet
('ROLLBACK', 'QA', '#ec4899'); -- Pink

-- 4. Teams
INSERT INTO teams (name) VALUES
('L3 Support'),
('MC (Mantenimiento Correctivo)'),
('Evolutivo'),
('Architecture');

-- 5. Environments
INSERT INTO environments (name) VALUES
('DEV'),
('QA'),
('PPR'),
('PPRFIX'),
('PROD');

-- 6. Developers
INSERT INTO developers (name, email) VALUES
('Luis', 'luis@example.com'),
('Carlos', 'carlos@example.com'),
('Brayan', 'brayan@example.com'),
('Maria', 'maria@example.com');

-- 7. Sample Tickets
DO $$
DECLARE
    dev_luis UUID;
    team_l3 UUID;
    env_qa UUID;
    status_prog UUID;
    qa_pend UUID;
    sb_id UUID;
    comp_login UUID;
    comp_order UUID;
    new_ticket_id UUID;
BEGIN
    SELECT id INTO dev_luis FROM developers WHERE name = 'Luis';
    SELECT id INTO team_l3 FROM teams WHERE name = 'L3 Support';
    SELECT id INTO env_qa FROM environments WHERE name = 'QA';
    SELECT id INTO status_prog FROM statuses WHERE name = 'EN PROCESO' AND category = 'TICKET';
    SELECT id INTO qa_pend FROM statuses WHERE name = 'PENDIENTE QA' AND category = 'QA';
    SELECT id INTO sb_id FROM modules WHERE name = 'SomosBelcorp';
    SELECT id INTO comp_login FROM components WHERE name = 'Login Service' AND module_id = sb_id;
    SELECT id INTO comp_order FROM components WHERE name = 'Order Entry' AND module_id = sb_id;

    INSERT INTO tickets (title, description, status_id, qa_status_id, dev_id, team_id, environment_id)
    VALUES ('Fix Login Timeout', 'Users get timed out after 5 mins', status_prog, qa_pend, dev_luis, team_l3, env_qa)
    RETURNING id INTO new_ticket_id;

    -- Map Matrix
    INSERT INTO ticket_component_matrix (ticket_id, component_id, applies)
    VALUES (new_ticket_id, comp_login, TRUE), (new_ticket_id, comp_order, FALSE);
END $$;

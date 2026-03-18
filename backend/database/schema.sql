-- ============================================================================
-- A320 VIRTUAL MAINTENANCE SYSTEM - SUPABASE DATABASE SCHEMA
-- Free tier compatible - PostgreSQL - Version 1.0
-- ============================================================================

-- ============================================================================
-- AIRLINES TABLE (Multi-airline support)
-- ============================================================================
CREATE TABLE IF NOT EXISTS airlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  country TEXT,
  icao_code TEXT UNIQUE,
  iata_code TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- USERS PROFILE TABLE (extends Supabase Auth)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('pilot', 'ame', 'inspector', 'admin', 'viewer')),
  company TEXT,
  airline_id UUID REFERENCES airlines(id),
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- AIRCRAFT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS aircraft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airline_id UUID REFERENCES airlines(id) ON DELETE CASCADE,
  registration TEXT UNIQUE NOT NULL,
  aircraft_type TEXT NOT NULL,
  manufacturer TEXT,
  serial_number TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'grounded', 'retired')),
  manufacturing_date DATE,
  last_maintenance DATE,
  total_flight_hours NUMERIC DEFAULT 0,
  total_cycles NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- FLIGHT LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS flight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id UUID NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
  pilot_id UUID NOT NULL REFERENCES profiles(id),
  flight_date DATE NOT NULL,
  departure TEXT NOT NULL,
  arrival TEXT NOT NULL,
  flight_hours NUMERIC NOT NULL,
  flight_cycles NUMERIC DEFAULT 1,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- DEFECT LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS defect_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id UUID NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES profiles(id),
  ata_chapter TEXT NOT NULL,
  component TEXT,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- MAINTENANCE TASKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id UUID NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
  defect_id UUID REFERENCES defect_logs(id) ON DELETE SET NULL,
  component TEXT NOT NULL,
  ata_chapter TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES profiles(id),
  assigned_date TIMESTAMP,
  started_date TIMESTAMP,
  completed_date TIMESTAMP,
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- MAINTENANCE LOGS (Work performed)
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES profiles(id),
  action_taken TEXT NOT NULL,
  inspection_result TEXT,
  parts_replaced TEXT,
  signature TEXT,
  signature_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- MAINTENANCE SCHEDULE (A-Check, C-Check, D-Check)
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenance_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id UUID NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL,
  interval_hours INTEGER,
  interval_cycles INTEGER,
  interval_months INTEGER,
  last_check_date DATE,
  next_due_date DATE,
  estimated_duration_hours NUMERIC,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- APPROVALS (Inspector verification)
-- ============================================================================
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
  approved_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  comments TEXT,
  approval_time TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- AUDIT TRAIL (comprehensive logging)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- COMPONENTS DATABASE (120+ components)
-- ============================================================================
CREATE TABLE IF NOT EXISTS components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id TEXT UNIQUE NOT NULL,
  aircraft_id UUID REFERENCES aircraft(id),
  name TEXT NOT NULL,
  ata_chapter TEXT NOT NULL,
  system TEXT NOT NULL,
  subsystem TEXT,
  health NUMERIC DEFAULT 100,
  temperature NUMERIC,
  cycle_hours NUMERIC DEFAULT 0,
  maintenance_interval_hours INTEGER,
  last_inspection DATE,
  next_inspection DATE,
  status TEXT DEFAULT 'normal' CHECK (status IN ('normal', 'maintenance_due', 'fault', 'replaced')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- AIRCRAFT ZONES (200+ clickable areas for 3D viewer)
-- ============================================================================
CREATE TABLE IF NOT EXISTS aircraft_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  ata_chapter TEXT,
  component_type TEXT,
  description TEXT,
  x_position NUMERIC,
  y_position NUMERIC,
  z_position NUMERIC,
  radius NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_airline ON profiles(airline_id);
CREATE INDEX IF NOT EXISTS idx_aircraft_airline ON aircraft(airline_id);
CREATE INDEX IF NOT EXISTS idx_aircraft_status ON aircraft(status);
CREATE INDEX IF NOT EXISTS idx_flight_logs_aircraft ON flight_logs(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_flight_logs_pilot ON flight_logs(pilot_id);
CREATE INDEX IF NOT EXISTS idx_defect_logs_aircraft ON defect_logs(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_defect_logs_status ON defect_logs(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_aircraft ON maintenance_tasks(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_status ON maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_assigned ON maintenance_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_task ON maintenance_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_engineer ON maintenance_logs(engineer_id);
CREATE INDEX IF NOT EXISTS idx_approvals_task ON approvals(task_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created ON audit_trail(created_at);
CREATE INDEX IF NOT EXISTS idx_components_aircraft ON components(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_components_health ON components(health);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_aircraft ON maintenance_schedule(aircraft_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE defect_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft_zones ENABLE ROW LEVEL SECURITY;

-- AIRLINES TABLE
create table airlines (
  id uuid primary key default gen_random_uuid(),
  name text,
  country text,
  created_at timestamp default now()
);

-- USERS PROFILE TABLE
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  role text check (role in ('pilot','ame','inspector','admin','viewer')),
  company text,
  airline_id uuid references airlines(id),
  created_at timestamp default now()
);

-- AIRCRAFT TABLE
create table aircraft (
  id uuid primary key default gen_random_uuid(),
  registration text unique,
  aircraft_type text,
  status text,
  airline_id uuid references airlines(id),
  created_at timestamp default now()
);

-- FLIGHT LOGS
create table flight_logs (
  id uuid primary key default gen_random_uuid(),
  aircraft_id uuid references aircraft(id),
  pilot_id uuid references profiles(id),
  flight_date date,
  departure text,
  arrival text,
  flight_hours numeric,
  remarks text,
  created_at timestamp default now()
);

-- DEFECT LOGS
create table defect_logs (
  id uuid primary key default gen_random_uuid(),
  aircraft_id uuid references aircraft(id),
  reported_by uuid references profiles(id),
  ata text,
  description text,
  severity text,
  status text default 'open',
  created_at timestamp default now()
);

-- MAINTENANCE TASKS
create table maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  aircraft_id uuid references aircraft(id),
  component text,
  ata_chapter text,
  description text,
  status text default 'open',
  assigned_to uuid references profiles(id),
  created_at timestamp default now(),
  completed_at timestamp
);

-- MAINTENANCE LOGS
create table maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references maintenance_tasks(id),
  engineer_id uuid references profiles(id),
  action_taken text,
  inspection_result text,
  signature text,
  created_at timestamp default now()
);

-- MAINTENANCE SCHEDULE
create table maintenance_schedule (
  id uuid primary key default gen_random_uuid(),
  aircraft_id uuid references aircraft(id),
  check_type text,
  interval_hours integer,
  interval_cycles integer,
  last_check timestamp,
  next_due timestamp
);

-- APPROVALS
create table approvals (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references maintenance_tasks(id),
  approved_by uuid references profiles(id),
  approval_status text,
  approval_time timestamp default now()
);

-- AUDIT TRAIL
create table audit_trail (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action text,
  module text,
  record_id uuid,
  details jsonb,
  created_at timestamp default now()
);

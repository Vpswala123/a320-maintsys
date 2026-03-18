-- ============================================================================
-- A320 VIRTUAL MAINTENANCE SYSTEM - ROW LEVEL SECURITY (RLS) POLICIES
-- Apply these policies in Supabase SQL Editor after creating schema.sql
-- ============================================================================

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "users_view_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can view other profiles in same airline (for coordination)
CREATE POLICY "users_view_airline_profiles" ON profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE airline_id = (
        SELECT airline_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Only admin can update profiles
CREATE POLICY "admin_update_profiles" ON profiles
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================================
-- AIRCRAFT POLICIES
-- ============================================================================

-- Users can view aircraft in their airline
CREATE POLICY "users_view_aircraft" ON aircraft
  FOR SELECT USING (
    airline_id = (SELECT airline_id FROM profiles WHERE id = auth.uid())
  );

-- Only admin can create aircraft
CREATE POLICY "admin_create_aircraft" ON aircraft
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Only admin can update aircraft
CREATE POLICY "admin_update_aircraft" ON aircraft
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================================
-- FLIGHT LOGS POLICIES
-- ============================================================================

-- Pilots can create flight logs
CREATE POLICY "pilot_create_flight_log" ON flight_logs
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('pilot', 'admin')
    AND pilot_id = auth.uid()
  );

-- Pilots can view and edit their own flight logs
CREATE POLICY "pilot_view_own_logs" ON flight_logs
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('pilot', 'admin')
  );

-- Pilots can update their own flight logs
CREATE POLICY "pilot_update_own_logs" ON flight_logs
  FOR UPDATE USING (
    pilot_id = auth.uid()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('pilot', 'admin')
  );

-- ============================================================================
-- DEFECT LOGS POLICIES
-- ============================================================================

-- Pilots and AME can create defect logs
CREATE POLICY "pilot_ame_create_defect" ON defect_logs
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('pilot', 'ame', 'admin')
    AND reported_by = auth.uid()
  );

-- Everyone can view defect logs in their airline
CREATE POLICY "users_view_defects" ON defect_logs
  FOR SELECT USING (
    aircraft_id IN (
      SELECT id FROM aircraft 
      WHERE airline_id = (SELECT airline_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Reporters can update their own defects
CREATE POLICY "defect_reporter_update" ON defect_logs
  FOR UPDATE USING (
    reported_by = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ame', 'admin')
  );

-- ============================================================================
-- MAINTENANCE TASKS POLICIES
-- ============================================================================

-- AME can create maintenance tasks
CREATE POLICY "ame_create_maintenance" ON maintenance_tasks
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ame', 'admin')
  );

-- Everyone can view maintenance tasks in their airline
CREATE POLICY "users_view_maintenance" ON maintenance_tasks
  FOR SELECT USING (
    aircraft_id IN (
      SELECT id FROM aircraft 
      WHERE airline_id = (SELECT airline_id FROM profiles WHERE id = auth.uid())
    )
  );

-- AME can update maintenance tasks
CREATE POLICY "ame_update_maintenance" ON maintenance_tasks
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ame', 'admin')
  );

-- ============================================================================
-- MAINTENANCE LOGS POLICIES
-- ============================================================================

-- Engineers can create maintenance logs for their assigned tasks
CREATE POLICY "engineer_create_maintenance_log" ON maintenance_logs
  FOR INSERT WITH CHECK (
    engineer_id = auth.uid()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ame', 'admin')
  );

-- Everyone in airline can view maintenance logs
CREATE POLICY "users_view_maintenance_logs" ON maintenance_logs
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM maintenance_tasks 
      WHERE aircraft_id IN (
        SELECT id FROM aircraft 
        WHERE airline_id = (SELECT airline_id FROM profiles WHERE id = auth.uid())
      )
    )
  );

-- ============================================================================
-- APPROVALS POLICIES
-- ============================================================================

-- Inspector can create approvals
CREATE POLICY "inspector_create_approval" ON approvals
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('inspector', 'admin')
    AND approved_by = auth.uid()
  );

-- Everyone can view approvals in their airline
CREATE POLICY "users_view_approvals" ON approvals
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM maintenance_tasks 
      WHERE aircraft_id IN (
        SELECT id FROM aircraft 
        WHERE airline_id = (SELECT airline_id FROM profiles WHERE id = auth.uid())
      )
    )
  );

-- Inspector can update approval status
CREATE POLICY "inspector_update_approval" ON approvals
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('inspector', 'admin')
    AND approved_by = auth.uid()
  );

-- ============================================================================
-- AUDIT TRAIL POLICIES
-- ============================================================================

-- All actions automatically create audit entries (via trigger - see triggers.sql)
-- Users can view audit trail for their actions
CREATE POLICY "users_view_own_audit" ON audit_trail
  FOR SELECT USING (
    user_id = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Only system can insert audit logs (via trigger)
-- Users cannot directly insert
CREATE POLICY "prevent_user_insert_audit" ON audit_trail
  FOR INSERT WITH CHECK (FALSE);

-- ============================================================================
-- COMPONENTS POLICIES
-- ============================================================================

-- Everyone can view components
CREATE POLICY "users_view_components" ON components
  FOR SELECT USING (TRUE);

-- Only AME can update component status
CREATE POLICY "ame_update_components" ON components
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ame', 'admin')
  );

-- ============================================================================
-- AIRCRAFT ZONES POLICIES
-- ============================================================================

-- Everyone can view zones (publicly available 3D model data)
CREATE POLICY "users_view_zones" ON aircraft_zones
  FOR SELECT USING (TRUE);

-- Only admin can modify zones
CREATE POLICY "admin_manage_zones" ON aircraft_zones
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

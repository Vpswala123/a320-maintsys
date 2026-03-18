# API Structure

This document outlines the general structure of the API layout for the A320 Virtual Maintenance System backend.

## Auth Routes (`/api/auth`)
- `POST /login` - Authenticate a user and return a JWT.
- `POST /signup` - Register a new user.
- `POST /otp` - Verify an Optional OTP code.

## Maintenance Routes (`/api/maintenance`)
- `GET /tasks` - Retrieve a list of maintenance tasks.
- `POST /tasks` - Create a new maintenance task (AME/Admin).
- `PUT /tasks/:id` - Update an existing maintenance task.
- `POST /tasks/:id/close` - Close a maintenance task (AME/Admin).

## Approval Routes (`/api/approvals`)
- `POST /approve/:taskId` - Approve a completed maintenance task (Inspector/Admin).

## Log Routes (`/api/logs`)
- `GET /flight-logs` - Retrieve flight logs.
- `POST /flight-logs` - Create a new flight log entry (Pilot/AME/Inspector/Admin).
- `GET /defect-logs` - Retrieve defect reports.
- `POST /defect-logs` - Submit a new defect report.
- `GET /audit-logs` - Retrieve audit logs (Admin only).

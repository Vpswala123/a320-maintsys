# Role-Based Access Control (RBAC) Rules

## Role Hierarchy

- **Admin** (Airline authority)
│
├── **AME** (Aircraft Maintenance Engineer)
│       Can update maintenance checks
│       Can close maintenance tasks
│
├── **Pilot**
│       Can create flight log entries
│       Cannot modify maintenance data
│
├── **Inspector**
│       Can approve maintenance tasks
│
└── **Viewer**
        Read-only access

## Role Permissions Matrix

| Action | Pilot | AME | Inspector | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Create flight log | ✔ | ✔ | ✔ | ✔ |
| Edit flight log | ✔ | ✔ | ✔ | ✔ |
| Create defect report | ✔ | ✔ | ✔ | ✔ |
| Edit maintenance task | ✖ | ✔ | ✔ | ✔ |
| Close maintenance task | ✖ | ✔ | ✔ | ✔ |
| Approve maintenance | ✖ | ✖ | ✔ | ✔ |
| Delete logs | ✖ | ✖ | ✖ | ✔ |
| Manage users | ✖ | ✖ | ✖ | ✔ |

## Example Workflows
1. **Pilot Defect Reporting:** Pilot reports defect → System creates defect entry → AME assigned maintenance task → AME performs maintenance → Inspector approves → Task closed.
2. **Flight Logging:** Pilot creates Flight Log for completed journey.
3. **Approval:** AME completes maintenance → Inspector verifies work → Inspector approves task → Database marks task CLOSED.

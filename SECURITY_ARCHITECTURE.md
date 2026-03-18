# Security Architecture

## A320 Virtual Maintenance System - Security Design

**Document Version**: 1.0  
**Last Updated**: March 2026  
**System**: Aircraft Maintenance Record System (FREE tier, open-source)

---

## 1. Overview

This security architecture outlines how the A320 Virtual Maintenance System protects sensitive aircraft maintenance data and enforces role-based access controls. The system is designed to emulate professional airline maintenance software like AMOS and Ramco Aviation, while using only free or open-source tools.

**Key Principles:**
- Defense in depth (multiple security layers)
- Least privilege access
- Complete audit trails
- Data integrity verification
- Role-based authorization
- Zero-cost security implementation

---

## 2. Authentication System

### 2.1 Authentication Provider
**Provider**: Supabase Auth (Free tier)  
**Protocol**: JWT (JSON Web Tokens)

### 2.2 Authentication Flow
```
1. User opens login portal
2. Enters email and password
3. Supabase Auth verifies credentials
4. Optional OTP verification (email-based, free)
5. JWT token issued
6. User profile and role fetched from database
7. Access granted according to role
```

### 2.3 Supported Authentication Methods
- **Email/Password**: Standard credentials
- **Email OTP**: One-Time Password for sensitive operations
- **Session-based**: JWT tokens with 1-hour expiry

### 2.4 Password Security
- **Hashing**: Bcrypt (handled by Supabase)
- **Requirements**:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character (!@#$%^&*)

### 2.5 Session Management
- **Token Lifetime**: 1 hour (auto-refresh available)
- **Session Timeout**: 30 minutes of inactivity
- **Token Storage**: sessionStorage (for security) + localStorage (for persistence)
- **Logout**: Automatic on token expiry or manual logout

---

## 3. Authorization & Role-Based Access Control (RBAC)

### 3.1 Role Hierarchy

```
┌─ ADMIN (Airline Authority)
│  ├─ Full system access
│  ├─ User management
│  ├─ System settings
│  └─ Audit report access
│
├─ AME (Aircraft Maintenance Engineer)
│  ├─ Create/edit maintenance tasks
│  ├─ Complete maintenance work
│  ├─ Digital sign-off capability
│  └─ Component status updates
│
├─ PILOT
│  ├─ Create flight logs
│  ├─ Report defects
│  ├─ View maintenance status
│  └─ Read-only access to logs
│
├─ INSPECTOR (Quality Assurance)
│  ├─ View all maintenance records
│  ├─ Approve/reject completed work
│  ├─ Generate compliance reports
│  └─ Access audit logs
│
└─ VIEWER
   ├─ Read-only access to all data
   ├─ View flight logs
   ├─ View maintenance history
   └─ No data modification capability
```

### 3.2 Permission Matrix

| Action | Pilot | AME | Inspector | Admin | Viewer |
|--------|-------|-----|-----------|-------|--------|
| Create flight log | ✅ | ✅ | ❌ | ✅ | ❌ |
| Edit flight log | ✅ | ✅ | ❌ | ✅ | ❌ |
| Create defect report | ✅ | ✅ | ❌ | ✅ | ❌ |
| Create maintenance task | ❌ | ✅ | ❌ | ✅ | ❌ |
| Update maintenance task | ❌ | ✅ | ❌ | ✅ | ❌ |
| Complete & sign maintenance | ❌ | ✅ | ❌ | ✅ | ❌ |
| Approve maintenance | ❌ | ❌ | ✅ | ✅ | ❌ |
| Delete records | ❌ | ❌ | ❌ | ✅ | ❌ |
| Manage users | ❌ | ❌ | ❌ | ✅ | ❌ |
| View audit logs | ❌ | ❌ | ✅ | ✅ | ❌ |

### 3.3 Access Control Implementation

**Frontend**: `roleGuard.js`
- Client-side role checking
- Permission validation before API calls
- UI element visibility based on role

**Backend**: `authMiddleware.js` + `roleMiddleware.js`
- JWT token validation
- Server-side authorization enforcement
- Row-Level Security (RLS) in Supabase

**Database**: Supabase RLS Policies
- Enforced at database level
- Cannot be bypassed
- Automatic data isolation per user/role

---

## 4. Data Protection & Encryption

### 4.1 Data at Rest
- **Storage**: Supabase PostgreSQL
- **Encryption**: TLS in transit
- **Backup**: Handled by Supabase (automatic)

### 4.2 Data in Transit
- **Protocol**: HTTPS only
- **Cipher**: TLS 1.2+
- **Certificate**: Auto-managed by Supabase/Vercel

### 4.3 Sensitive Data Fields
- Passwords: Hashed with bcrypt (never stored in plaintext)
- API responses: Filtered by role at database level
- Audit logs: Complete data change history

---

## 5. Digital Signatures & Integrity Verification

### 5.1 Maintenance Sign-off Signature

**Process:**
```
1. AME completes maintenance task
2. System generates work record summary
3. SHA-256 hash created of all work data
4. Signature includes: timestamp, AME ID, work description
5. Signature stored with maintenance log
6. Cannot be altered without invalidating hash
```

**Signature Data:**
```json
{
  "task_id": "uuid",
  "component": "Engine 1 Combustor",
  "work_completed": "Combustor inspection and cleaning",
  "engineer_id": "user-id",
  "signed_at": "2026-03-12T14:30:00Z",
  "signature_hash": "SHA-256 hash",
  "verification": "VALID"
}
```

### 5.2 Approval Signature

**Inspector approval process:**
```
1. Inspector reviews completed maintenance
2. Inspector approves (or rejects) work
3. Signature created with approval details
4. Linked to AME's maintenance signature
5. Creates signature chain for full traceability
```

### 5.3 Signature Verification

**Verification process:**
```javascript
// Verify signature integrity
const isValid = SignatureService.verifySignature(
  originalData,
  storedSignature,
  userId
);

// If hashes match = data not altered
```

Signatures provide:
- ✅ Work completion proof
- ✅ Data integrity (detects tampering)
- ✅ Accountability (who did what, when)
- ✅ Compliance evidence

---

## 6. Audit Trail System

### 6.1 Comprehensive Logging

Every user action is logged:

| Action | Logged | Details |
|--------|--------|---------|
| Login | ✅ | User ID, timestamp, success/failure |
| Data Create | ✅ | User, record ID, new values |
| Data Update | ✅ | User, old values, new values, diff |
| Data Delete | ✅ | User, deleted record, timestamp |
| Maintenance Complete | ✅ | Work performed, signature |
| Approval | ✅ | Approver, decision, timestamp |
| Report Generation | ✅ | Report details, requestor |
| Failed Access | ✅ | Attempted access, denial reason |

### 6.2 Audit Log Structure

```json
{
  "audit_id": "uuid",
  "user_id": "user-uuid",
  "action": "CREATE | UPDATE | DELETE | APPROVE",
  "module": "maintenance | flight_log | defect",
  "table_name": "maintenance_tasks",
  "record_id": "record-uuid",
  "old_values": { /* previous state */ },
  "new_values": { /* current state */ },
  "timestamp": "2026-03-12T14:35:00Z",
  "ip_address": "192.168.x.x",
  "user_agent": "Mozilla/5.0..."
}
```

### 6.3 Audit Log Access

- **Admin**: Full access to all audit logs
- **Inspector**: Can view audit logs for compliance
- **Others**: Only their own activity

### 6.4 Report Generation

**Available reports:**
- User activity summary (past 24 hours/30 days)
- Maintenance completion audit trail
- Access denial attempts
- System security events
- Compliance verification reports

---

## 7. Multi-Airline Data Isolation

### 7.1 Data Segregation

Each airline operates in complete isolation:
- Users can only see their airline's data
- Queries automatically filtered by `airline_id`
- Row-Level Security prevents cross-airline access

### 7.2 Admin-only Cross-Airline Access

```javascript
// Pilot can only see their airline
SELECT * FROM aircraft WHERE airline_id = auth.uid().airline_id

// Admin can see all airlines
SELECT * FROM aircraft -- (no airline filter)
```

---

## 8. Sensitive Operations Protection

### 8.1 High-Risk Actions Requiring Approval

| Operation | Risk Level | Approval Required |
|-----------|-----------|------------------|
| Maintenance sign-off | HIGH | Inspector approval |
| Component status change to "fault" | HIGH | AME + Inspector |
| User role modification | CRITICAL | Admin only |
| Delete maintenance record | CRITICAL | Admin + Audit log |

### 8.2 OTP Protection

For sensitive operations:
- User requests action
- OTP sent to verified email
- User enters OTP
- Action confirms

---

## 9. Future Hardware Authentication

### 9.1 USB Digital Key Implementation

**When available, the system will support:**

```
Process:
1. User plugs in USB hardware token
2. Browser detects connected device
3. Device serial verified against registered tokens
4. Token's private key signs the maintenance record
5. Signature includes: device serial, timestamp, work data
6. Cannot be forged without physical hardware
```

**Benefits:**
- ✅ Three-factor authentication (password + token + biometric on token)
- ✅ Cryptographically secure signing
- ✅ Tamper-proof maintenance records
- ✅ Similar to aviation industry standards
- ✅ Compatible with digital cert chains

**Timeline**: Available in future versions (currently placeholder in code)

---

## 10. Security Best Practices

### 10.1 Password Security

**For Users:**
- Use unique, strong passwords
- Don't share credentials
- Enable 2-factor authentication (OTP)
- Change password every 90 days

**System Implementation:**
- Passwords hashed with bcrypt
- Never logged or displayed
- Minimum requirements enforced
- Automatic session timeout (30 min)

### 10.2 API Security

**Backend Protection:**
- JWT validation on every request
- Role checking on all endpoints
- Input validation and sanitization
- SQL injection prevention (Supabase ORM)
- Rate limiting on auth attempts

**Example Protected Endpoint:**
```javascript
router.post('/maintenance/approve',
  authMiddleware,           // Verify JWT
  roleMiddleware(['inspector', 'admin']),  // Check role
  approvalController.approve  // Process
);
```

### 10.3 Data Validation

- Frontend validation for UX
- Backend validation for security
- Type checking on all inputs
- Whitelist allowed values

### 10.4 Secrets Management

- API keys: Stored in environment variables
- Never committed to git
- Different keys for dev/prod
- Rotation schedule: Every 90 days

---

## 11. Compliance & Standards

### 11.1 Aviation Standards Alignment

- ✅ **IATA Standards**: Maintenance record retention
- ✅ **ICAO Standards**: Data integrity requirements
- ✅ **DGCA Rules**: Indian aviation audit trail requirements
- ✅ **GDPR Ready**: Data processing transparency

### 11.2 Audit Trail Compliance

- ✅ Immutable records (cannot be altered after creation)
- ✅ Timestamped entries (accurate to second)
- ✅ Digital signatures (proof of authenticity)
- ✅ User identification (who performed action)
- ✅ Retention policy (automatic archival)

---

## 12. Incident Response

### 12.1 Security Incidents

**Suspected Breach:**
1. Immediately revoke affected JWT tokens
2. Force password reset for affected users
3. Generate incident report from audit logs
4. Notify admin/security team
5. Review recent changes for tampering

**Failed Authentication Attempts:**
- Track by IP address
- Alert if > 5 failures in 1 hour
- Temporary account lockout (15 minutes)
- Security email to user

### 12.2 Audit Log Review

Regular reviews (weekly):
- Suspicious activity patterns
- Unusual access times
- Failed authorization attempts
- Bulk data operations
- Permission changes

---

## 13. Security Features Checklist

### Implemented ✅
- [x] Role-based access control
- [x] JWT authentication
- [x] Password hashing (bcrypt)
- [x] Comprehensive audit logging
- [x] Digital signatures (SHA-256)
- [x] OTP verification support
- [x] Multi-airline isolation
- [x] Session management
- [x] Row-Level Security (database)
- [x] Input validation
- [x] Rate limiting
- [x] Activity detection

### Future Enhancements 🔮
- [ ] Hardware USB token authentication
- [ ] Biometric verification
- [ ] SAML/SSO integration
- [ ] End-to-end encryption
- [ ] Advanced anomaly detection
- [ ] Blockchain for critical records

---

## 14. Security Testing

### Penetration Testing Areas
1. SQL Injection attempts (ORM prevents)
2. Cross-Site Scripting (XSS) (SCA sanitization)
3. Cross-Site Request Forgery (CSRF) (Session tokens)
4. Broken Authentication (JWT validation)
5. Insecure Direct Object References (RLS policies)

### Automated Checks
- Dependency vulnerability scanning
- Code security linting
- Secret detection in commits
- TLS certificate monitoring

---

## 15. Support & Contact

**Security Issues**: Report to admin@airline.system  
**Incident Response**: Immediate investigation  
**Regular Audits**: Monthly security reviews  

---

**End of Security Architecture Document**


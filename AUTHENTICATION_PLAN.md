# Authentication Plan

## Flow
1. **Access Portal**: User opens the portal.
2. **Initial Login**: User logs in with email and password.
3. **Verification**: Supabase Auth verifies the user's credentials.
4. **MFA (Optional)**: Application prompts for OTP verification.
5. **Role Retrieval**: The user's specific role (`Pilot`, `AME`, `Inspector`, `Admin`, etc.) is fetched from the database.
6. **Access Granted**: Subsequent access and capabilities within the system are granted based strictly on this role.

## Technologies Used
- **Supabase**: Primary authentication and JWT token handling.
- **bcrypt**: Password hashing and verification.
- [Future] **Hardware Tokens**: Integration with USB Digital Keys for high-security actions.

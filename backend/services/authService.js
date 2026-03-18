// Authentication service
class AuthService {
    async verifyCredentials(email, password) {
        // Use bcrypt and supabase auth verification logic here
    }

    async generateJWT(user) {
        // Return JWT
    }
}

module.exports = new AuthService();

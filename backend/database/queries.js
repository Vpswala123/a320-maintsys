// Helper queries
const queries = {
    getUserByEmail: "SELECT * FROM users WHERE email = $1",
    getTasksByAircraft: "SELECT * FROM maintenance_tasks WHERE aircraft_id = $1"
    // Add additional base queries here
};

module.exports = queries;

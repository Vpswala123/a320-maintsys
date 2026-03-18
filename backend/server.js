require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const flightRoutes = require('./routes/flightRoutes');
const defectRoutes = require('./routes/defectRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// API Endpoints
app.use('/auth', authRoutes);
app.use('/flightlog', flightRoutes);
app.use('/defect', defectRoutes);
app.use('/maintenance', maintenanceRoutes);
app.use('/approval', approvalRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'A320 Maintenance Backend is running properly' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

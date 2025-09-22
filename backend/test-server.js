// backend/test-server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString() 
  });
});

// Mock auth endpoint for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock successful login
  res.json({
    message: 'Login successful',
    token: 'mock-jwt-token-' + Date.now(),
    user: {
      id: '1',
      username: 'admin',
      email: email,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    }
  });
});

// Mock dashboard data
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    students: { total: 1284, active: 1240 },
    incidents: { today: 23, pending: 7 },
    cameras: { total: 20, active: 18 },
    violations: { active: 7 }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test Backend running on http://localhost:${PORT}`);
});
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// In-memory storage (replace with actual database)
let users = [
  {
    id: '1',
    email: 'admin@assettracker.com',
    password: bcrypt.hashSync('password123', 10),
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

let assets = [
  {
    id: '1',
    name: 'Downtown Apartment Complex',
    type: 'Apartment',
    status: 'Active',
    condition: 'Good',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    details: {
      bedrooms: 50,
      bathrooms: 50,
      squareFeet: 45000
    },
    currentPhase: 'Active',
    priority: 'High',
    inspectionStatus: 'Up to Date',
    lastInspection: '2024-06-15',
    nextInspection: '2024-12-15',
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-07-15T14:20:00.000Z'
  },
  {
    id: '2',
    name: 'Suburban Family Home',
    type: 'House',
    status: 'Active',
    condition: 'Fair',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210'
    },
    details: {
      bedrooms: 4,
      bathrooms: 3,
      squareFeet: 2500
    },
    currentPhase: 'Maintenance',
    priority: 'Medium',
    inspectionStatus: 'Due Soon',
    lastInspection: '2024-04-10',
    nextInspection: '2024-08-10',
    createdAt: '2024-02-20T08:15:00.000Z',
    updatedAt: '2024-07-10T11:45:00.000Z'
  }
];

let tasks = [
  {
    id: '1',
    title: 'Annual HVAC Maintenance',
    description: 'Perform comprehensive HVAC system maintenance and inspection',
    assetId: '1',
    assetName: 'Downtown Apartment Complex',
    type: 'Maintenance',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'John Smith',
    dueDate: '2024-08-15',
    dueTime: '10:00',
    frequency: 'Annual',
    notifications: {
      email: true,
      sms: false
    },
    createdAt: '2024-07-01T09:00:00.000Z',
    updatedAt: '2024-07-15T16:30:00.000Z'
  },
  {
    id: '2',
    title: 'Roof Inspection',
    description: 'Inspect roof for any damage or wear',
    assetId: '2',
    assetName: 'Suburban Family Home',
    type: 'Inspection',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: 'Jane Doe',
    dueDate: '2024-08-20',
    dueTime: '14:00',
    frequency: 'Bi-Annual',
    notifications: {
      email: true,
      sms: true
    },
    createdAt: '2024-07-05T11:30:00.000Z',
    updatedAt: '2024-07-05T11:30:00.000Z'
  }
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Assets Routes
app.get('/api/assets', authenticateToken, (req, res) => {
  try {
    const { type, status, condition, search, page = 1, limit = 10 } = req.query;
    
    let filteredAssets = [...assets];
    
    if (type) filteredAssets = filteredAssets.filter(a => a.type === type);
    if (status) filteredAssets = filteredAssets.filter(a => a.status === status);
    if (condition) filteredAssets = filteredAssets.filter(a => a.condition === condition);
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAssets = filteredAssets.filter(a => 
        a.name.toLowerCase().includes(searchLower) ||
        a.address.street.toLowerCase().includes(searchLower) ||
        a.address.city.toLowerCase().includes(searchLower)
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

    res.json({
      assets: paginatedAssets,
      total: filteredAssets.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredAssets.length / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assets', error: error.message });
  }
});

app.get('/api/assets/:id', authenticateToken, (req, res) => {
  try {
    const asset = assets.find(a => a.id === req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch asset', error: error.message });
  }
});

app.post('/api/assets', authenticateToken, (req, res) => {
  try {
    const newAsset = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    assets.push(newAsset);
    res.status(201).json(newAsset);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create asset', error: error.message });
  }
});

app.put('/api/assets/:id', authenticateToken, (req, res) => {
  try {
    const index = assets.findIndex(a => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    assets[index] = {
      ...assets[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json(assets[index]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update asset', error: error.message });
  }
});

app.delete('/api/assets/:id', authenticateToken, (req, res) => {
  try {
    const index = assets.findIndex(a => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    assets.splice(index, 1);
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete asset', error: error.message });
  }
});

// Tasks Routes
app.get('/api/tasks', authenticateToken, (req, res) => {
  try {
    const { assetId, type, status, priority, search, page = 1, limit = 10 } = req.query;
    
    let filteredTasks = [...tasks];
    
    if (assetId) filteredTasks = filteredTasks.filter(t => t.assetId === assetId);
    if (type) filteredTasks = filteredTasks.filter(t => t.type === type);
    if (status) filteredTasks = filteredTasks.filter(t => t.status === status);
    if (priority) filteredTasks = filteredTasks.filter(t => t.priority === priority);
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTasks = filteredTasks.filter(t => 
        t.title.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower)
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    res.json({
      tasks: paginatedTasks,
      total: filteredTasks.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredTasks.length / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
});

app.get('/api/tasks/:id', authenticateToken, (req, res) => {
  try {
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch task', error: error.message });
  }
});

app.post('/api/tasks', authenticateToken, (req, res) => {
  try {
    const newTask = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
});

app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  try {
    const index = tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    tasks[index] = {
      ...tasks[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json(tasks[index]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  try {
    const index = tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    tasks.splice(index, 1);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
});

// Dashboard Stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  try {
    const stats = {
      totalAssets: assets.length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'Completed').length,
      pendingTasks: tasks.filter(t => t.status === 'Pending').length,
      assetsInGoodCondition: assets.filter(a => a.condition === 'Good').length,
      assetsNeedingMaintenance: assets.filter(a => a.condition === 'Needs Repairs' || a.condition === 'Critical').length
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Asset Tracker API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
// Simple API server without external dependencies for quick testing
import http from 'http';
import url from 'url';
import querystring from 'querystring';

const PORT = 3001;

// In-memory data storage
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
    createdAt: '2024-01-15T10:30:00.000Z'
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
    createdAt: '2024-02-20T08:15:00.000Z'
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
    notifications: { email: true, sms: false },
    createdAt: '2024-07-01T09:00:00.000Z'
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
    notifications: { email: true, sms: true },
    createdAt: '2024-07-05T11:30:00.000Z'
  }
];

// Utility functions
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJSON(res, data, statusCode = 200) {
  setCORSHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    try {
      callback(null, JSON.parse(body));
    } catch (e) {
      callback(e, null);
    }
  });
}

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    setCORSHeaders(res);
    res.writeHead(200);
    res.end();
    return;
  }

  // Route handlers
  if (pathname === '/api/health') {
    sendJSON(res, { status: 'OK', timestamp: new Date().toISOString() });
    return;
  }

  // Simple auth - just return a mock token
  if (pathname === '/api/auth/login' && method === 'POST') {
    parseBody(req, (err, data) => {
      if (err) {
        sendJSON(res, { message: 'Invalid JSON' }, 400);
        return;
      }
      
      if (data.email === 'admin@assettracker.com' && data.password === 'password123') {
        sendJSON(res, {
          token: 'mock-jwt-token-123',
          user: {
            id: '1',
            email: 'admin@assettracker.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin'
          }
        });
      } else {
        sendJSON(res, { message: 'Invalid credentials' }, 401);
      }
    });
    return;
  }

  // Assets endpoints
  if (pathname === '/api/assets' && method === 'GET') {
    sendJSON(res, { assets, total: assets.length });
    return;
  }

  if (pathname.startsWith('/api/assets/') && method === 'GET') {
    const id = pathname.split('/')[3];
    const asset = assets.find(a => a.id === id);
    if (asset) {
      sendJSON(res, asset);
    } else {
      sendJSON(res, { message: 'Asset not found' }, 404);
    }
    return;
  }

  if (pathname === '/api/assets' && method === 'POST') {
    parseBody(req, (err, data) => {
      if (err) {
        sendJSON(res, { message: 'Invalid JSON' }, 400);
        return;
      }
      
      const newAsset = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString()
      };
      assets.push(newAsset);
      sendJSON(res, newAsset, 201);
    });
    return;
  }

  // Tasks endpoints
  if (pathname === '/api/tasks' && method === 'GET') {
    sendJSON(res, { tasks, total: tasks.length });
    return;
  }

  if (pathname.startsWith('/api/tasks/') && method === 'GET') {
    const id = pathname.split('/')[3];
    const task = tasks.find(t => t.id === id);
    if (task) {
      sendJSON(res, task);
    } else {
      sendJSON(res, { message: 'Task not found' }, 404);
    }
    return;
  }

  if (pathname === '/api/tasks' && method === 'POST') {
    parseBody(req, (err, data) => {
      if (err) {
        sendJSON(res, { message: 'Invalid JSON' }, 400);
        return;
      }
      
      const newTask = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString()
      };
      tasks.push(newTask);
      sendJSON(res, newTask, 201);
    });
    return;
  }

  // Dashboard stats
  if (pathname === '/api/dashboard/stats' && method === 'GET') {
    const stats = {
      totalAssets: assets.length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'Completed').length,
      pendingTasks: tasks.filter(t => t.status === 'Pending').length,
      assetsInGoodCondition: assets.filter(a => a.condition === 'Good').length,
      assetsNeedingMaintenance: assets.filter(a => a.condition === 'Needs Repairs' || a.condition === 'Critical').length
    };
    sendJSON(res, stats);
    return;
  }

  // 404 for unmatched routes
  sendJSON(res, { message: 'Endpoint not found' }, 404);
});

server.listen(PORT, () => {
  console.log(`🚀 Asset Tracker API Server running on port ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Test login: admin@assettracker.com / password123`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
  });
});
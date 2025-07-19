# API Documentation - Asset Tracker

## Base URL
```
Development: http://localhost:3001/api
Production: https://api.assettracker.com/api
```

## Authentication

All API endpoints (except authentication routes) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Authentication Flow
1. User registers/logs in
2. Server returns JWT token
3. Client stores token securely
4. Client includes token in subsequent requests

---

## Authentication Endpoints

### Register User
Creates a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "owner",
      "createdAt": "2025-07-17T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already exists"
  }
}
```

### Login User
Authenticates an existing user.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "owner",
      "lastLogin": "2025-07-17T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Forgot Password
Initiates password reset process.

**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password
Resets user password with token.

**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## Asset Management Endpoints

### Get All Assets
Retrieves all assets for the authenticated user.

**Endpoint:** `GET /assets`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term
- `status` (optional): Filter by status
- `type` (optional): Filter by type
- `condition` (optional): Filter by condition
- `sort` (optional): Sort field (default: createdAt)
- `order` (optional): Sort order (asc/desc, default: desc)

**Example Request:**
```
GET /assets?page=1&limit=10&status=Active&sort=name&order=asc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "id": 1,
        "name": "Los Palmas Apartment",
        "type": "Apartment",
        "status": "Active",
        "condition": "Good",
        "address": {
          "street": "Off Boundary Road",
          "city": "Los Palmas",
          "state": "California",
          "zipCode": "90210"
        },
        "details": {
          "bedrooms": 4,
          "bathrooms": 3,
          "floors": 2,
          "balcony": true,
          "features": ["Spacious", "Modern appliances"]
        },
        "images": [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg"
        ],
        "inspectionStatus": "Scheduled for Inspection",
        "nextInspection": "2025-08-01T09:00:00Z",
        "createdAt": "2025-06-01T10:00:00Z",
        "updatedAt": "2025-07-17T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Get Asset by ID
Retrieves a specific asset by ID.

**Endpoint:** `GET /assets/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "asset": {
      "id": 1,
      "name": "Los Palmas Apartment",
      // ... full asset object
    }
  }
}
```

### Create Asset
Creates a new asset.

**Endpoint:** `POST /assets`

**Request Body:**
```json
{
  "name": "New Property",
  "type": "House",
  "status": "Active",
  "condition": "Good",
  "address": {
    "street": "123 Main Street",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701"
  },
  "details": {
    "bedrooms": 3,
    "bathrooms": 2,
    "floors": 1,
    "balcony": false,
    "features": ["Garden", "Garage"]
  },
  "inspectionDate": "2025-08-15T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "asset": {
      "id": 26,
      "name": "New Property",
      // ... full asset object with generated fields
    }
  }
}
```

### Update Asset
Updates an existing asset.

**Endpoint:** `PUT /assets/:id`

**Request Body:**
```json
{
  "name": "Updated Property Name",
  "condition": "Needs Repairs",
  "details": {
    "bedrooms": 4,
    "bathrooms": 3
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "asset": {
      "id": 1,
      "name": "Updated Property Name",
      // ... updated asset object
    }
  }
}
```

### Delete Asset
Deletes an asset.

**Endpoint:** `DELETE /assets/:id`

**Response:**
```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

### Upload Asset Images
Uploads images for an asset.

**Endpoint:** `POST /assets/:id/images`

**Request Body:** FormData with image files

**Response:**
```json
{
  "success": true,
  "data": {
    "images": [
      "https://example.com/uploaded-image1.jpg",
      "https://example.com/uploaded-image2.jpg"
    ]
  }
}
```

---

## Task Management Endpoints

### Get All Tasks
Retrieves all tasks for the authenticated user.

**Endpoint:** `GET /tasks`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `assetId` (optional): Filter by asset ID
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `dueDate` (optional): Filter by due date range

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 1,
        "title": "Roof Inspection",
        "description": "Annual roof inspection and maintenance",
        "assetId": 1,
        "assetName": "Los Palmas Apartment",
        "type": "Inspection",
        "status": "Pending",
        "priority": "High",
        "dueDate": "2025-08-01T09:00:00Z",
        "assignedTo": "John Doe",
        "createdAt": "2025-07-17T10:00:00Z",
        "updatedAt": "2025-07-17T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### Create Task
Creates a new task.

**Endpoint:** `POST /tasks`

**Request Body:**
```json
{
  "title": "Kitchen Renovation",
  "description": "Complete kitchen renovation including appliances",
  "assetId": 1,
  "type": "Maintenance",
  "priority": "Medium",
  "dueDate": "2025-09-15T10:00:00Z",
  "assignedTo": "Jane Smith",
  "notifications": {
    "email": true,
    "sms": false,
    "inApp": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 46,
      "title": "Kitchen Renovation",
      "status": "Pending",
      // ... full task object
    }
  }
}
```

### Update Task
Updates an existing task.

**Endpoint:** `PUT /tasks/:id`

**Request Body:**
```json
{
  "status": "In Progress",
  "priority": "High",
  "notes": "Started work on cabinets"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "status": "In Progress",
      // ... updated task object
    }
  }
}
```

### Delete Task
Deletes a task.

**Endpoint:** `DELETE /tasks/:id`

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## Calendar Endpoints

### Get Calendar Events
Retrieves calendar events for a date range.

**Endpoint:** `GET /calendar/events`

**Query Parameters:**
- `start`: Start date (ISO 8601)
- `end`: End date (ISO 8601)
- `type`: Event type filter (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": 1,
        "title": "Roof Inspection",
        "description": "Annual roof inspection",
        "start": "2025-08-01T09:00:00Z",
        "end": "2025-08-01T11:00:00Z",
        "type": "inspection",
        "assetId": 1,
        "taskId": 1,
        "color": "#3B82F6"
      }
    ]
  }
}
```

### Create Calendar Event
Creates a new calendar event.

**Endpoint:** `POST /calendar/events`

**Request Body:**
```json
{
  "title": "Property Showing",
  "description": "Show property to potential tenant",
  "start": "2025-08-05T14:00:00Z",
  "end": "2025-08-05T15:00:00Z",
  "type": "appointment",
  "assetId": 1
}
```

---

## Dashboard Endpoints

### Get Dashboard Stats
Retrieves dashboard statistics.

**Endpoint:** `GET /dashboard/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalAssets": 25,
      "activeAssets": 20,
      "underMaintenance": 3,
      "decommissioned": 2,
      "tasksToday": 10,
      "overdueTasks": 15,
      "flaggedItems": 0,
      "upcomingInspections": 5
    }
  }
}
```

### Get Recent Activities
Retrieves recent activities feed.

**Endpoint:** `GET /dashboard/activities`

**Query Parameters:**
- `limit` (optional): Number of activities (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": 1,
        "type": "asset_created",
        "message": "New asset 'Downtown Condo' was created",
        "assetId": 26,
        "userId": 1,
        "timestamp": "2025-07-17T10:00:00Z"
      },
      {
        "id": 2,
        "type": "task_completed",
        "message": "Task 'Plumbing Inspection' was completed",
        "taskId": 15,
        "assetId": 3,
        "userId": 1,
        "timestamp": "2025-07-17T09:30:00Z"
      }
    ]
  }
}
```

---

## User Management Endpoints

### Get User Profile
Retrieves current user profile.

**Endpoint:** `GET /user/profile`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "owner",
      "avatar": "https://example.com/avatar.jpg",
      "preferences": {
        "theme": "dark",
        "notifications": {
          "email": true,
          "sms": false,
          "inApp": true
        },
        "language": "en"
      },
      "createdAt": "2025-01-01T00:00:00Z",
      "lastLogin": "2025-07-17T10:00:00Z"
    }
  }
}
```

### Update User Profile
Updates user profile information.

**Endpoint:** `PUT /user/profile`

**Request Body:**
```json
{
  "name": "John Smith",
  "preferences": {
    "theme": "light",
    "notifications": {
      "email": false,
      "sms": true,
      "inApp": true
    }
  }
}
```

### Change Password
Changes user password.

**Endpoint:** `POST /user/change-password`

**Request Body:**
```json
{
  "currentPassword": "currentPassword123",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## Error Handling

### Error Response Format
All API endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |

### Example Error Responses

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Email is required",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

**Authentication Error:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Asset endpoints**: 100 requests per minute
- **Task endpoints**: 100 requests per minute
- **Dashboard endpoints**: 50 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1658923200
```

---

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (starting from 1)
- `limit`: Items per page (max 100)

Pagination information is included in responses:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## API Versioning

The API uses URL versioning:
- Current version: `/api/v1/`
- Future versions: `/api/v2/`, `/api/v3/`, etc.

---

## Testing

### Postman Collection
A Postman collection is available for testing all endpoints:
- [Download Postman Collection](./postman_collection.json)

### Authentication for Testing
1. Use the login endpoint to get a token
2. Set the token in the Authorization header for subsequent requests
3. Token expires in 24 hours (development) / 1 hour (production)

---

## Support

For API support or questions:
- Email: api-support@assettracker.com
- Documentation: https://docs.assettracker.com
- Status Page: https://status.assettracker.com
# Kadan - API Documentation

## 1. Overview

### 1.1 Base URL
```
Production: https://api.kadan.com/api/v1
Development: http://localhost:8080/api/v1
```

### 1.2 Authentication
All API requests (except public endpoints) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### 1.3 Content Type
```
Content-Type: application/json
Accept: application/json
```

### 1.4 API Versioning
API version is included in the URL path (`/api/v1/`). Major version changes indicate breaking changes.

### 1.5 Common Response Codes
| Code | Description           |
|------|-----------------------|
| 200  | Success               |
| 201  | Created               |
| 204  | No Content            |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 422  | Unprocessable Entity  |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |

### 1.6 Pagination
List endpoints support pagination:
```
GET /api/v1/expenses?page=0&size=20&sort=createdAt,desc
```

Response includes pagination metadata:
```json
{
  "content": ["..."],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  }
}
```

---

## 2. Authentication APIs

### 2.1 Register User
Create a new user account.

**Endpoint:** `POST /auth/register`

**Authentication:** None

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "email": "john@example.com",
  "displayName": "John Doe",
  "status": "PENDING_VERIFICATION",
  "createdAt": "2026-01-14T10:30:00Z"
}
```

**Error Responses:**
- `400` - Validation error (invalid email, weak password)
- `409` - Username or email already exists

---

### 2.2 Login
Authenticate user and obtain tokens.

**Endpoint:** `POST /auth/login`

**Authentication:** None

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "displayName": "John Doe"
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `403` - Account not verified or suspended

---

### 2.3 Refresh Token
Obtain new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Authentication:** None

**Request Body:**
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "bmV3IHJlZnJlc2ggdG9rZW4...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

**Error Responses:**
- `401` - Invalid or expired refresh token

---

### 2.4 Logout
Invalidate current session tokens.

**Endpoint:** `POST /auth/logout`

**Authentication:** Required

**Request Body:**
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

**Response:** `204 No Content`

---

### 2.5 Request Password Reset
Initiate password reset flow.

**Endpoint:** `POST /auth/password/reset-request`

**Authentication:** None

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset email sent if account exists"
}
```

---

### 2.6 Reset Password
Complete password reset with token.

**Endpoint:** `POST /auth/password/reset`

**Authentication:** None

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass456!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successful"
}
```

**Error Responses:**
- `400` - Invalid or expired token
- `422` - Password does not meet requirements

---

### 2.7 Change Password
Change password for authenticated user.

**Endpoint:** `POST /auth/password/change`

**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400` - Current password incorrect
- `422` - New password does not meet requirements

---

## 3. User APIs

### 3.1 Get Current User Profile
Retrieve authenticated user's profile.

**Endpoint:** `GET /users/me`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "email": "john@example.com",
  "displayName": "John Doe",
  "defaultCurrency": "INR",
  "status": "ACTIVE",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-14T10:30:00Z"
}
```

---

### 3.2 Update Current User Profile
Update authenticated user's profile.

**Endpoint:** `PATCH /users/me`

**Authentication:** Required

**Request Body:**
```json
{
  "displayName": "John D.",
  "email": "john@mail.com",
  "defaultCurrency": "USD"
}
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "email": "john@example.com",
  "displayName": "John D.",
  "defaultCurrency": "USD",
  "updatedAt": "2026-01-14T10:35:00Z"
}
```

---

### 3.3 Search Users
Search users by username or email (for adding to groups).

**Endpoint:** `GET /users/search`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |  
|-----------|------|----------|-------------|  
| q | string | Yes | Search query (min 3 chars) |  
| limit | int | No | Max results (default: 10, max: 50) |  

**Example:** `GET /users/search?q=john&limit=10`

**Response:** `200 OK`
```json
{
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_doe",
      "displayName": "John Doe",
      "avatarUrl": "https://cdn.kadan.com/avatars/john.jpg"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "username": "johnny123",
      "displayName": "Johnny Smith",
      "avatarUrl": null
    }
  ]
}
```

---

### 3.4 Get User by ID
Retrieve user details by ID (limited info for non-contacts).

**Endpoint:** `GET /users/{userId}`

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | UUID | User identifier |

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "displayName": "John Doe"
}
```

---

### 3.5 Get User's Overall Balance
Get aggregated balance across all groups.

**Endpoint:** `GET /users/me/balance`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "totalOwed": 1500.00,
  "totalOwing": 750.50,
  "netBalance": 749.50,
  "currency": "INR",
  "balancesByUser": [
    {
      "user": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "username": "jane_doe",
        "displayName": "Jane Doe"
      },
      "amount": 500.00,
      "direction": "OWED_TO_YOU"
    },
    {
      "user": {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "username": "bob_smith",
        "displayName": "Bob Smith"
      },
      "amount": 250.50,
      "direction": "YOU_OWE"
    }
  ]
}
```

---

## 4. Group APIs

### 4.1 Create Group
Create a new expense group.

**Endpoint:** `POST /groups`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Trip to Goa",
  "description": "Beach vacation expenses",
  "currency": "INR",
  "simplifyDebts": true,
  "memberIds": [
    "660e8400-e29b-41d4-a716-446655440001",
    "770e8400-e29b-41d4-a716-446655440002"
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "Trip to Goa",
  "description": "Beach vacation expenses",
  "currency": "INR",
  "simplifyDebts": true,
  "status": "ACTIVE",
  "createdBy": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe"
  },
  "createdAt": "2026-01-14T10:30:00Z"
}
```

**Error Responses:**
- `400` - Validation error
- `404` - One or more member IDs not found

---

### 4.2 Get All Groups
Retrieve all groups for authenticated user.

**Endpoint:** `GET /groups`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status (ACTIVE, ARCHIVED) |
| page | int | No | Page number (default: 0) |
| size | int | No | Page size (default: 20) |
| sort | string | No | Sort field (default: updatedAt,desc) |

**Example:** `GET /groups?status=ACTIVE&page=0&size=10`

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "Trip to Goa",
      "description": "Beach vacation expenses",
      "currency": "INR",
      "imageUrl": null,
      "status": "ACTIVE",
      "memberCount": 3,
      "totalExpenses": 15000.00,
      "userBalance": 2500.00,
      "updatedAt": "2026-01-14T10:30:00Z"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 5,
    "totalPages": 1
  }
}
```

---

### 4.3 Get Group by ID
Retrieve group details.

**Endpoint:** `GET /groups/{groupId}`

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| groupId | UUID | Group identifier |

**Response:** `200 OK`
```json
{
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "Trip to Goa",
    "description": "Beach vacation expenses",
    "currency": "INR",
    "simplifyDebts": true,
    "status": "ACTIVE",
    "createdBy": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "john_doe",
        "displayName": "John Doe"
    },
    "createdAt": "2026-01-14T10:30:00Z",
    "updatedAt": "2026-01-14T10:30:00Z",
    "totalExpenses": 15000.00,
    "memberCount": 3
}
```

**Error Responses:**
- `403` - User is not a member of this group
- `404` - Group not found

---

### 4.4 Update Group
Update group details.

**Endpoint:** `PATCH /groups/{groupId}`

**Authentication:** Required (OWNER or ADMIN)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| groupId | UUID | Group identifier |

**Request Body:**
```json
{
  "name": "Goa Trip 2026",
  "description": "Beach vacation with friends",
  "simplifyDebts": false
}
```

**Response:** `200 OK`
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "Goa Trip 2026",
  "description": "Beach vacation with friends",
  "simplifyDebts": false,
  "updatedAt": "2026-01-14T11:00:00Z"
}
```

**Error Responses:**
- `403` - Insufficient permissions

---

### 4.5 Delete Group
Delete a group (soft delete).

**Endpoint:** `DELETE /groups/{groupId}`

**Authentication:** Required (OWNER only)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| groupId | UUID | Group identifier |

**Response:** `204 No Content`

**Error Responses:**
- `403` - Only owner can delete group
- `409` - Cannot delete group with unsettled balances

---

## 5. Group Member APIs

### 5.1 Get Group Members
Retrieve all members of a group.

**Endpoint:** `GET /groups/{groupId}/members`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "members": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_doe",
      "displayName": "John Doe",
      "avatarUrl": "https://cdn.kadan.com/avatars/john.jpg",
      "role": "OWNER",
      "joinedAt": "2026-01-14T10:30:00Z",
      "balance": 2500.00
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "username": "jane_doe",
      "displayName": "Jane Doe",
      "avatarUrl": null,
      "role": "MEMBER",
      "joinedAt": "2026-01-14T10:30:00Z",
      "balance": -1500.00
    }
  ]
}
```

---

### 5.2 Add Member to Group
Add a new member to the group.

**Endpoint:** `POST /groups/{groupId}/members`

**Authentication:** Required (OWNER or ADMIN)

**Request Body:**
```json
{
  "userId": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Response:** `201 Created`
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "username": "bob_smith",
  "displayName": "Bob Smith",
  "role": "MEMBER",
  "joinedAt": "2026-01-14T11:00:00Z"
}
```

**Error Responses:**
- `403` - Insufficient permissions
- `404` - User not found
- `409` - User already a member

---

### 5.3 Remove Member from Group
Remove a member from the group.

**Endpoint:** `DELETE /groups/{groupId}/members/{userId}`

**Authentication:** Required (OWNER or ADMIN)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| groupId | UUID | Group identifier |
| userId | UUID | User to remove |

**Response:** `204 No Content`

**Error Responses:**
- `403` - Cannot remove owner / Insufficient permissions
- `409` - Member has unsettled balance

---

### 5.4 Leave Group
Remove self from group.

**Endpoint:** `POST /groups/{groupId}/leave`

**Authentication:** Required

**Response:** `204 No Content`

**Error Responses:**
- `403` - Owner cannot leave (must transfer ownership first)
- `409` - User has unsettled balance

---

### 5.5 Update Member Role
Change a member's role in the group.

**Endpoint:** `PATCH /groups/{groupId}/members/{userId}/role`

**Authentication:** Required (OWNER only)

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

**Response:** `200 OK`
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "username": "jane_doe",
  "role": "ADMIN",
  "updatedAt": "2026-01-14T11:00:00Z"
}
```

---

### 5.6 Transfer Ownership
Transfer group ownership to another member.

**Endpoint:** `POST /groups/{groupId}/transfer-ownership`

**Authentication:** Required (OWNER only)

**Request Body:**
```json
{
  "newOwnerId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response:** `200 OK`
```json
{
  "message": "Ownership transferred successfully",
  "newOwner": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "username": "jane_doe"
  }
}
```

---

## 6. Expense APIs

### 6.1 Create Expense
Add a new expense to a group.

**Endpoint:** `POST /groups/{groupId}/expenses`

**Authentication:** Required

**Request Body:**
```json
{
  "amount": 3000.00,
  "currency": "INR",
  "description": "Dinner at Beach Shack",
  "categoryId": "990e8400-e29b-41d4-a716-446655440010",
  "paidBy": "550e8400-e29b-41d4-a716-446655440000",
  "expenseDate": "2026-01-14",
  "notes": "Seafood dinner for everyone",
  "splitType": "EQUAL",
  "splits": [
    { "userId": "550e8400-e29b-41d4-a716-446655440000" },
    { "userId": "660e8400-e29b-41d4-a716-446655440001" },
    { "userId": "770e8400-e29b-41d4-a716-446655440002" }
  ]
}
```

**Alternative - Percentage Split:**
```json
{
  "amount": 3000.00,
  "description": "Hotel Room",
  "paidBy": "550e8400-e29b-41d4-a716-446655440000",
  "expenseDate": "2026-01-14",
  "splitType": "PERCENTAGE",
  "splits": [
    { "userId": "550e8400-e29b-41d4-a716-446655440000", "percentage": 50 },
    { "userId": "660e8400-e29b-41d4-a716-446655440001", "percentage": 30 },
    { "userId": "770e8400-e29b-41d4-a716-446655440002", "percentage": 20 }
  ]
}
```

**Alternative - Exact Amount Split:**
```json
{
  "amount": 3000.00,
  "description": "Shopping",
  "paidBy": "550e8400-e29b-41d4-a716-446655440000",
  "expenseDate": "2026-01-14",
  "splitType": "EXACT",
  "splits": [
    { "userId": "550e8400-e29b-41d4-a716-446655440000", "amount": 1500.00 },
    { "userId": "660e8400-e29b-41d4-a716-446655440001", "amount": 1000.00 },
    { "userId": "770e8400-e29b-41d4-a716-446655440002", "amount": 500.00 }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440020",
  "groupId": "880e8400-e29b-41d4-a716-446655440003",
  "amount": 3000.00,
  "currency": "INR",
  "description": "Dinner at Beach Shack",
  "category": {
    "id": "990e8400-e29b-41d4-a716-446655440010",
    "name": "Food & Drink",
    "icon": "🍕"
  },
  "paidBy": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "displayName": "John Doe"
  },
  "expenseDate": "2026-01-14",
  "notes": "Seafood dinner for everyone",
  "receiptUrl": null,
  "splitType": "EQUAL",
  "splits": [
    {
      "user": { "id": "550e8400-e29b-41d4-a716-446655440000", "username": "john_doe" },
      "amount": 1000.00,
      "percentage": 33.33
    },
    {
      "user": { "id": "660e8400-e29b-41d4-a716-446655440001", "username": "jane_doe" },
      "amount": 1000.00,
      "percentage": 33.33
    },
    {
      "user": { "id": "770e8400-e29b-41d4-a716-446655440002", "username": "bob_smith" },
      "amount": 1000.00,
      "percentage": 33.34
    }
  ],
  "createdBy": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe"
  },
  "createdAt": "2026-01-14T12:00:00Z",
  "status": "ACTIVE"
}
```

**Error Responses:**
- `400` - Validation error (splits don't sum to total, etc.)
- `403` - User not a member of group
- `404` - Group or payer not found

---

### 6.2 Get All Expenses in Group
Retrieve expenses for a group.

**Endpoint:** `GET /groups/{groupId}/expenses`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | No | Filter from date |
| endDate | date | No | Filter to date |
| categoryId | UUID | No | Filter by category |
| paidBy | UUID | No | Filter by payer |
| page | int | No | Page number |
| size | int | No | Page size |
| sort | string | No | Sort field |

**Example:** `GET /groups/{groupId}/expenses?startDate=2026-01-01&categoryId=990e8400-e29b-41d4-a716-446655440010`

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440020",
      "amount": 3000.00,
      "currency": "INR",
      "description": "Dinner at Beach Shack",
      "category": { "id": "990e8400...", "name": "Food & Drink", "icon": "🍕" },
      "paidBy": { "id": "550e8400...", "username": "john_doe" },
      "expenseDate": "2026-01-14",
      "splitType": "EQUAL",
      "participantCount": 3,
      "userShare": 1000.00,
      "createdAt": "2026-01-14T12:00:00Z"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 15,
    "totalPages": 1
  },
  "summary": {
    "totalExpenses": 15000.00,
    "userPaid": 8000.00,
    "userOwes": 5000.00
  }
}
```

---

### 6.3 Get Expense by ID
Retrieve expense details.

**Endpoint:** `GET /groups/{groupId}/expenses/{expenseId}`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440020",
  "groupId": "880e8400-e29b-41d4-a716-446655440003",
  "amount": 3000.00,
  "currency": "INR",
  "description": "Dinner at Beach Shack",
  "category": {
    "id": "990e8400-e29b-41d4-a716-446655440010",
    "name": "Food & Drink",
    "icon": "🍕"
  },
  "paidBy": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "displayName": "John Doe"
  },
  "expenseDate": "2026-01-14",
  "notes": "Seafood dinner for everyone",
  "receiptUrl": null,
  "splitType": "EQUAL",
  "splits": [
    {
      "user": { "id": "550e8400...", "username": "john_doe", "displayName": "John Doe" },
      "amount": 1000.00,
      "percentage": 33.33,
      "isSettled": false
    }
  ],
  "createdBy": { "id": "550e8400...", "username": "john_doe" },
  "createdAt": "2026-01-14T12:00:00Z",
  "updatedAt": "2026-01-14T12:00:00Z",
  "status": "ACTIVE"
}
```

---

### 6.4 Update Expense
Modify an existing expense.

**Endpoint:** `PUT /groups/{groupId}/expenses/{expenseId}`

**Authentication:** Required (Creator, ADMIN, or OWNER)

**Request Body:**
```json
{
  "amount": 3500.00,
  "description": "Dinner at Beach Shack (updated)",
  "categoryId": "990e8400-e29b-41d4-a716-446655440010",
  "paidBy": "550e8400-e29b-41d4-a716-446655440000",
  "expenseDate": "2026-01-14",
  "notes": "Added drinks to the bill",
  "splitType": "EQUAL",
  "splits": [
    { "userId": "550e8400-e29b-41d4-a716-446655440000" },
    { "userId": "660e8400-e29b-41d4-a716-446655440001" },
    { "userId": "770e8400-e29b-41d4-a716-446655440002" }
  ]
}
```

**Response:** `200 OK`
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440020",
  "amount": 3500.00,
  "description": "Dinner at Beach Shack (updated)",
  "updatedAt": "2026-01-14T13:00:00Z"
}
```

---

### 6.5 Delete Expense
Soft delete an expense.

**Endpoint:** `DELETE /groups/{groupId}/expenses/{expenseId}`

**Authentication:** Required (Creator, ADMIN, or OWNER)

**Response:** `204 No Content`

---

## 7. Balance APIs

### 7.1 Get Group Balances
Get all balances within a group.

**Endpoint:** `GET /groups/{groupId}/balances`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "groupId": "880e8400-e29b-41d4-a716-446655440003",
  "currentUser": { "id": "550e8400...", "username": "john_doe" },
  "memberBalances": [
    {
      "user": { "id": "550e8400...", "username": "john_doe", "displayName": "John Doe" },
      "totalPaid": 8000.00,
      "totalOwed": 5000.00,
      "netBalance": 3000.00
    },
    {
      "user": { "id": "660e8400...", "username": "jane_doe", "displayName": "Jane Doe" },
      "totalPaid": 4000.00,
      "totalOwed": 5000.00,
      "netBalance": -1000.00
    },
    {
      "user": { "id": "770e8400...", "username": "bob_smith", "displayName": "Bob Smith" },
      "totalPaid": 3000.00,
      "totalOwed": 5000.00,
      "netBalance": -2000.00
    }
  ],
  "simplifiedDebts": [
    {
      "from": { "id": "660e8400...", "username": "jane_doe" },
      "to": { "id": "550e8400...", "username": "john_doe" },
      "amount": 1000.00
    },
    {
      "from": { "id": "770e8400...", "username": "bob_smith" },
      "to": { "id": "550e8400...", "username": "john_doe" },
      "amount": 2000.00
    }
  ]
}
```

---

### 7.2 Get Pairwise Balance
Get balance between two specific users in a group.

**Endpoint:** `GET /groups/{groupId}/balances/users/{userId}`

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| groupId | UUID | Group identifier |
| userId | UUID | Other user's ID |

**Response:** `200 OK`
```json
{
  "groupId": "880e8400-e29b-41d4-a716-446655440003",
  "currentUser": { "id": "550e8400...", "username": "john_doe" },
  "otherUser": { "id": "660e8400...", "username": "jane_doe" },
  "balance": 1000.00,
  "direction": "OWED_TO_YOU",
  "expenses": [
    {
      "id": "aa0e8400...",
      "description": "Dinner",
      "amount": 3000.00,
      "paidBy": "john_doe",
      "userShare": 1000.00,
      "date": "2026-01-14"
    }
  ]
}
```

---

## 8. Settlement APIs

### 8.1 Create Settlement
Record a payment between users.

**Endpoint:** `POST /groups/{groupId}/settlements`

**Authentication:** Required

**Request Body:**
```json
{
  "payeeId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 1000.00,
  "settlementDate": "2026-01-14",
  "paymentMethod": "UPI",
  "notes": "Paid via Google Pay"
}
```

**Response:** `201 Created`
```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440030",
  "groupId": "880e8400-e29b-41d4-a716-446655440003",
  "payer": { "id": "660e8400...", "username": "jane_doe" },
  "payee": { "id": "550e8400...", "username": "john_doe" },
  "amount": 1000.00,
  "currency": "INR",
  "settlementDate": "2026-01-14",
  "paymentMethod": "UPI",
  "notes": "Paid via Google Pay",
  "status": "PENDING",
  "createdAt": "2026-01-14T14:00:00Z"
}
```

---

### 8.2 Get Settlements in Group
Retrieve settlement history.

**Endpoint:** `GET /groups/{groupId}/settlements`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status (PENDING, CONFIRMED, REJECTED) |
| page | int | No | Page number |
| size | int | No | Page size |

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440030",
      "payer": { "id": "660e8400...", "username": "jane_doe" },
      "payee": { "id": "550e8400...", "username": "john_doe" },
      "amount": 1000.00,
      "settlementDate": "2026-01-14",
      "paymentMethod": "UPI",
      "status": "CONFIRMED",
      "createdAt": "2026-01-14T14:00:00Z"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 5,
    "totalPages": 1
  }
}
```

---

### 8.3 Get Settlement by ID
Retrieve settlement details.

**Endpoint:** `GET /groups/{groupId}/settlements/{settlementId}`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440030",
  "groupId": "880e8400-e29b-41d4-a716-446655440003",
  "payer": { "id": "660e8400...", "username": "jane_doe", "displayName": "Jane Doe" },
  "payee": { "id": "550e8400...", "username": "john_doe", "displayName": "John Doe" },
  "amount": 1000.00,
  "currency": "INR",
  "settlementDate": "2026-01-14",
  "paymentMethod": "UPI",
  "notes": "Paid via Google Pay",
  "status": "PENDING",
  "createdAt": "2026-01-14T14:00:00Z",
  "confirmedAt": null
}
```

---

## 9. Activity APIs

### 9.1 Get Group Activity
Retrieve activity feed for a group.

**Endpoint:** `GET /groups/{groupId}/activities`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | No | Filter by activity type |
| page | int | No | Page number |
| size | int | No | Page size |

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440040",
      "type": "EXPENSE_CREATED",
      "actor": { "id": "550e8400...", "username": "john_doe" },
      "description": "John Doe added \"Dinner at Beach Shack\" (₹3,000.00)",
      "metadata": {
        "expenseId": "aa0e8400...",
        "amount": 3000.00
      },
      "createdAt": "2026-01-14T12:00:00Z"
    },
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440041",
      "type": "MEMBER_ADDED",
      "actor": { "id": "550e8400...", "username": "john_doe" },
      "description": "John Doe added Bob Smith to the group",
      "metadata": {
        "memberId": "770e8400..."
      },
      "createdAt": "2026-01-14T10:30:00Z"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 25,
    "totalPages": 2
  }
}
```

---

### 9.2 Get User Activity
Retrieve activity feed for current user across all groups.

**Endpoint:** `GET /users/me/activities`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| groupId | UUID | No | Filter by group |
| type | string | No | Filter by activity type |
| page | int | No | Page number |
| size | int | No | Page size |

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440040",
      "type": "EXPENSE_CREATED",
      "group": { "id": "880e8400...", "name": "Trip to Goa" },
      "actor": { "id": "660e8400...", "username": "jane_doe" },
      "description": "Jane Doe added \"Taxi to Airport\" (₹500.00)",
      "createdAt": "2026-01-14T16:00:00Z"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 50,
    "totalPages": 3
  }
}
```

---

## 10. Health & Utility APIs

### 10.1 Health Check
Check API health status.

**Endpoint:** `GET /health`

**Authentication:** None

**Response:** `200 OK`
```json
{
  "status": "UP",
  "timestamp": "2026-01-14T10:00:00Z",
  "components": {
    "database": "UP",
    "redis": "UP"
  }
}
```

---

### 10.2 Get Supported Currencies
Retrieve list of supported currencies.

**Endpoint:** `GET /currencies`

**Authentication:** None

**Response:** `200 OK`
```json
{
  "currencies": [
    { "code": "INR", "name": "Indian Rupee", "symbol": "₹" },
    { "code": "USD", "name": "US Dollar", "symbol": "$" },
    { "code": "EUR", "name": "Euro", "symbol": "€" },
    { "code": "GBP", "name": "British Pound", "symbol": "£" },
    { "code": "AUD", "name": "Australian Dollar", "symbol": "A$" },
    { "code": "CAD", "name": "Canadian Dollar", "symbol": "C$" },
    { "code": "SGD", "name": "Singapore Dollar", "symbol": "S$" },
    { "code": "AED", "name": "UAE Dirham", "symbol": "د.إ" }
  ]
}
```

---

## 11. Error Response Format

All error responses follow this format:

```json
{
  "timestamp": "2026-01-14T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": [
    {
      "field": "amount",
      "message": "must be greater than 0"
    },
    {
      "field": "splits",
      "message": "split amounts must sum to total expense amount"
    }
  ],
  "path": "/api/v1/groups/880e8400.../expenses",
  "traceId": "abc123xyz789"
}
```

---

## 12. Rate Limiting Headers

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067260
```

When rate limit is exceeded:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

---

## Appendix A: API Endpoint Summary

| Method             | Endpoint                                     | Description                 |
|--------------------|----------------------------------------------|-----------------------------|
| **Authentication** |                                              |                             |
| POST               | /auth/register                               | Register new user           |
| POST               | /auth/login                                  | User login                  |
| POST               | /auth/refresh                                | Refresh tokens              |
| POST               | /auth/logout                                 | User logout                 |
| POST               | /auth/password/reset-request                 | Request password reset      |
| POST               | /auth/password/reset                         | Reset password              |
| POST               | /auth/password/change                        | Change password             |
| **Users**          |                                              |                             |
| GET                | /users/me                                    | Get current user profile    |
| PATCH              | /users/me                                    | Update current user profile |
| GET                | /users/search                                | Search users                |
| GET                | /users/{userId}                              | Get user by ID              |
| GET                | /users/me/balance                            | Get overall balance         |
| GET                | /users/me/activities                         | Get user activity           |
| **Groups**         |                                              |                             |
| POST               | /groups                                      | Create group                |
| GET                | /groups                                      | Get all groups              |
| GET                | /groups/{groupId}                            | Get group by ID             |
| PATCH              | /groups/{groupId}                            | Update group                |
| DELETE             | /groups/{groupId}                            | Delete group                |
| **Group Members**  |                                              |                             |
| GET                | /groups/{groupId}/members                    | Get members                 |
| POST               | /groups/{groupId}/members                    | Add member                  |
| DELETE             | /groups/{groupId}/members/{userId}           | Remove member               |
| POST               | /groups/{groupId}/leave                      | Leave group                 |
| PATCH              | /groups/{groupId}/members/{userId}/role      | Update member role          |
| POST               | /groups/{groupId}/transfer-ownership         | Transfer ownership          |
| **Expenses**       |                                              |                             |
| POST               | /groups/{groupId}/expenses                   | Create expense              |
| GET                | /groups/{groupId}/expenses                   | Get expenses                |
| GET                | /groups/{groupId}/expenses/{expenseId}       | Get expense by ID           |
| PUT                | /groups/{groupId}/expenses/{expenseId}       | Update expense              |
| DELETE             | /groups/{groupId}/expenses/{expenseId}       | Delete expense              |
| **Balances**       |                                              |                             |
| GET                | /groups/{groupId}/balances                   | Get group balances          |
| GET                | /groups/{groupId}/balances/users/{userId}    | Get pairwise balance        |
| **Settlements**    |                                              |                             |
| POST               | /groups/{groupId}/settlements                | Create settlement           |
| GET                | /groups/{groupId}/settlements                | Get settlements             |
| GET                | /groups/{groupId}/settlements/{settlementId} | Get settlement by ID        |
| **Activities**     |                                              |                             |
| GET                | /groups/{groupId}/activities                 | Get group activity          |
| **Utility**        |                                              |                             |
| GET                | /health                                      | Health check                |
| GET                | /currencies                                  | Get supported currencies    |

---

*Document Version: 1.0*
*Last Updated: January 14, 2026*

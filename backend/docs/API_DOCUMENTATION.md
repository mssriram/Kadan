# Kadan - API Documentation

## 1. Overview

### 1.1 Base URL
```
Production: https://api.kadan.com/api
Development: http://localhost:8080/api
```

### 1.2 Authentication
All API requests (except public endpoints under `/api/public/**`) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### 1.3 Content Type
```
Content-Type: application/json
Accept: application/json
```

### 1.4 Common Response Codes
| Code | Description           |
|------|-----------------------|
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 500  | Internal Server Error |

---

## 2. Authentication APIs

### 2.1 Register User
Create a new user account.

**Endpoint:** `POST /api/public/register`

**Authentication:** None (Public endpoint)

**Request Body:**
```json
{
  "email": "john@example.com",
  "displayName": "John Doe",
  "password": "SecurePass123!"
}
```

**Field Validations:**

| Field       | Type   | Required | Validation                   |
|-------------|--------|----------|------------------------------|
| email       | string | Yes      | Must be a valid email format |
| displayName | string | Yes      | Maximum 100 characters       |
| password    | string | Yes      | Minimum 8 characters         |

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "displayName": "John Doe",
  "defaultCurrency": "INR",
  "status": "ACTIVE"
}
```

**Response Fields:**

| Field           | Type          | Description                             |
|-----------------|---------------|-----------------------------------------|
| id              | string (UUID) | Unique user identifier                  |
| email           | string        | User's email address                    |
| displayName     | string        | User's display name                     |
| defaultCurrency | string        | User's default currency (3-letter code) |
| status          | enum          | User status: `ACTIVE`, `INACTIVE`       |

**Error Responses:**
- `400` - Validation error (invalid email, password too short)

---

### 2.2 Login
Authenticate user and obtain JWT token.

**Endpoint:** `POST /api/public/login`

**Authentication:** None (Public endpoint)

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Field Validations:**

| Field    | Type   | Required | Validation      |
|----------|--------|----------|-----------------|
| email    | string | Yes      | Cannot be blank |
| password | string | Yes      | Cannot be blank |

**Response:** `200 OK`

The response body is empty. The JWT token is returned in the `Authorization` response header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Error Responses:**
- `401` - Invalid credentials

---

## 3. User APIs

### 3.1 Get Current User Profile
Retrieve authenticated user's profile.

**Endpoint:** `GET /api/users/me`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "displayName": "John Doe",
  "defaultCurrency": "INR",
  "status": "ACTIVE"
}
```

**Response Fields:**

| Field           | Type          | Description                             |
|-----------------|---------------|-----------------------------------------|
| id              | string (UUID) | Unique user identifier                  |
| email           | string        | User's email address                    |
| displayName     | string        | User's display name                     |
| defaultCurrency | string        | User's default currency (3-letter code) |
| status          | enum          | User status: `ACTIVE`, `INACTIVE`       |

---

### 3.2 Update Current User Profile
Update authenticated user's profile.

**Endpoint:** `PATCH /api/users/me`

**Authentication:** Required

**Request Body:**
```json
{
  "email": "john.updated@example.com",
  "displayName": "John D.",
  "defaultCurrency": "USD"
}
```

**Field Validations:**

| Field           | Type   | Required | Validation                               |
|-----------------|--------|----------|------------------------------------------|
| email           | string | No       | Must be a valid email format             |
| displayName     | string | No       | Maximum 100 characters                   |
| defaultCurrency | string | No       | Exactly 3 characters (ISO currency code) |

**Note:** All fields are optional. Only provided fields will be updated.

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.updated@example.com",
  "displayName": "John D.",
  "defaultCurrency": "USD",
  "status": "ACTIVE"
}
```

---

### 3.3 Get User by ID
Retrieve user details by ID.

**Endpoint:** `GET /api/users/{userId}`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "displayName": "John Doe",
  "defaultCurrency": "INR",
  "status": "ACTIVE"
}
```

**Error Responses:**
- `404` - User not found

---

## 4. Group APIs

### 4.1 Create Group
Create a new expense group.

**Endpoint:** `POST /api/groups`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Trip to Goa",
  "description": "Beach vacation expenses",
  "currency": "INR",
  "simplifyDebts": true,
  "members": [
    "sriram@mail.com",
    "vishal@mail.com"
  ]
}
```

**Field Validations:**

| Field         | Type             | Required | Validation                          |
|---------------|------------------|----------|-------------------------------------|
| name          | string           | Yes      | Cannot be blank, max 100 characters |
| description   | string           | No       | Optional description                |
| currency      | string           | No       | 3-letter ISO currency code          |
| simplifyDebts | boolean          | Yes      | Cannot be null                      |
| members       | array of strings | No       | List of emails to add as members    |

**Response:** `201 Created`
```json
{
  "groupId": "880e8400-e29b-41d4-a716-446655440003",
  "name": "Trip to Goa",
  "description": "Beach vacation expenses",
  "currency": "INR",
  "simplifyDebts": true,
  "createdBy": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "displayName": "John Doe",
    "defaultCurrency": "INR",
    "status": "ACTIVE"
  }
}
```

**Response Fields:**

| Field         | Type    | Description                                |
|---------------|---------|--------------------------------------------|
| groupId       | UUID    | Unique group identifier                    |
| name          | string  | Group name                                 |
| description   | string  | Group description                          |
| currency      | string  | Group's default currency                   |
| simplifyDebts | boolean | Whether to simplify debts within the group |
| createdBy     | object  | User profile of the group creator          |

**Error Responses:**
- `400` - Validation error
- `404` - One or more member IDs not found

---

### 4.2 Get All Groups
Retrieve all groups for authenticated user.

**Endpoint:** `GET /api/groups`

**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "Trip to Goa",
    "description": "Beach vacation expenses",
    "currency": "INR",
    "created_by": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "displayName": "John Doe",
      "defaultCurrency": "INR",
      "status": "ACTIVE"
    },
    "members": []
  }
]
```

**Error Responses:**
- `404` - User is not a member of this group
- `404` - Group not found

---

**Response Fields (per group):**

| Field       | Type   | Description                                |
|-------------|--------|--------------------------------------------|
| id          | UUID   | Group identifier                           |
| name        | string | Group name                                 |
| description | string | Group description                          |
| currency    | string | Group's default currency                   |
| created_by  | object | User profile of the group creator          |
| members     | array  | List of group members (empty in list view) |

---

### 4.3 Get Group by ID
Retrieve group details including all members.

**Endpoint:** `GET /api/groups/{groupId}`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "Trip to Goa",
  "description": "Beach vacation expenses",
  "currency": "INR",
  "created_by": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "displayName": "John Doe",
    "defaultCurrency": "INR",
    "status": "ACTIVE"
  },
  "members": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "displayName": "John Doe",
      "defaultCurrency": "INR",
      "status": "ACTIVE"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "email": "jane@example.com",
      "displayName": "Jane Doe",
      "defaultCurrency": "INR",
      "status": "ACTIVE"
    }
  ]
}
```

**Error Responses:**
- `404` - User is not a member of this group
- `404` - Group not found

---

### 4.4 Update Group
Update group details.

**Endpoint:** `PUT /api/groups/{groupId}`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Goa Trip 2026",
  "description": "Beach vacation with friends",
  "simplifyDebts": false,
  "currency": "USD"
}
```

**Field Validations:**

| Field         | Type    | Required | Validation                            |
|---------------|---------|----------|---------------------------------------|
| name          | string  | No       | Optional new group name               |
| description   | string  | No       | Optional new description              |
| simplifyDebts | boolean | No       | Optional flag for debt simplification |
| currency      | string  | No       | 3-letter ISO currency code            |

**Note:** All fields are optional. Only provided fields will be updated.

**Response:** `200 OK`
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "Goa Trip 2026",
  "description": "Beach vacation with friends",
  "currency": "USD",
  "created_by": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "displayName": "John Doe",
    "defaultCurrency": "INR",
    "status": "ACTIVE"
  },
  "members": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "displayName": "John Doe",
      "defaultCurrency": "INR",
      "status": "ACTIVE"
    }
  ]
}
```

---

### 4.5 Delete Group
Delete a group.

**Endpoint:** `DELETE /api/groups/{groupId}`

**Authentication:** Required

**Response:** `200 OK`

**Error Responses:**
- `404` - Group not found

---

### 4.6 Add Member to Group
Add a member to an existing group.

**Endpoint:** `PUT /api/groups/{groupId}/members/{memberId}`

**Authentication:** Required

**Response:** `200 OK`

**Error Responses:**
- `404` - Group or user not found

---

### 4.7 Remove Member from Group
Remove a member from a group.

**Endpoint:** `DELETE /api/groups/{groupId}/members/{memberId}`

**Authentication:** Required

**Response:** `200 OK`

**Error Responses:**
- `404` - Group or member not found
- `409` - Cannot remove member with unsettled balance

---

## 5. Expense APIs

### 5.1 Create Expense
Add a new expense to a group.

**Endpoint:** `POST /api/groups/{groupId}/expenses`

**Authentication:** Required

**Request Body:**
```json
{
  "amount": 3000.00,
  "date": "01-14-2026",
  "currency": "INR",
  "description": "Dinner at Beach Shack",
  "paidBy": "550e8400-e29b-41d4-a716-446655440000",
  "splitType": "EQUAL",
  "members": [
    { "id": "550e8400-e29b-41d4-a716-446655440000" },
    { "id": "660e8400-e29b-41d4-a716-446655440001" },
    { "id": "770e8400-e29b-41d4-a716-446655440002" }
  ]
}
```

**Split Type Details:**

**EQUAL Split:**
```json
{
  "splitType": "EQUAL",
  "members": [
    { "id": "user-id-1" },
    { "id": "user-id-2" },
    { "id": "user-id-3" }
  ]
}
```
Amount is divided equally among all members. The `share` field is ignored.

**EXACT Split:**
```json
{
  "splitType": "EXACT",
  "members": [
    { "id": "user-id-1", "share": 1500.00 },
    { "id": "user-id-2", "share": 1000.00 },
    { "id": "user-id-3", "share": 500.00 }
  ]
}
```
The `share` field specifies the exact amount each member owes. Sum of shares must equal the total amount.

**PERCENTAGE Split:**
```json
{
  "splitType": "PERCENTAGE",
  "members": [
    { "id": "user-id-1", "share": 50 },
    { "id": "user-id-2", "share": 30 },
    { "id": "user-id-3", "share": 20 }
  ]
}
```
The `share` field specifies the percentage each member owes. Percentages must sum to 100.

**Field Validations:**

| Field       | Type    | Required | Validation                                |
|-------------|---------|----------|-------------------------------------------|
| amount      | decimal | Yes      | Must be >= 0                              |
| date        | string  | Yes      | Format: `MM-dd-uuuu` (e.g., "01-14-2026") |
| currency    | string  | No       | 3-letter ISO currency code                |
| description | string  | No       | 1-500 characters                          |
| paidBy      | UUID    | Yes      | ID of the user who paid                   |
| splitType   | enum    | Yes      | `EQUAL`, `EXACT`, or `PERCENTAGE`         |
| members     | array   | Yes      | At least one member required              |

**Member Object Fields:**

| Field | Type    | Required    | Validation                                                  |
|-------|---------|-------------|-------------------------------------------------------------|
| id    | UUID    | Yes         | User ID                                                     |
| share | decimal | Conditional | Required for EXACT and PERCENTAGE split types; must be >= 0 |

**Response:** `200 OK`

**Error Responses:**
- `400` - Validation error (splits don't sum to total, invalid date format, etc.)
- `403` - User not a member of group
- `404` - Group or payer not found

---

### 5.2 Get All Expenses in Group
Retrieve all expenses for a group.

**Endpoint:** `GET /api/groups/{groupId}/expenses`

**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": "aa0e8400-e29b-41d4-a716-446655440020",
    "currency": "INR",
    "description": "Dinner at Beach Shack",
    "amount": 3000.00,
    "date": "2026-01-14",
    "splitType": "EQUAL",
    "paidBy": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "displayName": "John Doe",
      "defaultCurrency": "INR",
      "status": "ACTIVE"
    },
    "shares": [
      {
        "id": "bb0e8400-e29b-41d4-a716-446655440030",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "amount": 1000.00,
        "isSettled": false
      },
      {
        "id": "bb0e8400-e29b-41d4-a716-446655440031",
        "user_id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Jane Doe",
        "amount": 1000.00,
        "isSettled": false
      },
      {
        "id": "bb0e8400-e29b-41d4-a716-446655440032",
        "user_id": "770e8400-e29b-41d4-a716-446655440002",
        "name": "Bob Smith",
        "amount": 1000.00,
        "isSettled": false
      }
    ],
    "createdAt": "2026-01-14T12:00:00Z",
    "updatedAt": "2026-01-14T12:00:00Z"
  }
]
```

**Response Fields (per expense):**

| Field       | Type     | Description                       |
|-------------|----------|-----------------------------------|
| id          | UUID     | Expense identifier                |
| currency    | string   | Currency code                     |
| description | string   | Expense description               |
| amount      | decimal  | Total expense amount              |
| date        | string   | Expense date (YYYY-MM-DD format)  |
| splitType   | enum     | `EQUAL`, `EXACT`, or `PERCENTAGE` |
| paidBy      | object   | User who paid for the expense     |
| shares      | array    | List of expense splits per member |
| createdAt   | datetime | When the expense was created      |
| updatedAt   | datetime | When the expense was last updated |

**Share Object Fields:**

| Field     | Type    | Description                         |
|-----------|---------|-------------------------------------|
| id        | UUID    | Split identifier                    |
| user_id   | UUID    | User ID                             |
| name      | string  | User's display name                 |
| amount    | decimal | Amount owed by this user            |
| isSettled | boolean | Whether this share has been settled |

---

### 5.3 Get Expense by ID
Retrieve expense details.

**Endpoint:** `GET /api/groups/{groupId}/expenses/{expenseId}`

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| groupId | UUID | Group identifier |
| expenseId | UUID | Expense identifier |

**Response:** `200 OK`
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440020",
  "currency": "INR",
  "description": "Dinner at Beach Shack",
  "amount": 3000.00,
  "date": "2026-01-14",
  "splitType": "EQUAL",
  "paidBy": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "displayName": "John Doe",
    "defaultCurrency": "INR",
    "status": "ACTIVE"
  },
  "shares": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440030",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "amount": 1000.00,
      "isSettled": false
    }
  ],
  "createdAt": "2026-01-14T12:00:00Z",
  "updatedAt": "2026-01-14T12:00:00Z"
}
```

**Error Responses:**
- `404` - Expense or group not found

---

### 5.4 Update Expense
Modify an existing expense.

**Endpoint:** `PATCH /api/groups/{groupId}/expenses/{expenseId}`

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| groupId | UUID | Group identifier |
| expenseId | UUID | Expense identifier |

**Request Body:**
```json
{
  "amount": 3500.00,
  "date": "01-14-2026",
  "currency": "INR",
  "description": "Dinner at Beach Shack (updated)",
  "paidBy": "550e8400-e29b-41d4-a716-446655440000",
  "splitType": "EQUAL",
  "members": [
    { "id": "550e8400-e29b-41d4-a716-446655440000" },
    { "id": "660e8400-e29b-41d4-a716-446655440001" },
    { "id": "770e8400-e29b-41d4-a716-446655440002" }
  ]
}
```

**Field Validations:**

| Field       | Type    | Required | Validation                        |
|-------------|---------|----------|-----------------------------------|
| amount      | decimal | No       | Must be >= 0                      |
| date        | string  | No       | Format: `MM-dd-uuuu`              |
| currency    | string  | No       | 3-letter ISO currency code        |
| description | string  | No       | 1-500 characters                  |
| paidBy      | UUID    | No       | ID of the user who paid           |
| splitType   | enum    | No       | `EQUAL`, `EXACT`, or `PERCENTAGE` |
| members     | array   | No       | List of member splits             |

**Note:** All fields are optional. Only provided fields will be updated. If updating splits, provide the complete new split configuration which includes splitType and members.

**Response:** `200 OK`

**Error Responses:**
- `400` - Validation error
- `404` - Expense or group not found

---

### 5.5 Delete Expense
Delete an expense.

**Endpoint:** `DELETE /api/groups/{groupId}/expenses/{expenseId}`

**Authentication:** Required

**Response:** `200 OK`

**Error Responses:**
- `404` - Expense or group not found

---

## 6. Balance APIs

### 6.1 Get Group Balances
Get all balances and debts within a group.

**Endpoint:** `GET /api/groups/{groupId}/balances`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "balances": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "paid": 8000.00,
      "owed": 5000.00,
      "netBalance": 3000.00
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Jane Doe",
      "paid": 4000.00,
      "owed": 5000.00,
      "netBalance": -1000.00
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Bob Smith",
      "paid": 3000.00,
      "owed": 5000.00,
      "netBalance": -2000.00
    }
  ],
  "debts": [
    {
      "debtor": "660e8400-e29b-41d4-a716-446655440001",
      "creditor": "550e8400-e29b-41d4-a716-446655440000",
      "amount": 1000.00
    },
    {
      "debtor": "770e8400-e29b-41d4-a716-446655440002",
      "creditor": "550e8400-e29b-41d4-a716-446655440000",
      "amount": 2000.00
    }
  ]
}
```

**Balance Object Fields:**

| Field      | Type    | Description                                                |
|------------|---------|------------------------------------------------------------|
| id         | UUID    | User identifier                                            |
| name       | string  | User's display name                                        |
| paid       | decimal | Total amount paid by this user                             |
| owed       | decimal | Total amount owed by this user                             |
| netBalance | decimal | Net balance (positive = owed to them, negative = they owe) |

**Debt Object Fields:**

| Field    | Type    | Description                          |
|----------|---------|--------------------------------------|
| debtor   | UUID    | User ID of the person who owes money |
| creditor | UUID    | User ID of the person owed money     |
| amount   | decimal | Amount owed                          |

**Error Responses:**
- `404` - Group not found

---

## 7. Settlement APIs

### 7.1 Record Settlement
Record a payment/settlement between users in a group.

**Endpoint:** `POST /api/groups/{groupId}/settlement`

**Authentication:** Required

**Request Body:**
```json
{
  "creditor_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 1000.00,
  "currency": "INR"
}
```

**Field Validations:**

| Field       | Type    | Required | Validation                           |
|-------------|---------|----------|--------------------------------------|
| creditor_id | UUID    | Yes      | ID of the user receiving the payment |
| amount      | decimal | Yes      | Must be >= 0                         |
| currency    | string  | No       | 3-letter ISO currency code           |

**Note:** The authenticated user is automatically recorded as the debtor (person making the payment).

**Response:** `200 OK`
```json
{
  "id": "cc0e8400-e29b-41d4-a716-446655440040",
  "amount": 1000.00,
  "currency": "INR",
  "date": "2026-01-14",
  "creditor": "550e8400-e29b-41d4-a716-446655440000",
  "debtor": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response Fields:**

| Field    | Type    | Description                         |
|----------|---------|-------------------------------------|
| id       | UUID    | Settlement identifier               |
| amount   | decimal | Settlement amount                   |
| currency | string  | Currency code                       |
| date     | string  | Settlement date (YYYY-MM-DD format) |
| creditor | UUID    | User ID receiving the payment       |
| debtor   | UUID    | User ID making the payment          |

**Error Responses:**
- `400` - Validation error
- `404` - User not a member of group
- `404` - Group or creditor not found

---

## Appendix A: API Endpoint Summary

| Method             | Endpoint                                     | Description                 | Auth Required |
|--------------------|----------------------------------------------|-----------------------------|---------------|
| **Authentication** |                                              |                             |               |
| POST               | `/api/public/register`                       | Register new user           | No            |
| POST               | `/api/public/login`                          | User login                  | No            |
| **Users**          |                                              |                             |               |
| GET                | `/api/users/me`                              | Get current user profile    | Yes           |
| PUT                | `/api/users/me`                              | Update current user profile | Yes           |
| GET                | `/api/users/{userId}`                        | Get user by ID              | Yes           |
| **Groups**         |                                              |                             |               |
| POST               | `/api/groups`                                | Create group                | Yes           |
| GET                | `/api/groups`                                | Get all groups              | Yes           |
| GET                | `/api/groups/{groupId}`                      | Get group by ID             | Yes           |
| PUT                | `/api/groups/{groupId}`                      | Update group                | Yes           |
| DELETE             | `/api/groups/{groupId}`                      | Delete group                | Yes           |
| PUT                | `/api/groups/{groupId}/members/{memberId}`   | Add member to group         | Yes           |
| DELETE             | `/api/groups/{groupId}/members/{memberId}`   | Remove member from group    | Yes           |
| **Expenses**       |                                              |                             |               |
| POST               | `/api/groups/{groupId}/expenses`             | Create expense              | Yes           |
| GET                | `/api/groups/{groupId}/expenses`             | Get all expenses in group   | Yes           |
| GET                | `/api/groups/{groupId}/expenses/{expenseId}` | Get expense by ID           | Yes           |
| PATCH              | `/api/groups/{groupId}/expenses/{expenseId}` | Update expense              | Yes           |
| DELETE             | `/api/groups/{groupId}/expenses/{expenseId}` | Delete expense              | Yes           |
| **Balances**       |                                              |                             |               |
| GET                | `/api/groups/{groupId}/balances`             | Get group balances          | Yes           |
| **Settlements**    |                                              |                             |               |
| POST               | `/api/groups/{groupId}/settlement`           | Record settlement           | Yes           |

---

*Document Version: 2.0*  
*Last Updated: January 24, 2026*

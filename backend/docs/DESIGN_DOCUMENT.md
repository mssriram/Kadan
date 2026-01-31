# Kadan - Design Document

## 1. Overview

### 1.1 Introduction
Kadan is a web-based expense tracking and splitting application that enables users to manage shared expenses among friends and groups. Similar to Splitwise, it allows users to record expenses, split costs in various ways, track balances, and settle debts efficiently.

### 1.2 Purpose
This document provides a comprehensive design specification for the Kadan backend application, detailing functional requirements, system architecture, security considerations, and implementation guidelines as reflected by the current codebase.

### 1.3 Scope
The application covers:
- User management (registration, authentication, profile management)
- Group management (creation, modification, member management)
- Expense management (creation, modification, deletion, splitting)
- Balance computation and settlement recording

### 1.4 Technology Stack
| Component | Technology |
|-----------|------------|
| Backend Framework | Spring Boot (Java 17+) |
| Authentication | JWT-based Authentication (stateless) |
| Primary Database | PostgreSQL |
| Caching Layer | Redis (optional, for session management and caching) |
| API Style | RESTful |
| Documentation | OpenAPI 3.0 / Swagger (docs maintained separately) |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────┐                              ┌─────────────────┐
│   Client Apps   │─────────────────────────────▶│  Spring Boot    │
│  (Web/Mobile)   │                              │   Application   │
└─────────────────┘                              └─────────────────┘
                                                        │
                                                        ▼
                                                ┌───────────────┐
                                                │  PostgreSQL   │
                                                │   (Primary)   │
                                                └───────────────┘
```

---

## 3. User Management

### 3.1 User Registration

#### 3.1.1 Registration Flow
1. User submits registration request with email, display name, and password
2. System validates input data:
   - Email: valid email format, unique
   - Display name: required, max 100 characters
   - Password: minimum 8 characters
3. System hashes password using BCrypt
4. System creates user record in database

#### 3.1.2 User Profile Data
| Field            | Type      | Constraints           | Description                |
|------------------|-----------|-----------------------|----------------------------|
| id               | UUID      | Primary Key           | Internal unique identifier |
| email            | String    | Unique, Valid format  | User email address         |
| password_hash    | String    | Not Null              | Hashed password            |
| display_name     | String    | 1-100 chars           | Friendly display name      |
| default_currency | String    | 3 chars, Default: INR | Preferred currency         |
| created_at       | Timestamp | Auto-generated        | Account creation time      |
| updated_at       | Timestamp | Auto-updated          | Last modification time     |
| status           | Enum      | ACTIVE, INACTIVE      | Account status             |

### 3.2 Authentication

#### 3.2.1 Login Flow
1. User submits credentials (email + password)
2. System verifies provided password against stored hash
3. On success, system generates a JWT:
   - Access Token: 4 hours, contains user id as subject
4. Token is returned in the `Authorization` response header (`Bearer <token>`)
5. Subsequent requests include the access token in the `Authorization` header

#### 3.2.2 JWT Token Structure
```json
{
  "iss": "Kadan",
  "sub": "user_uuid",
  "iat": 1704067200,
  "exp": 1704070800
}
```

### 3.3 Password Management

#### 3.3.1 Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
- Cannot be same as previous 5 passwords
- Cannot contain username or email

### 3.4 User Permissions

#### 3.4.1 Global Roles
The system defines `USER`, `OWNER`, `MEMBER`, and `ADMIN` roles in enums, but authorization is enforced primarily by membership checks rather than role-based access in the current implementation.

---

## 4. Group Management

### 4.1 Group Creation

#### 4.1.1 Creation Flow
1. Authenticated user initiates group creation
2. System validates input:
   - Name: required, max 100 characters
   - Simplify debts: required boolean
   - Currency: 3-letter ISO code (optional)
   - Members: list of member emails (optional)
3. Group is created with status `ACTIVE`
4. Creator is assigned as `OWNER`
5. Members found by email are added as `MEMBER`

#### 4.1.2 Group Data Structure
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Unique group identifier |
| name | String | 1-100 chars, Required | Group display name |
| description | String | Optional | Group description |
| currency | String | 3 chars, Default: DB default | Group currency |
| created_by | UUID | Foreign Key | Creator user ID |
| created_at | Timestamp | Auto-generated | Creation time |
| updated_at | Timestamp | Auto-updated | Last update time |
| status | Enum | ACTIVE, DELETED | Group status |
| simplify_debts | Boolean | Required | Debt simplification flag |

### 4.2 Member Management

#### 4.2.1 Adding Members
1. Any group member can add another user by userId
2. System validates:
   - Requester is a member
   - User exists
   - User not already a member
3. Member is added with `MEMBER` role

#### 4.2.2 Removing Members
1. Any group member can initiate removal
2. System validates:
   - Both requester and target are members
   - Group has more than one member
   - Target member has zero balance
3. Member removed from group

#### 4.2.3 Leaving Group
Leaving is performed via member removal (no separate endpoint).

### 4.3 Group Settings

#### 4.3.1 Editable Settings
- Group name
- Group description
- Default currency
- Simplify debts toggle

#### 4.3.2 Group Deletion
- Groups are hard deleted
- Any member can delete a group
- Group must have zero balances before deletion

---

## 5. Expense Management

### 5.1 Expense Creation

#### 5.1.1 Creation Flow
1. Member initiates expense creation in a group
2. System validates:
   - User is a group member
   - Amount is positive and has max 2 decimal places
   - Payer is a group member
   - All split participants are group members
   - Split amounts/percentages sum correctly
3. Expense is created
4. Expense splits are created

#### 5.1.2 Expense Data Structure
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Unique expense identifier |
| group_id | UUID | Foreign Key | Associated group |
| amount | Decimal | Positive, 2 decimal places | Total expense amount |
| currency | String | 3 chars | Expense currency |
| description | String | 1-500 chars | Expense description |
| paid_by | UUID | Foreign Key | User who paid |
| expense_date | Date | Required | When expense occurred (MM-dd-yyyy) |
| created_by | UUID | Foreign Key | User who created record |
| created_at | Timestamp | Auto-generated | Record creation time |
| updated_at | Timestamp | Auto-updated | Last update time |

### 5.2 Expense Splitting

#### 5.2.1 Split Types

**Equal Split**
- Total amount divided equally among selected participants
- Handles rounding by assigning remainder to the payer

**Percentage Split**
- Each participant assigned a percentage
- Percentages must sum to 100%
- Amount calculated: $\frac{percentage}{100} \times total$

**Exact Amount Split**
- Each participant assigned specific amount
- Amounts must sum to total expense
- Useful for itemized expenses
- Example: $100 as $60, $25, $15

#### 5.2.2 Split Data Structure
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Unique split identifier |
| expense_id | UUID | Foreign Key | Associated expense |
| user_id | UUID | Foreign Key | Participant user |
| amount | Decimal | Calculated/Specified | Amount owed |
| is_settled | Boolean | Default: false | Settlement status |

### 5.3 Expense Modification

#### 5.3.1 Edit Rules
- Any group member can edit any expense
- If `amount`, `splitType`, and `members` are provided together, splits are recalculated
- If only one or two of those fields are provided, the update is rejected

#### 5.3.2 Editable Fields
- Amount
- Description
- Date
- Payer
- Split configuration
- Currency

### 5.4 Expense Deletion

#### 5.4.1 Deletion Rules
- Hard delete (expense permanently removed from database)
- Any group member can delete any expense
- Associated expense splits are also deleted
- This action is irreversible

---

## 6. Balances and Settlements

### 6.1 Balance Computation
- Balances are computed from expense splits and settlements
- `simplifyDebts = true` uses a strategy that minimizes debts with no new transactions
- `simplifyDebts = false` uses a minimum money-flow strategy

### 6.2 Settlements
- Members can record a settlement within a group
- Settlement validates debtor and creditor are distinct members of the group
- Settlement impacts balances in subsequent balance computation

---

## 7. API Overview (High-Level)

### 7.1 Public Authentication
- `POST /api/public/register`
- `POST /api/public/login`

### 7.2 Users
- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/users/{userId}`

### 7.3 Groups
- `GET /api/groups`
- `GET /api/groups/{groupId}`
- `POST /api/groups`
- `PATCH /api/groups/{groupId}`
- `POST /api/groups/{groupId}/members/{memberId}`
- `DELETE /api/groups/{groupId}/members/{memberId}`
- `DELETE /api/groups/{groupId}`

### 7.4 Expenses
- `GET /api/groups/{groupId}/expenses`
- `GET /api/groups/{groupId}/expenses/{expenseId}`
- `POST /api/groups/{groupId}/expenses`
- `PATCH /api/groups/{groupId}/expenses/{expenseId}`
- `DELETE /api/groups/{groupId}/expenses/{expenseId}`

### 7.5 Balances and Settlements
- `GET /api/balances/{groupId}`
- `POST /api/groups/{groupId}/settlement`
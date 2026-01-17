# Kadan - Design Document

## 1. Overview

### 1.1 Introduction
Kadan is a web-based expense tracking and splitting application that enables users to manage shared expenses among friends and groups. Similar to Splitwise, it allows users to record expenses, split costs in various ways, track balances, and settle debts efficiently. 

### 1.2 Purpose
This document provides a comprehensive design specification for the Kadan backend application, detailing all functional requirements, system architecture, security considerations, and implementation guidelines.

### 1.3 Scope
The application covers:
- User management (registration, authentication, profile management)
- Group management (creation, modification, member management)
- Expense management (creation, modification, deletion, splitting)

### 1.4 Technology Stack
| Component | Technology |
|-----------|------------|
| Backend Framework | Spring Boot (Java 17+) |
| Authentication | Custom JWT-based Authentication |
| Primary Database | PostgreSQL |
| Caching Layer | Redis (optional, for session management and caching) |
| API Style | RESTful |
| Documentation | OpenAPI 3.0 / Swagger |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────┐                              ┌─────────────────┐
│   Client Apps   │─────────────────────────────▶│  Spring Boot    │
│  (Web/Mobile)   │                              │   Application   │
└─────────────────┘                              └─────────────────┘
                                                        │
                        ┌───────────────────────────────┴───────────────────────────────┐
                        │                                                               │
                        ▼                                                               ▼
                ┌───────────────┐                                              ┌───────────────┐
                │  PostgreSQL   │                                              │    Redis      │
                │   (Primary)   │                                              │   (Cache)     │
                └───────────────┘                                              └───────────────┘
```

---

## 3. User Management

### 3.1 User Registration

#### 3.1.1 Registration Flow
1. User submits registration request with username, email, and password
2. System validates input data:
   - Username: 3-30 characters, alphanumeric with underscores, unique
   - Email: Valid email format, unique
   - Password: Minimum 8 characters, at least one uppercase, one lowercase, one digit, one special character
3. System hashes password using a strong algorithm (e.g., BCrypt)
4. System creates user record in database
5. Optional: Verification email sent to user (if email service configured)

#### 3.1.2 User Profile Data
| Field            | Type      | Constraints           | Description                |
|------------------|-----------|-----------------------|----------------------------|
| id               | UUID      | Primary Key           | Internal unique identifier |
| username         | String    | Unique, 3-30 chars    | Display name               |
| email            | String    | Unique, Valid format  | User email address         |
| password_hash    | String    | Not Null              | Hashed password            |
| display_name     | String    | Optional, 1-100 chars | Friendly display name      |
| default_currency | String    | 3 chars, Default: INR | Preferred currency         |
| created_at       | Timestamp | Auto-generated        | Account creation time      |
| updated_at       | Timestamp | Auto-updated          | Last modification time     |
| status           | Enum      | ACTIVE, INACTIVE      | Account status             |

### 3.2 Authentication

#### 3.2.1 Login Flow
1. User submits credentials (email/username + password)
2. System looks up user by email/username
3. System verifies provided password against stored hash
4. On success, System generates and issues JWT tokens:
   - Access Token: (4 hours), contains user claims
5. Client stores tokens securely
6. Subsequent requests include Access Token in Authorization header

#### 3.2.2 JWT Token Structure
```json
{
  "iss": "kadan-api",
  "sub": "user_uuid",
  "iat": 1704067200,
  "exp": 1704070800,
  "roles": ["user"],
  "username": "johndoe"
}
```

### 3.3 Password Management

#### 3.3.1 Password Reset Flow
1. User requests password reset via email
2. System validates email exists
3. System generates a secure reset token (valid for 24 hours)
4. System sends email with reset link containing the token
5. User clicks link and enters new password
6. System verifies token and updates password hash
7. All existing sessions can be invalidated (optional)
8. User must log in with new password

#### 3.3.2 Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
- Cannot be same as previous 5 passwords
- Cannot contain username or email

### 3.4 User Permissions

#### 3.4.1 Global Roles
| Role | Description | Permissions |
|------|-------------|-------------|
| USER | Standard user | Create groups, add expenses, view own data |

#### 3.4.2 Group-Level Roles
| Role | Description | Permissions |
|------|-------------|-------------|
| OWNER | Group creator | Full control including delete group and remove members |
| MEMBER | Regular member | All permissions except removing members and deleting group |

#### 3.4.3 Permission Matrix

| Action | OWNER | MEMBER |
|--------|-------|--------|
| View group details | ✓ | ✓ |
| View expenses | ✓ | ✓ |
| View balances | ✓ | ✓ |
| Add expense | ✓ | ✓ |
| Edit any expense | ✓ | ✓ |
| Delete any expense | ✓ | ✓ |
| Add members | ✓ | ✓ |
| Remove members | ✓ | ✗ |
| Edit group details | ✓ | ✓ |
| Delete group | ✓ | ✗ |
| Leave group | ✗ | ✓ |
| Transfer ownership | ✓ | ✗ |

---

## 4. Group Management

### 4.1 Group Creation

#### 4.1.1 Creation Flow
1. Authenticated user initiates group creation
2. System validates input:
   - Name: 1-100 characters, required
   - Description: 0-500 characters, optional
   - Currency: Valid ISO 4217 code, default INR
   - Members: 2-20 members including creator
3. Creator automatically assigned as OWNER
4. Initial members added (can add by email or username)
5. Invitation sent to members not yet registered

#### 4.1.2 Group Data Structure
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Unique group identifier |
| name | String | 1-100 chars, Required | Group display name |
| description | String | 0-500 chars | Group description |
| currency | String | 3 chars, Default: INR | Group currency |
| created_by | UUID | Foreign Key | Creator user ID |
| created_at | Timestamp | Auto-generated | Creation time |
| updated_at | Timestamp | Auto-updated | Last update time |
| status | Enum | ACTIVE, DELETED | Group status |
| simplify_debts | Boolean | Default: true | Auto-simplify balances |

### 4.2 Member Management

#### 4.2.1 Adding Members
1. Any group member initiates member addition
2. System validates:
   - Group has less than 20 members
   - User is not already a member
   - User exists (by email or username)
3. Member added with MEMBER role
4. Notification sent to new member

#### 4.2.2 Removing Members
1. OWNER initiates removal
2. System validates:
   - Member exists in group
   - Member is not the OWNER
   - Member has zero balance (or balances are settled)
3. If member has outstanding balance:
   - Option A: Settle all balances first
   - Option B: Redistribute balances among remaining members
4. Member removed from group
5. Member's expense history preserved for audit

#### 4.2.3 Leaving Group
1. Member initiates leave request
2. System validates member has zero balance
3. If balance exists, prompt to settle first
4. Member removed from group
5. If OWNER leaves, ownership transferred to oldest MEMBER

### 4.3 Group Settings

#### 4.3.1 Editable Settings
- Group name
- Group description
- Default currency (affects new expenses only)
- Simplify debts toggle

#### 4.3.2 Group Deletion
- Groups are soft deleted (status changed to DELETED)
- Only OWNER can delete a group
- Deleted groups are not shown in the UI
- All associated data (expenses, settlements, members) is retained in the database
- Deleted groups can be restored by changing status back to ACTIVE (future scope)

---

## 5. Expense Management

### 5.1 Expense Creation

#### 5.1.1 Creation Flow
1. Member initiates expense creation in a group
2. System validates:
   - User is a group member
   - Amount is positive
   - Payer is a group member
   - All split participants are group members
   - Split amounts/percentages sum correctly
3. Expense created with PENDING status
4. Balances calculated and updated
5. Notifications sent to affected members

#### 5.1.2 Expense Data Structure
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Unique expense identifier |
| group_id | UUID | Foreign Key | Associated group |
| amount | Decimal | Positive, 2 decimal places | Total expense amount |
| currency | String | 3 chars | Expense currency |
| description | String | 0-500 chars | Expense description |
| paid_by | UUID | Foreign Key | User who paid |
| expense_date | Date | Required | When expense occurred |
| created_by | UUID | Foreign Key | User who created record |
| created_at | Timestamp | Auto-generated | Record creation time |
| updated_at | Timestamp | Auto-updated | Last update time |
| notes | String | 0-1000 chars | Additional notes |

### 5.2 Expense Splitting

#### 5.2.1 Split Types

**Equal Split**
- Total amount divided equally among selected participants
- Handles rounding by assigning remainder to payer or first participant
- Example: $100 among 3 people = $33.34, $33.33, $33.33

**Percentage Split**
- Each participant assigned a percentage
- Percentages must sum to 100%
- Amount calculated: (percentage / 100) × total
- Example: $100 at 50%, 30%, 20% = $50, $30, $20

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
| split_type | Enum | EQUAL, PERCENTAGE, EXACT | How split was calculated |
| percentage | Decimal | 0-100, Optional | Percentage share |
| amount | Decimal | Calculated/Specified | Amount owed |
| is_settled | Boolean | Default: false | Settlement status |

### 5.3 Expense Modification

#### 5.3.1 Edit Rules
- Any group member can edit any expense
- Editing recalculates all affected balances
- Original expense preserved in audit log
- Members notified of changes

#### 5.3.2 Editable Fields
- Amount
- Description
- Date
- Payer
- Split configuration
- Notes

### 5.4 Expense Deletion

#### 5.4.1 Deletion Rules
- Hard delete (expense permanently removed from database)
- Any group member can delete any expense
- Balances recalculated upon deletion
- Associated expense splits are also deleted
- This action is irreversible
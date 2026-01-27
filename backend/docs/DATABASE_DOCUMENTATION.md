# Kadan - Database Documentation

## 1. Overview

### 1.1 Database Technology
- **Primary Database:** PostgreSQL 15+
- **Caching Layer:** Redis 7+ (optional)
- **ORM:** Spring Data JPA with Hibernate

### 1.2 Design Principles
- **Normalization:** Tables are normalized to 3NF to eliminate redundancy
- **UUID Primary Keys:** All tables use UUIDs for primary keys to support distributed systems
- **Soft Deletes:** Critical data uses soft deletes with `status` or `deleted_at` columns
- **Audit Columns:** All tables include `created_at` and `updated_at` timestamps
- **Indexing:** Strategic indexes on frequently queried columns
- **Constraints:** Foreign keys, unique constraints, and check constraints enforce data integrity

### 1.3 Naming Conventions
- **Tables:** snake_case, plural (e.g., `users`, `expense_splits`)
- **Columns:** snake_case (e.g., `created_at`, `group_id`)
- **Primary Keys:** `id`
- **Foreign Keys:** `<table_singular>_id` (e.g., `user_id`, `group_id`)
- **Indexes:** `idx_<table>_<column(s)>`
- **Constraints:** `<type>_<table>_<column>` (e.g., `fk_expenses_group_id`, `uk_users_email`)

---

## 2. Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   users     │────<│  group_members  │>────│   groups    │
└─────────────┘     └─────────────────┘     └─────────────┘
       │                    │                      │
       │                    │                      │
       ▼                    │                      ▼
┌─────────────────┐         │              ┌─────────────┐
│ activities      │         │              │  expenses   │
└─────────────────┘         │              └─────────────┘
                            │                    │ │
                            │                    │ │
                            │                    │ ▼
                            │              ┌─────────────────┐
                            │              │ expense_splits  │
                            │              └─────────────────┘
                            │                      │
                            │                      │
                            ▼                      │
                    ┌─────────────┐                │
                    │ settlements │◀───────────────┘
                    └─────────────┘
```

---

## 3. Table Definitions

### 3.1 users

Stores user account information.

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(30) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(100),
    default_currency VARCHAR(3) DEFAULT 'INR',
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
```

| Column           | Type         | Constraints      | Description                |
|------------------|--------------|------------------|----------------------------|
| id               | UUID         | PK, NOT NULL     | Unique identifier          |
| username         | VARCHAR(30)  | UNIQUE, NOT NULL | Unique username            |
| email            | VARCHAR(255) | UNIQUE, NOT NULL | User email address         |
| password_hash    | VARCHAR(255) | NOT NULL         | BCrypt hashed password     |
| display_name     | VARCHAR(100) | NULLABLE         | Friendly display name      |
| default_currency | VARCHAR(3)   | DEFAULT 'INR'    | Preferred currency code    |
| status           | VARCHAR(20)  | DEFAULT 'ACTIVE' | Account status             |
| created_at       | TIMESTAMP    | DEFAULT NOW      | Account creation timestamp |
| updated_at       | TIMESTAMP    | DEFAULT NOW      | Last update timestamp      |

---

### 3.2 groups

Stores expense group information.

```sql
CREATE TABLE groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(500),
    currency        VARCHAR(3) DEFAULT 'INR',
    simplify_debts  BOOLEAN DEFAULT FALSE,
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_by      UUID NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_groups_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT chk_groups_status CHECK (status IN ('ACTIVE', 'DELETED'))
);

-- Indexes
CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_groups_status ON groups(status);
CREATE INDEX idx_groups_created_at ON groups(created_at DESC);
```

| Column         | Type         | Constraints      | Description                                                                        |
|----------------|--------------|------------------|------------------------------------------------------------------------------------|
| id             | UUID         | PK, NOT NULL     | Unique identifier                                                                  |
| name           | VARCHAR(100) | NOT NULL         | Group name                                                                         |
| description    | VARCHAR(500) | NULLABLE         | Group description                                                                  |
| currency       | VARCHAR(3)   | DEFAULT 'INR'    | Default currency for group                                                         |
| simplify_debts | BOOLEAN      | DEFAULT FALSE    | Enable debt simplification                                                         |
| status         | VARCHAR(20)  | DEFAULT 'ACTIVE' | Group status (ACTIVE, DELETED). Deleted groups are soft deleted and hidden from UI |
| created_by     | UUID         | FK, NOT NULL     | User who created the group                                                         |
| created_at     | TIMESTAMP    | DEFAULT NOW      | Group creation timestamp                                                           |
| updated_at     | TIMESTAMP    | DEFAULT NOW      | Last update timestamp                                                              |

---

### 3.3 group_members

Junction table for users and groups with role information.

```sql
CREATE TABLE group_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id    UUID NOT NULL,
    user_id     UUID NOT NULL,
    role        VARCHAR(20) DEFAULT 'MEMBER',
    joined_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_group_members_group_id FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_members_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_group_members_group_user UNIQUE (group_id, user_id),
    CONSTRAINT chk_group_members_role CHECK (role IN ('OWNER', 'MEMBER'))
);

-- Indexes
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_role ON group_members(role);
```

| Column     | Type        | Constraints      | Description                            |
|------------|-------------|------------------|----------------------------------------|
| id         | UUID        | PK, NOT NULL     | Unique identifier                      |
| group_id   | UUID        | FK, NOT NULL     | Reference to groups table              |
| user_id    | UUID        | FK, NOT NULL     | Reference to users table               |
| role       | VARCHAR(20) | DEFAULT 'MEMBER' | Member role in group (OWNER or MEMBER) |
| joined_at  | TIMESTAMP   | DEFAULT NOW      | When user joined group                 |
| updated_at | TIMESTAMP   | DEFAULT NOW      | Last update timestamp                  |

---

### 3.4 expenses

Stores expense records.

```sql
CREATE TABLE expenses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID NOT NULL,
    amount          DECIMAL(15, 2) NOT NULL,
    currency        VARCHAR(3) NOT NULL,
    description     VARCHAR(500),
    paid_by         UUID NOT NULL,
    expense_date    DATE NOT NULL,
    notes           VARCHAR(1000),
    split_type      VARCHAR(20) NOT NULL,
    created_by      UUID NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_expenses_group_id FOREIGN KEY (group_id) REFERENCES groups(id),
    CONSTRAINT fk_expenses_paid_by FOREIGN KEY (paid_by) REFERENCES users(id),
    CONSTRAINT fk_expenses_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT chk_expenses_amount CHECK (amount > 0),
    CONSTRAINT chk_expenses_split_type CHECK (split_type IN ('EQUAL', 'PERCENTAGE', 'EXACT'))
);

-- Indexes
CREATE INDEX idx_expenses_group_id ON expenses(group_id);
CREATE INDEX idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date DESC);
CREATE INDEX idx_expenses_created_at ON expenses(created_at DESC);
CREATE INDEX idx_expenses_group_date ON expenses(group_id, expense_date DESC);
```

| Column       | Type          | Constraints   | Description                                     |
|--------------|---------------|---------------|-------------------------------------------------|
| id           | UUID          | PK, NOT NULL  | Unique identifier                               |
| group_id     | UUID          | FK, NOT NULL  | Reference to groups table                       |
| amount       | DECIMAL(15,2) | NOT NULL, > 0 | Total expense amount                            |
| currency     | VARCHAR(3)    | NOT NULL      | Currency code                                   |
| description  | VARCHAR(500)  | NULLABLE      | Expense description                             |
| paid_by      | UUID          | FK, NOT NULL  | User who paid                                   |
| expense_date | DATE          | NOT NULL      | Date of expense                                 |
| notes        | VARCHAR(1000) | NULLABLE      | Additional notes                                |
| split_type   | VARCHAR(20)   | NOT NULL      | How expense is split (EQUAL, PERCENTAGE, EXACT) |
| created_by   | UUID          | FK, NOT NULL  | User who created record                         |
| created_at   | TIMESTAMP     | DEFAULT NOW   | Record creation timestamp                       |
| updated_at   | TIMESTAMP     | DEFAULT NOW   | Last update timestamp                           |

---

### 3.5 expense_splits

Stores individual split amounts for each expense participant.

```sql
CREATE TABLE expense_splits (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id  UUID NOT NULL,
    user_id     UUID NOT NULL,
    amount      DECIMAL(15, 2) NOT NULL,
    is_settled  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_expense_splits_expense_id FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_splits_user_id FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT uk_expense_splits_expense_user UNIQUE (expense_id, user_id),
    CONSTRAINT chk_expense_splits_amount CHECK (amount >= 0)
);

-- Indexes
CREATE INDEX idx_expense_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX idx_expense_splits_user_id ON expense_splits(user_id);
CREATE INDEX idx_expense_splits_is_settled ON expense_splits(is_settled);
```

| Column     | Type          | Constraints    | Description                     |
|------------|---------------|----------------|---------------------------------|
| id         | UUID          | PK, NOT NULL   | Unique identifier               |
| expense_id | UUID          | FK, NOT NULL   | Reference to expenses table     |
| user_id    | UUID          | FK, NOT NULL   | User responsible for this split |
| amount     | DECIMAL(15,2) | NOT NULL, >= 0 | Amount owed by user             |
| is_settled | BOOLEAN       | DEFAULT FALSE  | Whether this split is settled   |
| created_at | TIMESTAMP     | DEFAULT NOW    | Record creation timestamp       |
| updated_at | TIMESTAMP     | DEFAULT NOW    | Last update timestamp           |

---

### 3.6 settlements

Stores payment settlements between users.

```sql
CREATE TABLE settlements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID NOT NULL,
    payer_id        UUID NOT NULL,
    payee_id        UUID NOT NULL,
    amount          DECIMAL(15, 2) NOT NULL,
    currency        VARCHAR(3) NOT NULL,
    settlement_date DATE NOT NULL,
    notes           VARCHAR(500),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_settlements_group_id FOREIGN KEY (group_id) REFERENCES groups(id),
    CONSTRAINT fk_settlements_payer_id FOREIGN KEY (payer_id) REFERENCES users(id),
    CONSTRAINT fk_settlements_payee_id FOREIGN KEY (payee_id) REFERENCES users(id),
    CONSTRAINT chk_settlements_amount CHECK (amount > 0),
    CONSTRAINT chk_settlements_payer_payee CHECK (payer_id != payee_id),
);

-- Indexes
CREATE INDEX idx_settlements_group_id ON settlements(group_id);
CREATE INDEX idx_settlements_payer_id ON settlements(payer_id);
CREATE INDEX idx_settlements_payee_id ON settlements(payee_id);
CREATE INDEX idx_settlements_status ON settlements(status);
CREATE INDEX idx_settlements_settlement_date ON settlements(settlement_date DESC);
CREATE INDEX idx_settlements_group_status ON settlements(group_id, status);
```

| Column          | Type          | Constraints   | Description               |
|-----------------|---------------|---------------|---------------------------|
| id              | UUID          | PK, NOT NULL  | Unique identifier         |
| group_id        | UUID          | FK, NOT NULL  | Reference to groups table |
| payer_id        | UUID          | FK, NOT NULL  | User making payment       |
| payee_id        | UUID          | FK, NOT NULL  | User receiving payment    |
| amount          | DECIMAL(15,2) | NOT NULL, > 0 | Settlement amount         |
| currency        | VARCHAR(3)    | NOT NULL      | Currency code             |
| settlement_date | DATE          | NOT NULL      | Date of settlement        |
| notes           | VARCHAR(500)  | NULLABLE      | Settlement notes          |
| created_at      | TIMESTAMP     | DEFAULT NOW   | Record creation timestamp |
| updated_at      | TIMESTAMP     | DEFAULT NOW   | Last update timestamp     |

---

### 3.7 activities

Stores activity log for audit and activity feeds.

```sql
CREATE TABLE activities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID,
    actor_id        UUID NOT NULL,
    activity_type   VARCHAR(50) NOT NULL,
    description     VARCHAR(500) NOT NULL,
    metadata        JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_activities_group_id FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL,
    CONSTRAINT fk_activities_actor_id FOREIGN KEY (actor_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_activities_group_id ON activities(group_id);
CREATE INDEX idx_activities_actor_id ON activities(actor_id);
CREATE INDEX idx_activities_activity_type ON activities(activity_type);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_group_created ON activities(group_id, created_at DESC);
CREATE INDEX idx_activities_metadata ON activities USING GIN (metadata);
```

| Column        | Type         | Constraints  | Description                |
|---------------|--------------|--------------|----------------------------|
| id            | UUID         | PK, NOT NULL | Unique identifier          |
| group_id      | UUID         | FK, NULLABLE | Reference to groups table  |
| actor_id      | UUID         | FK, NOT NULL | User who performed action  |
| activity_type | VARCHAR(50)  | NOT NULL     | Type of activity           |
| description   | VARCHAR(500) | NOT NULL     | Human-readable description |
| metadata      | JSONB        | NULLABLE     | Additional structured data |
| created_at    | TIMESTAMP    | DEFAULT NOW  | Activity timestamp         |

**Activity Types:**
- `USER_REGISTERED`
- `USER_LOGIN`
- `GROUP_CREATED`
- `GROUP_UPDATED`
- `GROUP_DELETED`
- `MEMBER_ADDED`
- `MEMBER_REMOVED`
- `MEMBER_LEFT`
- `MEMBER_ROLE_CHANGED`
- `OWNERSHIP_TRANSFERRED`
- `EXPENSE_CREATED`
- `EXPENSE_UPDATED`
- `EXPENSE_DELETED`
- `SETTLEMENT_CREATED`
- `SETTLEMENT_CONFIRMED`
- `SETTLEMENT_REJECTED`
---

### 3.8 currencies

Stores supported currency information.

```sql
CREATE TABLE currencies (
    code        VARCHAR(3) PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    symbol      VARCHAR(5) NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed currencies
INSERT INTO currencies (code, name, symbol, is_active, sort_order) VALUES
    ('INR', 'Indian Rupee', '₹', TRUE, 1),
    ('USD', 'US Dollar', '$', TRUE, 2),
    ('EUR', 'Euro', '€', TRUE, 3),
    ('GBP', 'British Pound', '£', TRUE, 4),
    ('AUD', 'Australian Dollar', 'A$', TRUE, 5),
    ('CAD', 'Canadian Dollar', 'C$', TRUE, 6),
    ('SGD', 'Singapore Dollar', 'S$', TRUE, 7),
    ('AED', 'UAE Dirham', 'د.إ', TRUE, 8),
    ('JPY', 'Japanese Yen', '¥', TRUE, 9),
    ('CHF', 'Swiss Franc', 'CHF', TRUE, 10);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| code | VARCHAR(3) | PK | ISO 4217 currency code |
| name | VARCHAR(50) | NOT NULL | Currency name |
| symbol | VARCHAR(5) | NOT NULL | Currency symbol |
| is_active | BOOLEAN | DEFAULT TRUE | Whether currency is available |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| created_at | TIMESTAMP | DEFAULT NOW | Record creation timestamp |

---

## 4. Table Relationships

### 4.1 Relationship Summary

| Parent Table | Child Table | Relationship | On Delete |
|--------------|-------------|--------------|-----------|
| users | group_members | One-to-Many | CASCADE |
| users | expenses (paid_by) | One-to-Many | RESTRICT |
| users | expenses (created_by) | One-to-Many | RESTRICT |
| users | expense_splits | One-to-Many | RESTRICT |
| users | settlements (payer) | One-to-Many | RESTRICT |
| users | settlements (payee) | One-to-Many | RESTRICT |
| users | activities | One-to-Many | RESTRICT |
| users | groups (created_by) | One-to-Many | RESTRICT |
| groups | group_members | One-to-Many | CASCADE |
| groups | expenses | One-to-Many | RESTRICT |
| groups | settlements | One-to-Many | RESTRICT |
| groups | activities | One-to-Many | SET NULL |
| expenses | expense_splits | One-to-Many | CASCADE |

### 4.2 Cardinality Details

users (1) ------- (0..\*) group_members  
groups (1) ------- (1..\*) group_members  
groups (1) ------- (0..\*) expenses  
expenses (1) ------- (1..\*) expense_splits  
groups (1) ------- (0..\*) settlements  
groups (1) ------- (0..\*) activities  
```

---

## 5. Indexes Strategy

### 5.1 Primary Indexes
All tables have a primary key index on the `id` column (UUID).

### 5.2 Foreign Key Indexes
All foreign key columns are indexed for join performance.

### 5.3 Query Optimization Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| users | idx_users_email | Login/search by email |
| users | idx_users_username | Search by username |
| expenses | idx_expenses_group_date | List expenses by group sorted by date |
| settlements | idx_settlements_group_status | Filter pending settlements |
| activities | idx_activities_group_created | Activity feed pagination |

### 5.4 Composite Indexes
Used for queries that filter on multiple columns:
- `idx_expenses_group_date` - (group_id, expense_date DESC)
- `idx_settlements_group_status` - (group_id, status)
- `idx_activities_group_created` - (group_id, created_at DESC)


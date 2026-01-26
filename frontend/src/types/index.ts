/**
 * TypeScript Type Definitions
 * 
 * Defines the data structures used throughout the application.
 * These types mirror the backend API responses and can be reused
 * when integrating with real APIs.
 */

// ========================================
// USER TYPES
// ========================================

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  email: string;
  displayName: string;
  defaultCurrency: string;
  status: UserStatus;
}

// ========================================
// GROUP TYPES
// ========================================

export type MemberRole = 'OWNER' | 'MEMBER';

export interface GroupMember {
  user: User;
  role: MemberRole;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  currency: string;
  simplifyDebts: boolean;
  createdBy: User;
  members: GroupMember[];
}

/** Lighter group object returned in list views */
export interface GroupSummary {
  id: string;
  name: string;
  description?: string;
  currency: string;
  createdBy: User;
}

// ========================================
// EXPENSE TYPES
// ========================================

export type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE';

export interface ExpenseShare {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  isSettled: boolean;
}

export interface Expense {
  id: string;
  groupId: string;
  currency: string;
  description: string;
  amount: number;
  date: string; // ISO date string YYYY-MM-DD
  splitType: SplitType;
  paidBy: User;
  shares: ExpenseShare[];
  createdAt: string;
  updatedAt: string;
}

// ========================================
// BALANCE TYPES
// ========================================

export interface MemberBalance {
  id: string;
  name: string;
  paid: number;
  owed: number;
  netBalance: number;
}

export interface Debt {
  debtor: string;    // User ID
  creditor: string;  // User ID
  amount: number;
}

export interface GroupBalances {
  balances: MemberBalance[];
  debts: Debt[];
}

// ========================================
// AUTH TYPES
// ========================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  displayName: string;
  password: string;
}

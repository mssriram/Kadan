/**
 * Mock Data
 * 
 * Placeholder data for development and testing.
 * This data can be replaced with real API responses when integrating.
 * 
 * Structure mirrors the actual backend API response shapes.
 */

import { User, Group, GroupSummary, Expense, MemberBalance, Debt } from '@/types';

// ========================================
// MOCK USERS
// ========================================

export const mockCurrentUser: User = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'john@example.com',
  displayName: 'John Doe',
  defaultCurrency: 'INR',
  status: 'ACTIVE',
};

export const mockUsers: User[] = [
  mockCurrentUser,
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    defaultCurrency: 'INR',
    status: 'ACTIVE',
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440002',
    email: 'bob@example.com',
    displayName: 'Bob Wilson',
    defaultCurrency: 'INR',
    status: 'ACTIVE',
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440003',
    email: 'alice@example.com',
    displayName: 'Alice Brown',
    defaultCurrency: 'USD',
    status: 'ACTIVE',
  },
];

// ========================================
// MOCK GROUPS
// ========================================

export const mockGroups: GroupSummary[] = [
  {
    id: 'group-001',
    name: 'Trip to Goa',
    description: 'Beach vacation with friends',
    currency: 'INR',
    createdBy: mockCurrentUser,
  },
  {
    id: 'group-002',
    name: 'Apartment Expenses',
    description: 'Monthly shared bills',
    currency: 'INR',
    createdBy: mockUsers[1],
  },
  {
    id: 'group-003',
    name: 'Office Lunch Club',
    description: 'Daily lunch expenses',
    currency: 'INR',
    createdBy: mockCurrentUser,
  },
];

export const mockGroupDetails: Group = {
  id: 'group-001',
  name: 'Trip to Goa',
  description: 'Beach vacation with friends',
  currency: 'INR',
  simplifyDebts: true,
  createdBy: mockCurrentUser,
  members: [
    { user: mockCurrentUser, role: 'OWNER' },
    { user: mockUsers[1], role: 'MEMBER' },
    { user: mockUsers[2], role: 'MEMBER' },
  ],
};

// ========================================
// MOCK EXPENSES
// ========================================

export const mockExpenses: Expense[] = [
  {
    id: 'expense-001',
    groupId: 'group-001',
    currency: 'INR',
    description: 'Dinner at Beach Shack',
    amount: 3000,
    date: '2026-01-14',
    splitType: 'EQUAL',
    paidBy: mockCurrentUser,
    shares: [
      { id: 'share-001', userId: mockCurrentUser.id, userName: 'John Doe', amount: 1000, isSettled: true },
      { id: 'share-002', userId: mockUsers[1].id, userName: 'Jane Smith', amount: 1000, isSettled: false },
      { id: 'share-003', userId: mockUsers[2].id, userName: 'Bob Wilson', amount: 1000, isSettled: false },
    ],
    createdAt: '2026-01-14T12:00:00Z',
    updatedAt: '2026-01-14T12:00:00Z',
  },
  {
    id: 'expense-002',
    groupId: 'group-001',
    currency: 'INR',
    description: 'Hotel Booking',
    amount: 12000,
    date: '2026-01-13',
    splitType: 'EQUAL',
    paidBy: mockUsers[1],
    shares: [
      { id: 'share-004', userId: mockCurrentUser.id, userName: 'John Doe', amount: 4000, isSettled: false },
      { id: 'share-005', userId: mockUsers[1].id, userName: 'Jane Smith', amount: 4000, isSettled: true },
      { id: 'share-006', userId: mockUsers[2].id, userName: 'Bob Wilson', amount: 4000, isSettled: false },
    ],
    createdAt: '2026-01-13T10:00:00Z',
    updatedAt: '2026-01-13T10:00:00Z',
  },
  {
    id: 'expense-003',
    groupId: 'group-001',
    currency: 'INR',
    description: 'Cab to Airport',
    amount: 1500,
    date: '2026-01-12',
    splitType: 'EQUAL',
    paidBy: mockUsers[2],
    shares: [
      { id: 'share-007', userId: mockCurrentUser.id, userName: 'John Doe', amount: 500, isSettled: false },
      { id: 'share-008', userId: mockUsers[1].id, userName: 'Jane Smith', amount: 500, isSettled: false },
      { id: 'share-009', userId: mockUsers[2].id, userName: 'Bob Wilson', amount: 500, isSettled: true },
    ],
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z',
  },
];

// ========================================
// MOCK BALANCES
// ========================================

export const mockBalances: MemberBalance[] = [
  {
    id: mockCurrentUser.id,
    name: 'John Doe',
    paid: 3000,
    owed: 5500,
    netBalance: -2500, // Negative = you owe money
  },
  {
    id: mockUsers[1].id,
    name: 'Jane Smith',
    paid: 12000,
    owed: 5500,
    netBalance: 6500, // Positive = owed to you
  },
  {
    id: mockUsers[2].id,
    name: 'Bob Wilson',
    paid: 1500,
    owed: 5500,
    netBalance: -4000,
  },
];

export const mockDebts: Debt[] = [
  {
    debtor: mockCurrentUser.id,
    creditor: mockUsers[1].id,
    amount: 2500,
  },
  {
    debtor: mockUsers[2].id,
    creditor: mockUsers[1].id,
    amount: 4000,
  },
];

// ========================================
// AGGREGATE STATS (for dashboard summary)
// ========================================

export const mockDashboardStats = {
  /** Total amount the current user has paid across all groups */
  totalPaid: 13000,
  /** Total amount the current user owes across all groups */
  totalOwed: 12000,
  /** Net balance (positive = owed to you, negative = you owe) */
  netBalance: 3500,
  /** Number of groups the user is part of */
  groupCount: 3,
};

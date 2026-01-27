/**
 * Group Service
 * 
 * API service for group-related operations including:
 * - Fetching group details
 * - Fetching group expenses
 * - Fetching group balances
 * 
 * Based on API_DOCUMENTATION.md endpoints.
 */

import { api } from './api';
import type { User, GroupMember, Expense, ExpenseShare, MemberBalance, Debt } from '@/types';

// ========================================
// API RESPONSE TYPES (raw from backend)
// ========================================

/**
 * Raw user response from backend.
 * Note: Backend returns user profiles directly in members array,
 * not wrapped with role info (role needs to be inferred from createdBy).
 */
interface ApiUserProfile {
  id: string;
  email: string;
  displayName: string;
  defaultCurrency: string;
  status: 'ACTIVE' | 'INACTIVE';
}

/**
 * Raw group response from GET /api/groups/{groupId}
 * Note: Backend currently returns members as UserProfile[], not with roles.
 * Frontend expects GroupMember[] with role info.
 */
interface ApiGroupResponse {
  id: string;
  name: string;
  description?: string;
  currency: string;
  simplifyDebts?: boolean;
  created_by: ApiUserProfile;
  members: ApiUserProfile[];
}

/**
 * Raw expense share from backend.
 * Maps to ExpenseShare on frontend.
 */
interface ApiExpenseShare {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  isSettled: boolean;
}

/**
 * Raw expense response from GET /api/groups/{groupId}/expenses
 */
interface ApiExpenseResponse {
  id: string;
  currency: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE';
  paidBy: ApiUserProfile;
  shares: ApiExpenseShare[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Raw balance item from backend.
 */
interface ApiMemberBalance {
  id: string;
  name: string;
  paid: number;
  owed: number;
  netBalance: number;
}

/**
 * Raw debt item from backend.
 */
interface ApiDebt {
  debtor: string;
  creditor: string;
  amount: number;
}

/**
 * Raw balances response from GET /api/balances/{groupId}
 */
interface ApiBalancesResponse {
  balances: ApiMemberBalance[];
  debts: ApiDebt[];
}

// ========================================
// TRANSFORMED TYPES (for frontend use)
// ========================================

export interface GroupDetail {
  id: string;
  name: string;
  description?: string;
  currency: string;
  simplifyDebts?: boolean;
  createdBy: User;
  members: GroupMember[];
}

export interface GroupBalances {
  balances: MemberBalance[];
  debts: Debt[];
}

// ========================================
// TRANSFORM FUNCTIONS
// ========================================

/**
 * Transform API user profile to frontend User type.
 */
const transformUser = (apiUser: ApiUserProfile): User => ({
  id: apiUser.id,
  email: apiUser.email,
  displayName: apiUser.displayName,
  defaultCurrency: apiUser.defaultCurrency,
  status: apiUser.status,
});

/**
 * Transform API group response to frontend GroupDetail type.
 * Since backend doesn't provide role info, we infer OWNER from created_by.
 */
const transformGroupResponse = (apiGroup: ApiGroupResponse): GroupDetail => {
  const createdBy = transformUser(apiGroup.created_by);
  
  // Transform members and assign roles
  // Owner is the created_by user, others are members
  const members: GroupMember[] = apiGroup.members.map((apiMember) => ({
    user: transformUser(apiMember),
    role: apiMember.id === apiGroup.created_by.id ? 'OWNER' : 'MEMBER',
  }));

  return {
    id: apiGroup.id,
    name: apiGroup.name,
    description: apiGroup.description,
    currency: apiGroup.currency,
    simplifyDebts: apiGroup.simplifyDebts,
    createdBy,
    members,
  };
};

/**
 * Transform API expense share to frontend ExpenseShare type.
 */
const transformExpenseShare = (apiShare: ApiExpenseShare): ExpenseShare => ({
  id: apiShare.id,
  userId: apiShare.user_id,
  userName: apiShare.name,
  amount: apiShare.amount,
  isSettled: apiShare.isSettled,
});

/**
 * Transform API expense response to frontend Expense type.
 */
const transformExpense = (apiExpense: ApiExpenseResponse, groupId: string): Expense => ({
  id: apiExpense.id,
  groupId,
  currency: apiExpense.currency,
  description: apiExpense.description,
  amount: apiExpense.amount,
  date: apiExpense.date,
  splitType: apiExpense.splitType,
  paidBy: transformUser(apiExpense.paidBy),
  shares: apiExpense.shares.map(transformExpenseShare),
  createdAt: apiExpense.createdAt,
  updatedAt: apiExpense.updatedAt,
});

/**
 * Transform API balances response to frontend format.
 */
const transformBalancesResponse = (apiBalances: ApiBalancesResponse): GroupBalances => ({
  balances: apiBalances.balances.map((b) => ({
    id: b.id,
    name: b.name,
    paid: b.paid,
    owed: b.owed,
    netBalance: b.netBalance,
  })),
  debts: apiBalances.debts.map((d) => ({
    debtor: d.debtor,
    creditor: d.creditor,
    amount: d.amount,
  })),
});

// ========================================
// REQUEST TYPES
// ========================================

/**
 * Request body for updating a group.
 * All fields are optional - only provided fields will be updated.
 */
export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  currency?: string;
  simplifyDebts?: boolean;
}

// ========================================
// API FUNCTIONS
// ========================================

/**
 * Fetch group details by ID.
 * GET /api/groups/{groupId}
 */
export const getGroupById = async (groupId: string): Promise<GroupDetail> => {
  const response = await api.get<ApiGroupResponse>(`/groups/${groupId}`);
  return transformGroupResponse(response);
};

/**
 * Update group details.
 * PATCH /api/groups/{groupId}
 */
export const updateGroup = async (groupId: string, data: UpdateGroupRequest): Promise<GroupDetail> => {
  const response = await api.patch<ApiGroupResponse>(`/groups/${groupId}`, data);
  return transformGroupResponse(response);
};

/**
 * Fetch all expenses for a group.
 * GET /api/groups/{groupId}/expenses
 */
export const getGroupExpenses = async (groupId: string): Promise<Expense[]> => {
  const response = await api.get<ApiExpenseResponse[]>(`/groups/${groupId}/expenses`);
  return response.map((expense) => transformExpense(expense, groupId));
};

/**
 * Fetch balances and debts for a group.
 * GET /api/balances/{groupId}
 */
export const getGroupBalances = async (groupId: string): Promise<GroupBalances> => {
  const response = await api.get<ApiBalancesResponse>(`/balances/${groupId}`);
  return transformBalancesResponse(response);
};

/**
 * Remove a member from a group.
 * DELETE /api/groups/{groupId}/members/{memberId}
 * 
 * @throws ApiException with status 409 if member has unsettled balance
 */
export const removeMember = async (groupId: string, memberId: string): Promise<void> => {
  await api.delete(`/groups/${groupId}/members/${memberId}`);
};

/**
 * Request body for recording a settlement.
 */
export interface RecordSettlementRequest {
  creditor_id: string;
  amount: number;
  currency?: string;
}

/**
 * Response from recording a settlement.
 */
export interface SettlementResponse {
  id: string;
  amount: number;
  currency: string;
  date: string;
  creditor: string;
  debtor: string;
}

/**
 * Record a settlement payment between users.
 * POST /api/balances/{groupId}/settlement
 * 
 * The authenticated user is automatically the debtor (person paying).
 */
export const recordSettlement = async (
  groupId: string,
  data: RecordSettlementRequest
): Promise<SettlementResponse> => {
  return api.post<SettlementResponse>(`/balances/${groupId}/settlement`, data);
};

/**
 * Fetch all group data in parallel.
 * Combines group details, expenses, and balances into a single call.
 */
export const getGroupDashboardData = async (groupId: string): Promise<{
  group: GroupDetail;
  expenses: Expense[];
  balances: GroupBalances;
}> => {
  const [group, expenses, balances] = await Promise.all([
    getGroupById(groupId),
    getGroupExpenses(groupId),
    getGroupBalances(groupId),
  ]);

  return { group, expenses, balances };
};

// ========================================
// EXPORT SERVICE OBJECT
// ========================================

export const groupService = {
  getGroupById,
  updateGroup,
  removeMember,
  recordSettlement,
  getGroupExpenses,
  getGroupBalances,
  getGroupDashboardData,
};

export default groupService;

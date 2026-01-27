/**
 * Group Dashboard Page
 * 
 * Central screen for a single group showing:
 * - Group header with name and settings
 * - Members section with roles
 * - Expenses list
 * - Balances & recommended settlements
 * 
 * Route: /app/groups/:groupId
 * 
 * APIs:
 * - GET /api/groups/{groupId} - Group details + members
 * - GET /api/groups/{groupId}/expenses - Expenses list
 * - GET /api/groups/{groupId}/balances - Balances + debts
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Badge, Modal, Input, UserMenu, Select, ProfileModal } from '@/components';
import { authService } from '@/services/authService';
import { config } from '@/config/environment';
import type { User, GroupMember, Expense, MemberBalance, Debt } from '@/types';
import './GroupDashboardPage.css';

// ========================================
// API RESPONSE TYPES
// ========================================

/** Group details from GET /api/groups/{groupId} */
interface GroupDetailResponse {
  id: string;
  name: string;
  description?: string;
  currency: string;
  simplifyDebts?: boolean;
  createdBy: User;
  members: GroupMember[];
}

/** Balances response from GET /api/groups/{groupId}/balances */
interface BalancesResponse {
  balances: MemberBalance[];
  debts: Debt[];
}

// ========================================
// MOCK DATA (temporary until API integration)
// ========================================

const mockGroupDetail: GroupDetailResponse = {
  id: 'group-001',
  name: 'Trip to Goa',
  description: 'Beach vacation with friends',
  currency: 'INR',
  simplifyDebts: true,
  createdBy: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'john@example.com',
    displayName: 'John Doe',
    defaultCurrency: 'INR',
    status: 'ACTIVE',
  },
  members: [
    {
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
        displayName: 'John Doe',
        defaultCurrency: 'INR',
        status: 'ACTIVE',
      },
      role: 'OWNER',
    },
    {
      user: {
        id: '660e8400-e29b-41d4-a716-446655440001',
        email: 'jane@example.com',
        displayName: 'Jane Smith',
        defaultCurrency: 'INR',
        status: 'ACTIVE',
      },
      role: 'MEMBER',
    },
    {
      user: {
        id: '770e8400-e29b-41d4-a716-446655440002',
        email: 'bob@example.com',
        displayName: 'Bob Wilson',
        defaultCurrency: 'INR',
        status: 'ACTIVE',
      },
      role: 'MEMBER',
    },
  ],
};

const mockExpenses: Expense[] = [
  {
    id: 'expense-001',
    groupId: 'group-001',
    currency: 'INR',
    description: 'Dinner at Beach Shack',
    amount: 3000,
    date: '2026-01-14',
    splitType: 'EQUAL',
    paidBy: mockGroupDetail.members[0].user,
    shares: [
      { id: 'share-001', userId: mockGroupDetail.members[0].user.id, userName: 'John Doe', amount: 1000, isSettled: true },
      { id: 'share-002', userId: mockGroupDetail.members[1].user.id, userName: 'Jane Smith', amount: 1000, isSettled: false },
      { id: 'share-003', userId: mockGroupDetail.members[2].user.id, userName: 'Bob Wilson', amount: 1000, isSettled: false },
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
    paidBy: mockGroupDetail.members[1].user,
    shares: [
      { id: 'share-004', userId: mockGroupDetail.members[0].user.id, userName: 'John Doe', amount: 4000, isSettled: false },
      { id: 'share-005', userId: mockGroupDetail.members[1].user.id, userName: 'Jane Smith', amount: 4000, isSettled: true },
      { id: 'share-006', userId: mockGroupDetail.members[2].user.id, userName: 'Bob Wilson', amount: 4000, isSettled: false },
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
    paidBy: mockGroupDetail.members[2].user,
    shares: [
      { id: 'share-007', userId: mockGroupDetail.members[0].user.id, userName: 'John Doe', amount: 500, isSettled: false },
      { id: 'share-008', userId: mockGroupDetail.members[1].user.id, userName: 'Jane Smith', amount: 500, isSettled: false },
      { id: 'share-009', userId: mockGroupDetail.members[2].user.id, userName: 'Bob Wilson', amount: 500, isSettled: true },
    ],
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z',
  },
];

const mockBalancesResponse: BalancesResponse = {
  balances: [
    {
      id: mockGroupDetail.members[0].user.id,
      name: 'John Doe',
      paid: 3000,
      owed: 5500,
      netBalance: -2500,
    },
    {
      id: mockGroupDetail.members[1].user.id,
      name: 'Jane Smith',
      paid: 12000,
      owed: 5500,
      netBalance: 6500,
    },
    {
      id: mockGroupDetail.members[2].user.id,
      name: 'Bob Wilson',
      paid: 1500,
      owed: 5500,
      netBalance: -4000,
    },
  ],
  debts: [
    {
      debtor: mockGroupDetail.members[0].user.id,
      creditor: mockGroupDetail.members[1].user.id,
      amount: 2500,
    },
    {
      debtor: mockGroupDetail.members[2].user.id,
      creditor: mockGroupDetail.members[1].user.id,
      amount: 4000,
    },
  ],
};

// ========================================
// HELPERS
// ========================================

/**
 * Format currency amount for display.
 */
const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date for display.
 */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Get user name by ID from member list.
 */
const getUserName = (userId: string, members: GroupMember[]): string => {
  const member = members.find((m) => m.user.id === userId);
  return member?.user.displayName || 'Unknown';
};

// ========================================
// COMPONENT
// ========================================

export const GroupDashboardPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser()!;

  // Tab type
  type TabType = 'expenses' | 'members' | 'debts';

  // State
  const [group, setGroup] = useState<GroupDetailResponse | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<MemberBalance[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('expenses');

  // Modal states
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paidById: '',
    splitType: 'EQUAL' as 'EQUAL' | 'EXACT' | 'PERCENTAGE',
    selectedMembers: [] as string[],
    memberAmounts: {} as Record<string, string>, // For EXACT: actual amounts, for PERCENTAGE: percentage values
  });

  /**
   * Fetch group data on mount
   */
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) return;

      setIsLoading(true);
      setError(null);

      try {
        // For now, use mock data
        // TODO: Replace with actual API calls:
        // const [groupData, expensesData, balancesData] = await Promise.all([
        //   api.get<GroupDetailResponse>(`/groups/${groupId}`),
        //   api.get<Expense[]>(`/groups/${groupId}/expenses`),
        //   api.get<BalancesResponse>(`/groups/${groupId}/balances`),
        // ]);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setGroup(mockGroupDetail);
        setExpenses(mockExpenses);
        setBalances(mockBalancesResponse.balances);
        setDebts(mockBalancesResponse.debts);
      } catch (err) {
        console.error('Failed to fetch group data:', err);
        setError('Failed to load group data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

  /**
   * Handle logout
   */
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  /**
   * Open expense modal for adding new expense
   */
  const handleAddExpense = () => {
    setSelectedExpense(null);
    const memberIds = group?.members.map((m) => m.user.id) || [];
    setExpenseForm({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paidById: currentUser.id,
      splitType: 'EQUAL',
      selectedMembers: memberIds,
      memberAmounts: {},
    });
    setIsExpenseModalOpen(true);
  };

  /**
   * Open expense modal for viewing/editing existing expense
   */
  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    // Build memberAmounts from existing shares
    const memberAmounts: Record<string, string> = {};
    expense.shares.forEach((share) => {
      if (expense.splitType === 'PERCENTAGE') {
        // Calculate percentage from amount
        const pct = expense.amount > 0 ? (share.amount / expense.amount) * 100 : 0;
        memberAmounts[share.userId] = pct.toFixed(0);
      } else {
        memberAmounts[share.userId] = share.amount.toString();
      }
    });
    setExpenseForm({
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
      paidById: expense.paidBy.id,
      splitType: expense.splitType,
      selectedMembers: expense.shares.map((s) => s.userId),
      memberAmounts,
    });
    setIsExpenseModalOpen(true);
  };

  /**
   * Close expense modal
   */
  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setSelectedExpense(null);
  };

  /**
   * Toggle member selection in expense form
   */
  const toggleMemberSelection = (memberId: string) => {
    setExpenseForm((prev) => {
      const isRemoving = prev.selectedMembers.includes(memberId);
      const newSelectedMembers = isRemoving
        ? prev.selectedMembers.filter((id) => id !== memberId)
        : [...prev.selectedMembers, memberId];
      
      // Clear amount for removed member
      const newMemberAmounts = { ...prev.memberAmounts };
      if (isRemoving) {
        delete newMemberAmounts[memberId];
      }
      
      return {
        ...prev,
        selectedMembers: newSelectedMembers,
        memberAmounts: newMemberAmounts,
      };
    });
  };

  /**
   * Update member amount/percentage
   */
  const updateMemberAmount = (memberId: string, value: string) => {
    setExpenseForm((prev) => ({
      ...prev,
      memberAmounts: {
        ...prev.memberAmounts,
        [memberId]: value,
      },
    }));
  };

  /**
   * Get display amount for a member based on split type
   */
  const getMemberDisplayAmount = (memberId: string): number => {
    const totalAmount = parseFloat(expenseForm.amount) || 0;
    const isSelected = expenseForm.selectedMembers.includes(memberId);
    
    if (!isSelected) return 0;
    
    if (expenseForm.splitType === 'EQUAL') {
      const memberCount = expenseForm.selectedMembers.length;
      return memberCount > 0 ? totalAmount / memberCount : 0;
    } else if (expenseForm.splitType === 'EXACT') {
      return parseFloat(expenseForm.memberAmounts[memberId]) || 0;
    } else if (expenseForm.splitType === 'PERCENTAGE') {
      const percentage = parseFloat(expenseForm.memberAmounts[memberId]) || 0;
      return (percentage / 100) * totalAmount;
    }
    return 0;
  };

  /**
   * Get input value for member (amount or percentage)
   */
  const getMemberInputValue = (memberId: string): string => {
    return expenseForm.memberAmounts[memberId] || '';
  };

  /**
   * Memoized options for "Who paid" dropdown
   */
  const payerOptions = useMemo(() => {
    if (!group) return [];
    return group.members.map((member) => ({
      value: member.user.id,
      label: `${member.user.displayName}${member.user.id === currentUser.id ? ' (You)' : ''}`,
      icon: (
        <div className="expense-payer-avatar">
          {member.user.displayName.charAt(0).toUpperCase()}
        </div>
      ),
    }));
  }, [group, currentUser.id]);

  /**
   * Split type options
   */
  const splitTypeOptions = [
    { value: 'EQUAL', label: 'Equal split' },
    { value: 'EXACT', label: 'Exact amounts' },
    { value: 'PERCENTAGE', label: 'By percentage' },
  ];

  /**
   * Handle settle debt action
   */
  const handleSettleDebt = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsSettlementModalOpen(true);
  };

  /**
   * Check if current user is the owner of this group
   */
  const isOwner = group?.members.some(
    (m) => m.user.id === currentUser.id && m.role === 'OWNER'
  );

  /**
   * Get current user's balance in this group
   */
  const currentUserBalance = balances.find((b) => b.id === currentUser.id);

  if (isLoading) {
    return (
      <div className="group-dashboard-page">
        <div className="group-dashboard-loading">
          <p>Loading group...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="group-dashboard-page">
        <div className="group-dashboard-error">
          <p>{error || 'Group not found'}</p>
          <Button variant="secondary" onClick={() => navigate('/app/groups')}>
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group-dashboard-page">
      {/* ========================================
          HEADER
          ======================================== */}
      <header className="group-dashboard-header">
        <div className="container">
          <div className="group-dashboard-header__content">
            {/* Back link and logo */}
            <div className="group-dashboard-header__left">
              <Link to="/app/groups" className="group-dashboard-header__back">
                ← Back
              </Link>
              <Link to="/app/groups" className="group-dashboard-header__logo-link">
                <h1 className="group-dashboard-header__title">{config.appName}</h1>
              </Link>
            </div>

            {/* User menu */}
            <UserMenu
              displayName={currentUser.displayName}
              onLogout={handleLogout}
              onProfile={() => setIsProfileModalOpen(true)}
            />
          </div>
        </div>
      </header>

      {/* ========================================
          MAIN CONTENT
          ======================================== */}
      <main className="group-dashboard-main">
        <div className="container">
          {/* ========================================
              GROUP HEADER SECTION
              ======================================== */}
          <section className="group-header-section">
            <Card accent="yellow" className="group-info-card">
              <div className="group-info">
                <div className="group-info__main">
                  <h2 className="group-info__name">{group.name}</h2>
                  {group.description && (
                    <p className="group-info__description">{group.description}</p>
                  )}
                  {isOwner && (
                    <div className="group-info__meta">
                      <Badge variant="yellow">Owner</Badge>
                    </div>
                  )}
                </div>
                <div className="group-info__actions">
                  <Button
                    variant="secondary"
                    size="compact"
                    onClick={() => setIsSettingsModalOpen(true)}
                  >
                    ⚙ Settings
                  </Button>
                </div>
              </div>
            </Card>

            {/* Your Balance Summary */}
            {currentUserBalance && (
              <div className="your-balance-card">
                <div className="your-balance-card__content">
                  <span className="your-balance-card__label">Your Balance</span>
                  <span
                    className={`your-balance-card__value money ${
                      currentUserBalance.netBalance < 0
                        ? 'your-balance-card__value--negative'
                        : currentUserBalance.netBalance > 0
                        ? 'your-balance-card__value--positive'
                        : ''
                    }`}
                  >
                    {currentUserBalance.netBalance > 0
                      ? '+'
                      : currentUserBalance.netBalance < 0
                      ? '-'
                      : ''}
                    {formatCurrency(Math.abs(currentUserBalance.netBalance), group.currency)}
                  </span>
                  <span className="your-balance-card__status">
                    {currentUserBalance.netBalance < 0
                      ? 'You owe'
                      : currentUserBalance.netBalance > 0
                      ? 'You are owed'
                      : 'All settled up!'}
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* ========================================
              TABS NAVIGATION
              ======================================== */}
          <nav className="tabs-nav">
            <button
              className={`tab-button ${activeTab === 'expenses' ? 'tab-button--active' : ''}`}
              onClick={() => setActiveTab('expenses')}
            >
              Expenses
            </button>
            <button
              className={`tab-button ${activeTab === 'members' ? 'tab-button--active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              Members
            </button>
            <button
              className={`tab-button ${activeTab === 'debts' ? 'tab-button--active' : ''}`}
              onClick={() => setActiveTab('debts')}
            >
              Debts
            </button>
          </nav>

          {/* ========================================
              TAB CONTENT
              ======================================== */}
          <div className="tab-content">
            {/* ========================================
                EXPENSES TAB
                ======================================== */}
            {activeTab === 'expenses' && (
              <section className="expenses-section">
                <div className="section-header">
                  <h2 className="section-title">Expenses</h2>
                  <Button
                    variant="primary"
                    size="compact"
                    onClick={handleAddExpense}
                  >
                    + Add Expense
                  </Button>
                </div>

                {expenses.length === 0 ? (
                  <div className="expenses-empty">
                    <p>No expenses yet.</p>
                    <p>Add your first expense to get started!</p>
                  </div>
                ) : (
                  <div className="expenses-list">
                    {expenses.map((expense) => (
                      <Card
                        key={expense.id}
                        className="expense-card"
                        onClick={() => handleViewExpense(expense)}
                      >
                        <div className="expense-card__content">
                          <div className="expense-card__main">
                            <h3 className="expense-card__title">
                              {expense.description}
                            </h3>
                            <span className="expense-card__date">
                              {formatDate(expense.date)}
                            </span>
                            <span className="expense-card__paidby">
                              Paid by {expense.paidBy.displayName}
                              {expense.paidBy.id === currentUser.id && ' (You)'}
                            </span>
                          </div>
                          <div className="expense-card__amount">
                            <span className="expense-card__value money">
                              {formatCurrency(expense.amount, expense.currency)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ========================================
                MEMBERS TAB
                ======================================== */}
            {activeTab === 'members' && (
              <section className="members-section">
                <div className="section-header">
                  <h2 className="section-title">Members</h2>
                  <Button
                    variant="secondary"
                    size="compact"
                    onClick={() => setIsAddMemberModalOpen(true)}
                  >
                    + Add Member
                  </Button>
                </div>
                <Card>
                  <ul className="members-list">
                    {group.members.map((member) => (
                      <li key={member.user.id} className="member-item">
                        <div className="member-item__info">
                          <span className="member-item__name">
                            {member.user.displayName}
                            {member.user.id === currentUser.id && (
                              <Badge variant="yellow" size="small">
                                You
                              </Badge>
                            )}
                          </span>
                          <span className="member-item__email">{member.user.email}</span>
                          {member.role === 'OWNER' && (
                            <Badge variant="yellow" size="small">
                              Owner
                            </Badge>
                          )}
                        </div>
                        <div className="member-item__actions">
                          {member.user.id !== currentUser.id && (
                            <Button
                              variant="danger"
                              size="compact"
                              onClick={() => {
                                // TODO: Implement remove member
                                console.log('Remove member:', member.user.id);
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              </section>
            )}

            {/* ========================================
                DEBTS TAB
                ======================================== */}
            {activeTab === 'debts' && (
              <section className="balances-section">
                <div className="section-header">
                  <h2 className="section-title">Debts & Settlements</h2>
                </div>

                {/* Member Balances */}
                <Card title="Member Balances" accent="yellow">
                  <ul className="balances-list">
                    {balances.map((balance) => (
                      <li key={balance.id} className="balance-item">
                        <span className="balance-item__name">
                          {balance.name}
                          {balance.id === currentUser.id && (
                            <Badge variant="yellow" size="small">
                              You
                            </Badge>
                          )}
                        </span>
                        <div className="balance-item__values">
                          <span className="balance-item__paid">
                            Paid: {formatCurrency(balance.paid, group.currency)}
                          </span>
                          <span className="balance-item__owed">
                            Owed: {formatCurrency(balance.owed, group.currency)}
                          </span>
                          <span
                            className={`balance-item__net money ${
                              balance.netBalance < 0
                                ? 'balance-item__net--negative'
                                : balance.netBalance > 0
                                ? 'balance-item__net--positive'
                                : ''
                            }`}
                          >
                            {balance.netBalance > 0
                              ? '+'
                              : balance.netBalance < 0
                              ? ''
                              : ''}
                            {formatCurrency(balance.netBalance, group.currency)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Recommended Settlements */}
                <Card title="Settle Up" accent="yellow" className="settlements-card">
                  {debts.length === 0 ? (
                    <div className="settlements-empty">
                      <p>All settled up! No outstanding debts.</p>
                    </div>
                  ) : (
                    <ul className="settlements-list">
                      {debts.map((debt, index) => (
                        <li key={index} className="settlement-item">
                          <div className="settlement-item__info">
                            <span className="settlement-item__flow">
                              <strong>{getUserName(debt.debtor, group.members)}</strong>
                              {debt.debtor === currentUser.id && (
                                <Badge variant="yellow" size="small">
                                  You
                                </Badge>
                              )}
                              <span className="settlement-item__arrow">→</span>
                              <strong>{getUserName(debt.creditor, group.members)}</strong>
                              {debt.creditor === currentUser.id && (
                                <Badge variant="yellow" size="small">
                                  You
                                </Badge>
                              )}
                            </span>
                            <span className="settlement-item__amount money">
                              {formatCurrency(debt.amount, group.currency)}
                            </span>
                          </div>
                          {debt.debtor === currentUser.id && (
                            <Button
                              variant="primary"
                              size="compact"
                              onClick={() => handleSettleDebt(debt)}
                            >
                              Settle
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* ========================================
          MODALS
          ======================================== */}

      {/* Group Settings Modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Group Settings"
      >
        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: Implement save settings
            setIsSettingsModalOpen(false);
          }}
        >
          <div className="form-group">
            <label htmlFor="group-name">Name</label>
            <Input id="group-name" defaultValue={group.name} />
          </div>
          <div className="form-group">
            <label htmlFor="group-description">Description</label>
            <Input id="group-description" defaultValue={group.description || ''} />
          </div>
          <div className="form-group">
            <label htmlFor="group-currency">Currency</label>
            <Input id="group-currency" defaultValue={group.currency} />
          </div>
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setIsSettingsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Add Member"
      >
        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: Implement add member
            setIsAddMemberModalOpen(false);
          }}
        >
          <div className="form-group">
            <label htmlFor="member-email">Member Email</label>
            <Input
              id="member-email"
              type="email"
              placeholder="Enter email address"
            />
          </div>
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setIsAddMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Expense Detail Modal (Add/Edit) */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={handleCloseExpenseModal}
        maxWidth="480px"
      >
        <form
          className="expense-modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: Implement save expense
            handleCloseExpenseModal();
          }}
        >
          {/* Who Paid Section */}
          <div className="expense-modal-section expense-payer-section">
            <label className="expense-modal-label">Who paid</label>
            <Select
              value={expenseForm.paidById}
              options={payerOptions}
              onChange={(value) => setExpenseForm((prev) => ({ ...prev, paidById: value }))}
              className="expense-payer-select-custom"
            />
          </div>

          {/* Amount Section */}
          <div className="expense-modal-section expense-amount-section">
            <input
              type="number"
              className="expense-amount-input"
              placeholder="0"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))}
            />
            <span className="expense-currency-label">{group.currency}</span>
          </div>

          {/* For Whom Section */}
          <div className="expense-modal-section">
            <div className="expense-split-header">
              <label className="expense-modal-label">For whom</label>
              <Select
                value={expenseForm.splitType}
                options={splitTypeOptions}
                onChange={(value) => setExpenseForm((prev) => ({ ...prev, splitType: value as 'EQUAL' | 'EXACT' | 'PERCENTAGE' }))}
                size="compact"
                className="expense-split-select"
              />
            </div>
            <ul className="expense-members-list">
              {group.members.map((member) => {
                const isSelected = expenseForm.selectedMembers.includes(member.user.id);
                const displayAmount = getMemberDisplayAmount(member.user.id);
                return (
                  <li key={member.user.id} className="expense-member-item">
                    <div className="expense-member-info">
                      <div className="expense-member-avatar">
                        {member.user.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="expense-member-details">
                        <span className="expense-member-name">{member.user.displayName}</span>
                        <span className="expense-member-share money">
                          {formatCurrency(displayAmount, group.currency)}
                        </span>
                      </div>
                    </div>
                    <div className="expense-member-actions">
                      {expenseForm.splitType === 'EQUAL' ? (
                        <input
                          type="checkbox"
                          className="expense-member-checkbox"
                          checked={isSelected}
                          onChange={() => toggleMemberSelection(member.user.id)}
                        />
                      ) : (
                        <div className="expense-member-input-group">
                          {expenseForm.splitType === 'EXACT' && (
                            <span className="expense-member-currency">{group.currency}</span>
                          )}
                          <input
                            type="number"
                            className="expense-member-amount-input"
                            placeholder="0"
                            value={getMemberInputValue(member.user.id)}
                            onChange={(e) => updateMemberAmount(member.user.id, e.target.value)}
                          />
                          {expenseForm.splitType === 'PERCENTAGE' && (
                            <span className="expense-member-pct-symbol">%</span>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Purpose Section */}
          <div className="expense-modal-section">
            <label className="expense-modal-label">Purpose</label>
            <Input
              value={expenseForm.description}
              onChange={(e) => setExpenseForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="What was this expense for?"
            />
          </div>

          {/* Date Section */}
          <div className="expense-modal-section">
            <label className="expense-modal-label">Date</label>
            <Input
              type="date"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>

          {/* Actions */}
          <div className="expense-modal-actions">
            {selectedExpense && (
              <Button
                type="button"
                variant="secondary"
                className="expense-delete-btn"
                onClick={() => {
                  // TODO: Implement delete expense
                  console.log('Delete expense:', selectedExpense.id);
                  handleCloseExpenseModal();
                }}
              >
                Delete
              </Button>
            )}
            <Button type="submit" variant="primary" fullWidth>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Settlement Modal */}
      <Modal
        isOpen={isSettlementModalOpen}
        onClose={() => {
          setIsSettlementModalOpen(false);
          setSelectedDebt(null);
        }}
        title="Record Settlement"
      >
        {selectedDebt && (
          <form
            className="modal-form"
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: Implement settlement
              setIsSettlementModalOpen(false);
              setSelectedDebt(null);
            }}
          >
            <div className="settlement-info">
              <p>
                You are settling your debt with{' '}
                <strong>{getUserName(selectedDebt.creditor, group.members)}</strong>
              </p>
              <p className="settlement-amount">
                Amount: <span className="money">{formatCurrency(selectedDebt.amount, group.currency)}</span>
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="settlement-amount">Amount to Settle</label>
              <Input
                id="settlement-amount"
                type="number"
                defaultValue={selectedDebt.amount}
                placeholder="0.00"
              />
            </div>

            <div className="modal-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsSettlementModalOpen(false);
                  setSelectedDebt(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Record Settlement
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default GroupDashboardPage;

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
 * - GET /api/balances/{groupId} - Balances + debts
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Badge, Modal, Input, UserMenu, Select, ProfileModal, DatePicker } from '@/components';
import { authService } from '@/services/authService';
import { groupService, ApiException, type GroupDetail } from '@/services';
import { toastEvents } from '@/components/Toast';
import { config } from '@/config/environment';
import type { GroupMember, Expense, MemberBalance, Debt } from '@/types';
import './GroupDashboardPage.css';

// Helpers
const formatCurrency = (amount: number, currency = 'INR'): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const getUserName = (userId: string, members: GroupMember[]): string =>
  members.find((m) => m.user.id === userId)?.user.displayName || 'Unknown';

// Constants
const SPLIT_TYPE_OPTIONS = [
  { value: 'EQUAL', label: 'Equal split' },
  { value: 'EXACT', label: 'Exact amounts' },
  { value: 'PERCENTAGE', label: 'By percentage' },
];

type TabType = 'expenses' | 'members' | 'debts';

export const GroupDashboardPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser()!;

  // State
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<MemberBalance[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('expenses');

  // Modal states
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    description: '',
    currency: '',
    simplifyDebts: false,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isDeleteConfirmPending, setIsDeleteConfirmPending] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState('');
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
  const [splitError, setSplitError] = useState('');
  const [isSavingExpense, setIsSavingExpense] = useState(false);

  const fetchGroupData = useCallback(async () => {
    if (!groupId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all group data in parallel
      const { group: groupData, expenses: expensesData, balances: balancesData } = 
        await groupService.getGroupDashboardData(groupId);

      setGroup(groupData);
      setExpenses(expensesData);
      setBalances(balancesData.balances);
      setDebts(balancesData.debts);
    } catch (err) {
      console.error('Failed to fetch group data:', err);
      if (err instanceof ApiException) {
        if (err.status === 404) {
          setError('Group not found or you are not a member.');
        } else if (err.status === 401) {
          // Token expired, redirect to login
          authService.logout();
          navigate('/login');
          return;
        } else {
          setError(err.message || 'Failed to load group data.');
        }
      } else {
        setError('Failed to load group data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [groupId, navigate]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleAddExpense = () => {
    setSelectedExpense(null);
    setSplitError('');
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

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setSplitError('');
    // Build memberAmounts from existing shares
    const memberAmounts: Record<string, string> = {};
    expense.shares.forEach((share) => {
      if (expense.splitType === 'PERCENTAGE') {
        // Calculate percentage from amount: (share.amount * 100) / total with 2 decimal accuracy
        const pct = expense.amount > 0 ? (share.amount * 100) / expense.amount : 0;
        memberAmounts[share.userId] = pct.toFixed(2);
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

  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setSelectedExpense(null);
    setSplitError('');
  };

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

  const updateMemberAmount = (memberId: string, value: string) =>
    setExpenseForm((prev) => ({
      ...prev,
      memberAmounts: { ...prev.memberAmounts, [memberId]: value },
    }));

  const getMemberDisplayAmount = (memberId: string): number => {
    const totalAmount = parseFloat(expenseForm.amount) || 0;
    const isSelected = expenseForm.selectedMembers.includes(memberId);
    
    if (!isSelected) return 0;
    
    if (expenseForm.splitType === 'EQUAL') {
      const memberCount = expenseForm.selectedMembers.length;
      // Round down to 2 decimal places for equal splits
      return memberCount > 0 ? Math.floor((totalAmount / memberCount) * 100) / 100 : 0;
    } else if (expenseForm.splitType === 'EXACT') {
      return parseFloat(expenseForm.memberAmounts[memberId]) || 0;
    } else if (expenseForm.splitType === 'PERCENTAGE') {
      const percentage = parseFloat(expenseForm.memberAmounts[memberId]) || 0;
      return (percentage / 100) * totalAmount;
    }
    return 0;
  };

  // Validation for EXACT and PERCENTAGE split types
  const splitValidation = useMemo(() => {
    const totalAmount = parseFloat(expenseForm.amount) || 0;
    
    if (expenseForm.splitType === 'EXACT') {
      const sumOfAmounts = Object.values(expenseForm.memberAmounts)
        .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      const isValid = Math.abs(totalAmount - sumOfAmounts) < 0.01;
      return {
        isValid,
        message: 'Amounts should sum to total',
      };
    }
    
    if (expenseForm.splitType === 'PERCENTAGE') {
      const sumOfPercentages = Object.values(expenseForm.memberAmounts)
        .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      const isValid = Math.abs(100 - sumOfPercentages) < 0.01;
      return {
        isValid,
        message: 'Percentages should sum to 100',
      };
    }
    
    // EQUAL split is always valid
    return { isValid: true, message: '' };
  }, [expenseForm.splitType, expenseForm.amount, expenseForm.memberAmounts]);

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

  const handleSettleDebt = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsSettlementModalOpen(true);
  };

  const isOwner = group?.members.some((m) => m.user.id === currentUser.id && m.role === 'OWNER');
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
            <Link to="/app/groups" className="group-dashboard-header__logo-link">
              <h1 className="group-dashboard-header__title">{config.appName}</h1>
            </Link>

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
                    onClick={() => {
                      setSettingsForm({
                        name: group.name,
                        description: group.description || '',
                        currency: group.currency,
                        simplifyDebts: group.simplifyDebts ?? false,
                      });
                      setIsSettingsModalOpen(true);
                    }}
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
                    variant="primary"
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
                              onClick={async () => {
                                try {
                                  await groupService.removeMember(group.id, member.user.id);
                                  // Remove member from local state
                                  setGroup((prev) => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      members: prev.members.filter((m) => m.user.id !== member.user.id),
                                    };
                                  });
                                } catch (err) {
                                  if (err instanceof ApiException && err.status === 409) {
                                    toastEvents.showError('Cannot remove member with unsettled balance.');
                                  }
                                  // Other errors already show generic toast via api.ts
                                }
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
                        <div className="balance-item__left">
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
                          </div>
                        </div>
                        <span
                          className={`balance-item__net money ${
                            balance.netBalance < 0
                              ? 'balance-item__net--negative'
                              : balance.netBalance > 0
                              ? 'balance-item__net--positive'
                              : ''
                          }`}
                        >
                          {balance.netBalance > 0 ? '+' : ''}
                          {formatCurrency(balance.netBalance, group.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Recommended Settlements */}
                <Card title="Settle Up" accent="yellow" className="settlements-card">
                  {debts.length === 0 ? (
                    <div className="settlements-empty">
                      <p style={{ color: 'black' }}>All settled up! No outstanding debts.</p>
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
        onClose={() => {
          setIsSettingsModalOpen(false);
          setIsDeleteConfirmPending(false);
        }}
        title="Group Settings"
      >
        <form
          className="modal-form"
          onSubmit={async (e) => {
            e.preventDefault();
            
            // Build payload with only changed fields
            const updates: Record<string, string | boolean> = {};
            if (settingsForm.name !== group.name) {
              updates.name = settingsForm.name;
            }
            if (settingsForm.description !== (group.description || '')) {
              updates.description = settingsForm.description;
            }
            if (settingsForm.currency !== group.currency) {
              updates.currency = settingsForm.currency;
            }
            if (settingsForm.simplifyDebts !== (group.simplifyDebts ?? false)) {
              updates.simplifyDebts = settingsForm.simplifyDebts;
            }

            // Skip API call if nothing changed
            if (Object.keys(updates).length === 0) {
              setIsSettingsModalOpen(false);
              return;
            }

            setIsSavingSettings(true);
            try {
              const updatedGroup = await groupService.updateGroup(group.id, updates);
              setGroup(updatedGroup);
              setIsSettingsModalOpen(false);
            } catch (err) {
              console.error('Failed to update group:', err);
              // TODO: Show error toast
            } finally {
              setIsSavingSettings(false);
            }
          }}
        >
          <div className="form-group">
            <label htmlFor="group-name">Name</label>
            <Input
              id="group-name"
              value={settingsForm.name}
              onChange={(e) => setSettingsForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="group-description">Description</label>
            <Input
              id="group-description"
              value={settingsForm.description}
              onChange={(e) => setSettingsForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="group-currency">Currency</label>
            <Input
              id="group-currency"
              value={settingsForm.currency}
              onChange={(e) => setSettingsForm((prev) => ({ ...prev, currency: e.target.value }))}
            />
          </div>
          <div className="form-group form-group--checkbox">
            <label htmlFor="group-simplify-debts" className="checkbox-label">
              <input
                type="checkbox"
                id="group-simplify-debts"
                checked={settingsForm.simplifyDebts}
                onChange={(e) => setSettingsForm((prev) => ({ ...prev, simplifyDebts: e.target.checked }))}
              />
              <span>Simplify debts</span>
            </label>
            <p className="form-hint">When enabled, the app will reduce the number of transactions needed to settle up.</p>
          </div>
          <div className="modal-actions modal-actions--spread">
            <Button
              type="button"
              variant="secondary"
              className="delete-btn"
              disabled={isDeletingGroup}
              onClick={async () => {
                if (!isDeleteConfirmPending) {
                  setIsDeleteConfirmPending(true);
                  return;
                }
                
                setIsDeletingGroup(true);
                try {
                  await groupService.deleteGroup(group.id);
                  navigate('/app/groups');
                } catch (err) {
                  if (err instanceof ApiException && err.status === 409) {
                    toastEvents.showError('Cannot delete group with unsettled balances. Please settle up first.');
                  }
                  setIsDeleteConfirmPending(false);
                } finally {
                  setIsDeletingGroup(false);
                }
              }}
            >
              {isDeletingGroup ? 'Deleting...' : isDeleteConfirmPending ? 'Click again to confirm' : 'Delete'}
            </Button>
            <Button type="submit" variant="primary" disabled={isSavingSettings}>
              {isSavingSettings ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => {
          setIsAddMemberModalOpen(false);
          setAddMemberEmail('');
          setAddMemberError('');
        }}
        title="Add Member"
      >
        <form
          className="modal-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!addMemberEmail.trim() || !groupId) return;
            
            setIsAddingMember(true);
            setAddMemberError('');
            
            try {
              await groupService.addMemberByEmail(groupId, addMemberEmail.trim());
              setIsAddMemberModalOpen(false);
              setAddMemberEmail('');
              // Refresh group data to show new member
              fetchGroupData();
            } catch (err) {
              if (err instanceof ApiException) {
                if (err.status === 404) {
                  setAddMemberError('User not found. Please check the email address.');
                } else if (err.status === 409) {
                  setAddMemberError('Maximum group size reached or user is already a member.');
                } else {
                  setAddMemberError(err.message || 'Failed to add member.');
                }
              } else {
                setAddMemberError('Failed to add member. Please try again.');
              }
            } finally {
              setIsAddingMember(false);
            }
          }}
        >
          <div className="form-group">
            <label htmlFor="member-email">Member Email</label>
            <Input
              id="member-email"
              type="email"
              placeholder="Enter email address"
              value={addMemberEmail}
              onChange={(e) => {
                setAddMemberEmail(e.target.value);
                setAddMemberError('');
              }}
              disabled={isAddingMember}
            />
            {addMemberError && <p className="form-error">{addMemberError}</p>}
          </div>
          <div className="modal-actions">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setIsAddMemberModalOpen(false);
                setAddMemberEmail('');
                setAddMemberError('');
              }}
              disabled={isAddingMember}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isAddingMember || !addMemberEmail.trim()}>
              {isAddingMember ? 'Adding...' : 'Add Member'}
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
          onSubmit={async (e) => {
            e.preventDefault();
            
            // Validate split before saving
            if (!splitValidation.isValid) {
              setSplitError(splitValidation.message);
              return;
            }
            setSplitError('');
            
            // Prevent double submission
            if (isSavingExpense) return;
            setIsSavingExpense(true);
            
            try {
              // Convert date from YYYY-MM-DD to MM-dd-uuuu format for API
              const [year, month, day] = expenseForm.date.split('-');
              const apiDate = `${month}-${day}-${year}`;
              
              // Build members array based on split type
              // Filter out members with 0 amount for EXACT/PERCENTAGE
              let members: { id: string; share?: number }[];
              
              if (expenseForm.splitType === 'EQUAL') {
                // For EQUAL split, just include selected members
                members = expenseForm.selectedMembers.map((id) => ({ id }));
              } else {
                // For EXACT and PERCENTAGE, include share and filter out 0 amounts
                members = Object.entries(expenseForm.memberAmounts)
                  .filter(([, value]) => {
                    const numValue = parseFloat(value) || 0;
                    return numValue > 0;
                  })
                  .map(([id, value]) => ({
                    id,
                    share: parseFloat(value) || 0,
                  }));
              }
              
              const expenseData = {
                amount: parseFloat(expenseForm.amount) || 0,
                date: apiDate,
                currency: group.currency,
                description: expenseForm.description || undefined,
                paidBy: expenseForm.paidById,
                splitType: expenseForm.splitType,
                members,
              };
              
              if (selectedExpense) {
                // Update existing expense
                await groupService.updateExpense(group.id, selectedExpense.id, expenseData);
              } else {
                // Create new expense
                await groupService.createExpense(group.id, expenseData);
              }
              
              // Refresh expenses and balances after creating/updating expense
              const [updatedExpenses, updatedBalances] = await Promise.all([
                groupService.getGroupExpenses(group.id),
                groupService.getGroupBalances(group.id),
              ]);
              setExpenses(updatedExpenses);
              setBalances(updatedBalances.balances);
              setDebts(updatedBalances.debts);
              
              handleCloseExpenseModal();
            } catch (err) {
              // Errors are handled by global toast in api.ts
              console.error('Failed to save expense:', err);
            } finally {
              setIsSavingExpense(false);
            }
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
                options={SPLIT_TYPE_OPTIONS}
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
                            value={expenseForm.memberAmounts[member.user.id] || ''}
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
            {splitError && <span className="field-error">{splitError}</span>}
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
            <DatePicker
              value={expenseForm.date}
              onChange={(date: string) => setExpenseForm((prev) => ({ ...prev, date }))}
            />
          </div>

          {/* Actions */}
          <div className="expense-modal-actions">
            {selectedExpense && (
              <Button
                type="button"
                variant="secondary"
                className="expense-delete-btn"
                onClick={async () => {
                  if (isSavingExpense) return;
                  setIsSavingExpense(true);
                  try {
                    await groupService.deleteExpense(group.id, selectedExpense.id);
                    
                    // Refresh expenses and balances after deleting expense
                    const [updatedExpenses, updatedBalances] = await Promise.all([
                      groupService.getGroupExpenses(group.id),
                      groupService.getGroupBalances(group.id),
                    ]);
                    setExpenses(updatedExpenses);
                    setBalances(updatedBalances.balances);
                    setDebts(updatedBalances.debts);
                    
                    handleCloseExpenseModal();
                  } catch (err) {
                    // Errors are handled by global toast in api.ts
                    console.error('Failed to delete expense:', err);
                  } finally {
                    setIsSavingExpense(false);
                  }
                }}
                disabled={isSavingExpense}
              >
                {isSavingExpense ? 'Deleting...' : 'Delete'}
              </Button>
            )}
            <Button type="submit" variant="primary" fullWidth disabled={isSavingExpense}>
              {isSavingExpense ? 'Saving...' : 'Save'}
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
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await groupService.recordSettlement(group.id, {
                  creditor_id: selectedDebt.creditor,
                  amount: selectedDebt.amount,
                  currency: group.currency,
                });
                
                // Refresh balances after settlement
                const updatedBalances = await groupService.getGroupBalances(group.id);
                setBalances(updatedBalances.balances);
                setDebts(updatedBalances.debts);
                
                setIsSettlementModalOpen(false);
                setSelectedDebt(null);
              } catch (err) {
                // Errors are handled by global toast in api.ts
                console.error('Failed to record settlement:', err);
              }
            }}
          >
            <div className="settlement-info">
              <p>
                You are settling your debt with{' '}
                <strong>{getUserName(selectedDebt.creditor, group.members)}</strong>
              </p>
            </div>

            <div className="settlement-amount-display">
              <span className="settlement-amount-label">Amount</span>
              <span className="settlement-amount-value money">
                {formatCurrency(selectedDebt.amount, group.currency)}
              </span>
            </div>

            <div className="modal-actions">
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

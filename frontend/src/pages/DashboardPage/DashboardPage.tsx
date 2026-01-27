/**
 * Dashboard Page (Groups List + Summary)
 * 
 * Main landing page after login. Shows:
 * - Summary stats (total paid, total owed, net balance)
 * - List of user's groups with quick info
 * - Create group action
 * 
 * Route: /app/groups
 * 
 * APIs:
 * - GET /api/groups - Fetches user's groups
 * - GET /api/balances - Fetches balance summary per group
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, UserMenu, CreateGroupModal } from '@/components';
import { authService } from '@/services/authService';
import { api } from '@/services/api';
import { config } from '@/config/environment';
import './DashboardPage.css';

// ========================================
// API RESPONSE TYPES
// ========================================

/** Group item from GET /api/groups */
interface GroupResponse {
  id: string;
  name: string;
  description?: string;
}

/** Balance item from GET /api/balances */
interface BalanceResponse {
  groupId: string;
  groupName: string;
  paid: number;
  owed: number;
  netBalance: number;
}

/** Aggregated dashboard stats */
interface DashboardStats {
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

/**
 * Format currency amount for display.
 * Uses INR formatting by default.
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
 * DashboardPage displays the user's groups and overall balance summary.
 * Fetches data from /api/groups and /api/balances endpoints.
 */
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  // User is guaranteed to exist because ProtectedRoute checks auth
  const user = authService.getCurrentUser()!;

  // State for groups and balances
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPaid: 0,
    totalOwed: 0,
    netBalance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  /**
   * Fetch groups and balances on component mount
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch groups and balances in parallel
        const [groupsData, balancesData] = await Promise.all([
          api.get<GroupResponse[]>('/groups'),
          api.get<BalanceResponse[]>('/balances'),
        ]);

        setGroups(groupsData);

        // Aggregate balance stats
        const aggregatedStats = balancesData.reduce(
          (acc, balance) => ({
            totalPaid: acc.totalPaid + balance.paid,
            totalOwed: acc.totalOwed + balance.owed,
            netBalance: acc.netBalance + balance.netBalance,
          }),
          { totalPaid: 0, totalOwed: 0, netBalance: 0 }
        );
        setStats(aggregatedStats);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /**
   * Handle group card click - navigate to group details
   */
  const handleGroupClick = (groupId: string) => {
    navigate(`/app/groups/${groupId}`);
  };

  /**
   * Handle logout action
   */
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  /**
   * Handle successful group creation - navigate to the new group
   */
  const handleGroupCreated = (groupId: string) => {
    setIsCreateModalOpen(false);
    navigate(`/app/groups/${groupId}`);
  };

  return (
    <div className="dashboard-page">
      {/* ========================================
          HEADER
          ======================================== */}
      <header className="dashboard-header">
        <div className="container">
          <div className="dashboard-header__content">
            {/* Logo/Title */}
            <Link to="/app/groups" className="dashboard-header__logo-link">
              <h1 className="dashboard-header__title">{config.appName}</h1>
            </Link>
            
            {/* User menu dropdown */}
            <UserMenu 
              displayName={user.displayName} 
              onLogout={handleLogout} 
            />
          </div>
        </div>
      </header>

      {/* ========================================
          MAIN CONTENT
          ======================================== */}
      <main className="dashboard-main">
        <div className="container">
          {/* Loading State */}
          {isLoading && (
            <div className="dashboard-loading">
              <p>Loading your dashboard...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="dashboard-error">
              <p>{error}</p>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          )}

          {/* Content (only show when not loading and no error) */}
          {!isLoading && !error && (
            <>
          {/* ========================================
              SUMMARY SECTION
              ======================================== */}
          <section className="dashboard-summary">
            <h2 className="section-title">Your Summary</h2>
            
            <div className="summary-cards">
              {/* You Paid */}
              <div className="summary-card">
                <span className="summary-card__label">You Paid</span>
                <span className="summary-card__value money">
                  {formatCurrency(stats.totalPaid)}
                </span>
              </div>

              {/* You Owe */}
              <div className="summary-card">
                <span className="summary-card__label">You Owe</span>
                <span className="summary-card__value money">
                  {formatCurrency(stats.totalOwed)}
                </span>
              </div>

              {/* Net Balance */}
              <div className={`summary-card ${stats.netBalance < 0 ? 'summary-card--negative' : stats.netBalance > 0 ? 'summary-card--positive' : ''}`}>
                <span className="summary-card__label">Balance</span>
                <span className="summary-card__value money">
                  {stats.netBalance > 0 ? '+' : stats.netBalance < 0 ? '-' : ''}{formatCurrency(Math.abs(stats.netBalance))}
                </span>
              </div>
            </div>
          </section>

          {/* ========================================
              GROUPS SECTION
              ======================================== */}
          <section className="dashboard-groups">
            <div className="section-header">
              <h2 className="section-title">Your Groups</h2>
              <Button variant="primary" size="compact" onClick={() => setIsCreateModalOpen(true)}>
                + Create Group
              </Button>
            </div>

            {/* Groups list */}
            {groups.length === 0 ? (
              <div className="groups-empty">
                <p>You're not part of any groups yet.</p>
                <p>Create a group to start splitting expenses!</p>
              </div>
            ) : (
              <div className="groups-list">
                {groups.map((group) => (
                  <Card
                    key={group.id}
                    className="group-card"
                    onClick={() => handleGroupClick(group.id)}
                  >
                    <div className="group-card__content">
                      {/* Group info */}
                      <div className="group-card__info">
                        <h3 className="group-card__name">{group.name}</h3>
                        {group.description && (
                          <p className="group-card__description">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="group-card__chevron">➜</span>
                  </Card>
                ))}
              </div>
            )}
          </section>
            </>
          )}
        </div>
      </main>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
};

export default DashboardPage;

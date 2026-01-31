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
import { Card, Button, UserMenu, CreateGroupModal, ProfileModal } from '@/components';
import { authService } from '@/services/authService';
import { api } from '@/services/api';
import { config } from '@/config/environment';
import type { User } from '@/types';
import './DashboardPage.css';

// API Response Types
interface GroupResponse {
  id: string;
  name: string;
  description?: string;
}

interface BalanceResponse {
  groupId: string;
  groupName: string;
  paid: number;
  owed: number;
  netBalance: number;
}

interface DashboardStats {
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

const formatCurrency = (amount: number, currency = 'INR'): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User>(authService.getCurrentUser()!);
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalPaid: 0, totalOwed: 0, netBalance: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [groupsData, balancesData] = await Promise.all([
          api.get<GroupResponse[]>('/groups'),
          api.get<BalanceResponse[]>('/balances'),
        ]);

        setGroups(groupsData);
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

  const handleGroupClick = (groupId: string) => navigate(`/app/groups/${groupId}`);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

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

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={(user) => setCurrentUser(user)}
      />
    </div>
  );
};

export default DashboardPage;

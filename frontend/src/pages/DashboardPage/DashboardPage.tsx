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
 * TODO: Integrate with GET /api/groups and balance aggregation when connecting to backend
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, UserMenu } from '@/components';
import { authService } from '@/services/authService';
import { 
  mockGroups, 
  mockDashboardStats 
} from '@/data/mockData';
import { config } from '@/config/environment';
import './DashboardPage.css';

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
 * Uses real user data from login, with mock data for groups/stats.
 */
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  // User is guaranteed to exist because ProtectedRoute checks auth
  const user = authService.getCurrentUser()!;
  const stats = mockDashboardStats;
  const groups = mockGroups;

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

  return (
    <div className="dashboard-page">
      {/* ========================================
          HEADER
          ======================================== */}
      <header className="dashboard-header">
        <div className="container">
          <div className="dashboard-header__content">
            {/* Logo/Title */}
            <h1 className="dashboard-header__title">{config.appName}</h1>
            
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
          {/* ========================================
              SUMMARY SECTION
              ======================================== */}
          <section className="dashboard-summary">
            <h2 className="section-title">Your Summary</h2>
            
            <div className="summary-cards">
              {/* Total Paid */}
              <div className="summary-card">
                <span className="summary-card__label">Total Paid</span>
                <span className="summary-card__value money">
                  {formatCurrency(stats.totalPaid)}
                </span>
              </div>

              {/* Total Owed */}
              <div className="summary-card">
                <span className="summary-card__label">Total Owed</span>
                <span className="summary-card__value money">
                  {formatCurrency(stats.totalOwed)}
                </span>
              </div>

              {/* Net Balance */}
              <div className={`summary-card ${stats.netBalance < 0 ? 'summary-card--negative' : 'summary-card--positive'}`}>
                <span className="summary-card__label">Balance</span>
                <span className="summary-card__value money">
                  {formatCurrency(Math.abs(stats.netBalance))}
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
              <Button variant="primary" size="compact">
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

                      {/* Show owner badge only if user owns the group */}
                      {group.createdBy.id === user.id && (
                        <div className="group-card__meta">
                          <Badge variant="yellow">Owner</Badge>
                        </div>
                      )}
                    </div>

                    {/* Chevron indicator */}
                    <span className="group-card__chevron">→</span>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;

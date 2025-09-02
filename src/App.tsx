import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import EnterpriseDashboard from './pages/EnterpriseDashboard';
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import NewTicketPage from './pages/NewTicketPage';
import UserManagementPage from './pages/UserManagementPage';
import TeamPage from './pages/TeamPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  // Debug logging
  console.log('🔍 App.tsx Debug:', { user, loading, userRole: user?.role });

  if (loading) {
    console.log('⏳ App is loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-bnu-light-grey">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    console.log('❌ No user found, redirecting to login');
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  console.log('✅ User authenticated:', user.name, 'Role:', user.role);

  // Supreme Admin sees Enterprise Dashboard instead of regular dashboard
  if (user.role === 'supreme_admin') {
    console.log('👑 Supreme Admin detected, routing to Enterprise Dashboard');
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/enterprise" replace />} />
          <Route path="/enterprise" element={<EnterpriseDashboard />} />
          <Route path="/enterprise/:tab" element={<EnterpriseDashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/enterprise" replace />} />
        </Routes>
      </Layout>
    );
  }

  console.log('👤 Regular user detected, routing to Dashboard');
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/tickets/new" element={<NewTicketPage />} />
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {user.role === 'admin' && (
          <Route path="/users" element={<UserManagementPage />} />
        )}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;

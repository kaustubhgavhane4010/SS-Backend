import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ticketsAPI } from '../services/api';
import { DashboardStats, Ticket } from '../types';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Users,
  Settings,
  ArrowRight,
  Inbox,
  Activity,
  FileText,
  MessageSquare,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import TicketCard from '../components/TicketCard';
import { formatDistanceToNow } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, ticketsResponse] = await Promise.all([
        ticketsAPI.getDashboardStats(),
        ticketsAPI.getTickets({ limit: 5, sort: 'created_at', order: 'desc' }),
      ]);

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      if (ticketsResponse.data.success) {
        setRecentTickets(ticketsResponse.data.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Open Tickets',
      value: stats?.totalOpenTickets || 0,
      icon: FileText,
      color: 'bg-gradient-primary',
      change: '+12%',
      changeType: 'positive',
      description: 'Active support requests',
    },
    {
      title: 'My Assigned Tickets',
      value: stats?.myAssignedTickets || 0,
      icon: Clock,
      color: 'bg-gradient-secondary',
      change: '+5%',
      changeType: 'positive',
      description: 'Tickets assigned to you',
    },
    {
      title: 'High Priority',
      value: stats?.highPriorityTickets || 0,
      icon: AlertTriangle,
      color: 'bg-gradient-to-r from-warning-500 to-warning-600',
      change: '+8%',
      changeType: 'negative',
      description: 'Urgent tickets requiring attention',
    },
    {
      title: 'Resolved Today',
      value: stats?.resolvedToday || 0,
      icon: CheckCircle,
      color: 'bg-gradient-to-r from-success-500 to-success-600',
      change: '+15%',
      changeType: 'positive',
      description: 'Successfully closed today',
    },
  ];

  const quickActions = [
    {
      title: 'Create New Ticket',
      description: 'Submit a new support request',
      icon: Plus,
      href: '/tickets/new',
      color: 'bg-gradient-primary',
    },
    {
      title: 'View All Tickets',
      description: 'Browse all support tickets',
      icon: FileText,
      href: '/tickets',
      color: 'bg-gradient-secondary',
    },
    {
      title: 'Team Overview',
      description: 'See team performance metrics',
      icon: Users,
      href: '/team',
      color: 'bg-gradient-accent',
    },
    {
      title: 'Settings',
      description: 'Configure your preferences',
      icon: Settings,
      href: '/settings',
      color: 'bg-gradient-to-r from-neutral-500 to-neutral-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-2xl p-8 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`
          }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/10 rounded-full blur-lg animate-pulse-gentle"></div>
        
        <div className="relative z-10">
                      <h1 className="text-4xl font-bold mb-2">
              Welcome back, <span className="text-white drop-shadow-lg">{user?.name}</span>
              <span className="inline-block ml-2 animate-bounce-gentle">•</span>
            </h1>
          <p className="text-xl text-white/80 mb-6">
            Here's what's happening with your student support system today.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
              <Activity className="w-5 h-5" />
              <span className="text-sm font-medium">System Status: All Good</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">{stats?.totalOpenTickets || 0} Open Tickets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={`stat-card ${stat.color} text-white animate-slide-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-white/20 backdrop-blur-md rounded-xl animate-scale-bounce`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span className={stat.changeType === 'positive' ? 'text-green-300' : 'text-red-300'}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-white/80 text-sm mb-2">{stat.title}</p>
              <p className="text-white/60 text-xs">{stat.description}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Outstanding Tickets */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900">Outstanding Tickets</h2>
            </div>
            <Link
              to="/tickets"
              className="px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentTickets.length > 0 ? (
              recentTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} compact />
              ))
            ) : (
              <div className="empty-state">
                <Inbox className="empty-state-icon" />
                <h3 className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse-gentle"></span>
                  All clear!
                </h3>
                <p>No outstanding tickets right now.</p>
              </div>
            )}
          </div>


        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <Activity className="w-5 h-5 text-secondary-600" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900">Recent Activity</h2>
            </div>
            <Link
              to="/activity"
              className="px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentTickets.slice(0, 5).map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="block bg-neutral-50 rounded-lg p-4 border border-neutral-200 hover:bg-neutral-100 transition-colors duration-200"
              >
                <p className="font-medium text-neutral-900 mb-1">
                  New ticket from <span className="font-semibold">{ticket.student_name}</span>
                </p>
                <p className="text-sm text-neutral-600 truncate">{ticket.title}</p>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-neutral-500">Priority: {ticket.priority}</span>
                  <span className="text-neutral-500">
                    {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                  </span>
                </div>
              </Link>
            ))}
          </div>

                      {recentTickets.length === 0 && (
              <div className="empty-state">
                <Inbox className="empty-state-icon" />
                <h3 className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-gentle"></span>
                  Nothing happening yet
                </h3>
                <p>Activity will appear here as tickets are created and updated.</p>
              </div>
            )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.href}
                className={`${action.color} p-6 rounded-xl text-white hover:scale-105 transition-all duration-200 group`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-white/80 text-sm">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

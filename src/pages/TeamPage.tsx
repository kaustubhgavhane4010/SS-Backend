import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { User } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  Users, 
  UserCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Star,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Mail as MailIcon,
  MessageSquare
} from 'lucide-react';

const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load team members
  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUsers();
      if (response.data.success) {
        setTeamMembers(response.data.data);
      } else {
        toast.error('Failed to load team members');
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  // Filter team members
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get role badge styling
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-error-500 to-error-600 text-white';
      case 'staff':
        return 'bg-gradient-to-r from-primary-500 to-primary-600 text-white';
      default:
        return 'bg-neutral-200 text-neutral-700';
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-success-500 to-success-600 text-white';
      case 'inactive':
        return 'bg-gradient-to-r from-neutral-400 to-neutral-500 text-white';
      default:
        return 'bg-neutral-200 text-neutral-700';
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'staff':
        return <UserCheck className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Team Management</h1>
              <p className="text-neutral-600">Manage your support team members and their roles</p>
            </div>
            {user?.role === 'admin' && (
              <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Member
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total Members</p>
                  <p className="text-2xl font-bold text-neutral-900">{teamMembers.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Active Members</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {teamMembers.filter(m => m.status === 'active').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-success-500 to-success-600 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Admins</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {teamMembers.filter(m => m.role === 'admin').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-error-500 to-error-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Support Staff</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {teamMembers.filter(m => m.role === 'staff').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner />
              <p className="text-neutral-600 mt-4">Loading team members...</p>
            </div>
          ) : filteredMembers.length > 0 ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-900">
                    {filteredMembers.length} team member{filteredMembers.length !== 1 ? 's' : ''} found
                  </h3>
                </div>
              </div>

              {/* Team Members */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="bg-gradient-to-br from-white to-neutral-50 rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-all duration-200">
                    {/* Member Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
      <div>
                          <h3 className="font-semibold text-neutral-900">{member.name}</h3>
                          <p className="text-sm text-neutral-600">{member.email}</p>
                        </div>
                      </div>
                      {user?.role === 'admin' && (
                        <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Role and Status */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(member.role)}`}>
                        {getRoleIcon(member.role)}
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(member.status)}`}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Phone className="w-4 h-4" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      {member.department && (
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <MapPin className="w-4 h-4" />
                          <span>{member.department}</span>
                        </div>
                      )}
                    </div>

                    {/* Member Since */}
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {formatDate(member.created_at)}</span>
      </div>
      
                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-neutral-200">
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
                        <MailIcon className="w-4 h-4" />
                        Message
                      </button>
                      {user?.role === 'admin' && (
                        <>
                          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-error-600 hover:text-error-700 hover:bg-error-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No team members found</h3>
              <p className="text-neutral-600 mb-6">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'No team members have been added yet'}
              </p>
              {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;

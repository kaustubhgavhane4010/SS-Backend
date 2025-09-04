import React, { useState, useEffect } from 'react';
import { User, Organization, EnterpriseStats } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, Users, Building, BarChart3, UserPlus, Building2, X, Edit, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const EnterpriseDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState<EnterpriseStats | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Check if user is Admin (not Supreme Admin)
  const isAdmin = user?.role === 'admin';
  
  // Modal states
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showEditOrg, setShowEditOrg] = useState(false);
  
  // Edit data states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  
  // Form states
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'team_member',
    organization_id: '',
    department: '',
    phone: ''
  });
  
  const [newOrganization, setNewOrganization] = useState({
    name: '',
    type: 'company',
    status: 'active',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    foundingYear: '',
    accreditation: '',
    departments: [] as string[],
    campuses: [] as string[]
  });
  
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    organization_id: ''
  });

  // State for dynamic department and campus inputs
  const [newDepartment, setNewDepartment] = useState('');
  const [newCampus, setNewCampus] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Set default organization when organizations are loaded
  useEffect(() => {
    if (organizations.length > 0 && !newUser.organization_id) {
      setNewUser(prev => ({ ...prev, organization_id: organizations[0].id }));
    }
  }, [organizations, newUser.organization_id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (isAdmin) {
        // Admin users - use organization-scoped endpoints
        const [statsRes, orgsRes, usersRes] = await Promise.all([
          api.get('/admin/dashboard-stats'),
          api.get('/organizational/organizations'),
          api.get('/admin/users')
        ]);

        if (statsRes.data?.success) {
          // Transform admin stats to match enterprise stats format
          const adminStats = statsRes.data.data;
          setStats({
            organizations: {
              total_organizations: 1,
              companies: adminStats.organization.type === 'company' ? 1 : 0,
              universities: adminStats.organization.type === 'university' ? 1 : 0,
              departments: adminStats.organization.type === 'department' ? 1 : 0,
            },
            users: {
              total_users: adminStats.stats.total_users,
              admins: 0, // Admin can't see other admins
              university_admins: adminStats.stats.university_admins,
              senior_leadership: adminStats.stats.senior_leadership,
              deans: adminStats.stats.deans,
              managers: adminStats.stats.managers,
              team_members: adminStats.stats.team_members,
            },
            recentUsers: adminStats.recentUsers
          });
        }
        
        // Set organizations for admin (all organizations they can see)
        if (orgsRes.data?.success) {
          setOrganizations(orgsRes.data.data);
        }
        
        if (usersRes.data?.success) setUsers(usersRes.data.data);
      } else {
        // Supreme Admin users - use enterprise endpoints
        console.log('Loading data for Supreme Admin...');
        const [statsRes, orgsRes, usersRes] = await Promise.all([
          api.get('/organizational/enterprise-stats'),
          api.get('/organizational/organizations'),
          api.get('/organizational/users')
        ]);

        console.log('API Responses:', {
          stats: statsRes.data,
          organizations: orgsRes.data,
          users: usersRes.data
        });

        if (statsRes.data?.success) {
          console.log('Setting stats:', statsRes.data.data);
          setStats(statsRes.data.data);
        } else {
          console.log('Stats API failed:', statsRes.data);
        }
        
        if (orgsRes.data?.success) {
          console.log('Setting organizations:', orgsRes.data.data);
          setOrganizations(orgsRes.data.data);
        } else {
          console.log('Organizations API failed:', orgsRes.data);
        }
        
        if (usersRes.data?.success) {
          console.log('Setting users:', usersRes.data.data);
          setUsers(usersRes.data.data);
        } else {
          console.log('Users API failed:', usersRes.data);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set default empty data to prevent blank dashboard
      setStats({
        organizations: { total_organizations: 0, companies: 0, universities: 0, departments: 0 },
        users: { total_users: 0, admins: 0, university_admins: 0, senior_leadership: 0, deans: 0, managers: 0, team_members: 0 },
        recentUsers: []
      });
      setOrganizations([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    // Debug: Log the current form state
    console.log('Form data:', newUser);
    
    // Validate required fields
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim() || !newUser.role || !newUser.organization_id) {
      console.log('Validation failed:', {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        password: newUser.password.trim(),
        role: newUser.role,
        organization_id: newUser.organization_id
      });
      alert('Please fill in all required fields: Name, Email, Password, Role, and Organization are mandatory.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Validate password length
    if (newUser.password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    try {
      const endpoint = isAdmin ? '/admin/users' : '/organizational/users';
      const userData = isAdmin ? {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        department: newUser.department,
        phone: newUser.phone
      } : newUser;
      
      const response = await api.post(endpoint, userData);
      if (response.data?.success) {
        alert('User created successfully!');
        setShowCreateUser(false);
        setNewUser({ name: '', email: '', password: '', role: 'team_member', organization_id: '', department: '', phone: '' });
        loadDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  // Helper functions for managing departments and campuses
  const addDepartment = () => {
    if (newDepartment.trim() && !newOrganization.departments.includes(newDepartment.trim())) {
      setNewOrganization({
        ...newOrganization,
        departments: [...newOrganization.departments, newDepartment.trim()]
      });
      setNewDepartment('');
    }
  };

  const removeDepartment = (index: number) => {
    setNewOrganization({
      ...newOrganization,
      departments: newOrganization.departments.filter((_, i) => i !== index)
    });
  };

  const addCampus = () => {
    if (newCampus.trim() && !newOrganization.campuses.includes(newCampus.trim())) {
      setNewOrganization({
        ...newOrganization,
        campuses: [...newOrganization.campuses, newCampus.trim()]
      });
      setNewCampus('');
    }
  };

  const removeCampus = (index: number) => {
    setNewOrganization({
      ...newOrganization,
      campuses: newOrganization.campuses.filter((_, i) => i !== index)
    });
  };

  const handleCreateOrganization = async () => {
    try {
      // Validate required fields
      if (!newOrganization.name.trim()) {
        alert('Organization name is required!');
        return;
      }
      
      console.log('Creating organization with data:', newOrganization);
      
      // Both Admin and Supreme Admin can create organizations using the same endpoint
      const response = await api.post('/organizational/organizations', newOrganization);
      if (response.data?.success) {
        alert('Organization created successfully!');
        setShowCreateOrg(false);
        setNewOrganization({ 
          name: '', 
          type: 'company', 
          status: 'active',
          description: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          foundingYear: '',
          accreditation: '',
          departments: [],
          campuses: []
        });
        
        // For Admin users, refresh data to show the new organization
        if (isAdmin) {
          // Admin users need to refresh their organization list
          const orgsRes = await api.get('/organizational/organizations');
          if (orgsRes.data?.success) {
            const allOrgs = orgsRes.data.data;
            // Filter to show only organizations created by this admin or their own organization
            const filteredOrgs = allOrgs.filter((org: Organization) => 
              org.created_by === user?.id || org.id === user?.organization_id
            );
            setOrganizations(filteredOrgs);
          }
        } else {
          // Supreme Admin - refresh all data
          loadDashboardData();
        }
      }
    } catch (error: any) {
      console.error('Failed to create organization:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Failed to create organization: ${errorMessage}`);
    }
  };

  const handleCreateTeam = async () => {
    try {
      // For now, just show a success message since team functionality is coming soon
      alert('Team creation functionality is coming soon!');
      setShowCreateTeam(false);
      setNewTeam({ name: '', description: '', organization_id: '' });
    } catch (error) {
      console.error('Failed to create team:', error);
      alert('Failed to create team. Please try again.');
    }
  };

  // Edit and Delete handlers for Organizations
  const handleEditOrganization = (org: Organization) => {
    console.log('Edit organization clicked:', org);
    setEditingOrg(org);
    setShowEditOrg(true);
  };

  const handleDeleteOrganization = async (orgId: string | number) => {
    console.log('Delete organization clicked, ID:', orgId, 'Type:', typeof orgId);
    
    if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      try {
        console.log('Making delete request to:', `/organizational/organizations/${orgId}`);
        const response = await api.delete(`/organizational/organizations/${orgId}`);
        console.log('Delete response:', response);
        
        if (response.data?.success) {
          alert('Organization deleted successfully!');
          loadDashboardData(); // Refresh data
        }
      } catch (error) {
        console.error('Delete organization error:', error);
        alert('Failed to delete organization. Please try again.');
      }
    }
  };

  // Edit and Delete handlers for Users
  const handleEditUser = (user: User) => {
    console.log('Edit user clicked:', user);
    setEditingUser(user);
    setShowEditUser(true);
  };

  const handleDeleteUser = async (userId: string | number) => {
    console.log('Delete user clicked, ID:', userId, 'Type:', typeof userId);
    
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        console.log('Making delete request to:', `/organizational/users/${userId}`);
        const response = await api.delete(`/organizational/users/${userId}`);
        console.log('Delete response:', response);
        
        if (response.data?.success) {
          alert('User deleted successfully!');
          loadDashboardData(); // Refresh data
        }
      } catch (error) {
        console.error('Delete user error:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'supreme_admin': 'Supreme Admin',
      'admin': 'Admin',
      'university_admin': 'University Admin',
      'senior_leadership': 'Senior Leadership',
      'dean': 'Dean',
      'manager': 'Manager',
      'team_member': 'Team Member'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      'supreme_admin': 'bg-purple-600',
      'admin': 'bg-blue-600',
      'university_admin': 'bg-green-600',
      'senior_leadership': 'bg-yellow-600',
      'dean': 'bg-orange-600',
      'manager': 'bg-indigo-600',
      'team_member': 'bg-gray-600'
    };
    return colorMap[role] || 'bg-gray-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Get current tab from URL
  const currentTab = searchParams.get('tab') || 'overview';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Content based on current tab */}
      {currentTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Organizations</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.organizations.total_organizations}</p>

                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.users.total_users}</p>

                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Companies</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.organizations.companies}</p>

                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Universities</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.organizations.universities}</p>

                </div>
              </div>
            </div>
          </div>

          {/* Role Distribution */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">User Role Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.users).map(([key, value]) => {
                  if (key === 'total_users') return null;
                  const roleName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  return (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{value}</div>
                      <div className="text-sm text-gray-500">{roleName}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Users - Hidden for Admin users to protect privacy */}
          {!isAdmin && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Users</h3>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {stats.recentUsers.map((user) => (
                    <li key={user.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRoleColor(user.role)}`}>
                            <span className="text-white text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)} text-white`}>
                            {getRoleDisplayName(user.role)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          )}
        </div>
      )}

      {currentTab === 'organizations' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Organizations</h3>
              <button 
                onClick={() => setShowCreateOrg(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Organization
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {organizations.map((org) => (
                    <tr key={org.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{org.name}</div>
                          {org.settings?.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">{org.settings.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{org.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {org.type === 'university' && (
                            <div className="space-y-1">
                              {org.settings?.foundingYear && (
                                <div>Founded: {org.settings.foundingYear}</div>
                              )}
                                  {org.settings?.departments && org.settings.departments.length > 0 && (
                                <div>Departments: {org.settings.departments.length}</div>
                              )}
                              {org.settings?.campuses && org.settings.campuses.length > 0 && (
                                <div>Campuses: {org.settings.campuses.length}</div>
                              )}
                            </div>
                          )}
                          {org.settings?.address && (
                            <div className="truncate max-w-xs">{org.settings.address}</div>
                          )}
                          {org.settings?.phone && (
                            <div>{org.settings.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{org.created_by_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(org.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditOrganization(org)}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded text-xs flex items-center gap-1"
                          >
                            <Edit size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteOrganization(org.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs flex items-center gap-1"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'users' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Users</h3>
              <button 
                onClick={() => setShowCreateUser(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRoleColor(user.role)}`}>
                            <span className="text-white text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)} text-white`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.organization_name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded text-xs flex items-center gap-1"
                          >
                            <Edit size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs flex items-center gap-1"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'teams' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Team Structure</h3>
              <button 
                onClick={() => setShowCreateTeam(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Create Team
              </button>
            </div>
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Team Management</h3>
              <p className="text-gray-500">View and manage team structures across your organizations</p>
              <p className="text-sm text-gray-400 mt-2">Coming soon...</p>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'analytics' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Analytics & Reports</h3>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center gap-2">
                <BarChart3 size={16} />
                Generate Report
              </button>
            </div>
            <div className="text-center py-12">
              <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h3>
              <p className="text-gray-500">Enterprise-wide performance metrics and insights</p>
              <p className="text-sm text-gray-400 mt-2">Coming soon...</p>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white p-8 border border-gray-300 rounded-lg shadow-xl w-full max-w-md max-h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New User</h3>
              <button onClick={() => setShowCreateUser(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  id="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  id="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role <span className="text-red-500">*</span></label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="team_member">Team Member</option>
                  <option value="manager">Manager</option>
                  <option value="dean">Dean</option>
                  <option value="senior_leadership">Senior Leadership</option>
                  <option value="university_admin">University Admin</option>
                  {!isAdmin && (
                    <>
                  <option value="admin">Admin</option>
                  <option value="supreme_admin">Supreme Admin</option>
                    </>
                  )}
                </select>
              </div>
              {!isAdmin && (
              <div>
                <label htmlFor="organization_id" className="block text-sm font-medium text-gray-700">Organization <span className="text-red-500">*</span></label>
                <select
                  id="organization_id"
                  value={newUser.organization_id}
                  onChange={(e) => setNewUser({ ...newUser, organization_id: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              )}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  id="department"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCreateUser(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Organization Modal */}
      {showCreateOrg && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white p-8 border border-gray-300 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Organization</h3>
              <button onClick={() => setShowCreateOrg(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">Organization Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="orgName"
                  value={newOrganization.name}
                  onChange={(e) => setNewOrganization({ ...newOrganization, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter organization name"
                />
              </div>
              <div>
                <label htmlFor="orgType" className="block text-sm font-medium text-gray-700">Type <span className="text-red-500">*</span></label>
                <select
                  id="orgType"
                  value={newOrganization.type}
                  onChange={(e) => setNewOrganization({ ...newOrganization, type: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="company">Company</option>
                  <option value="university">University</option>
                  <option value="government">Government</option>
                  <option value="non-profit">Non-Profit</option>
                </select>
              </div>
              </div>

              <div>
                <label htmlFor="orgDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="orgDescription"
                  value={newOrganization.description}
                  onChange={(e) => setNewOrganization({ ...newOrganization, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows={3}
                  placeholder="Brief description of the organization"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="orgAddress" className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    id="orgAddress"
                    value={newOrganization.address}
                    onChange={(e) => setNewOrganization({ ...newOrganization, address: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Street address, city, country"
                  />
                </div>
                <div>
                  <label htmlFor="orgPhone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    id="orgPhone"
                    value={newOrganization.phone}
                    onChange={(e) => setNewOrganization({ ...newOrganization, phone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="orgEmail" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="orgEmail"
                    value={newOrganization.email}
                    onChange={(e) => setNewOrganization({ ...newOrganization, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="contact@organization.com"
                  />
                </div>
                <div>
                  <label htmlFor="orgWebsite" className="block text-sm font-medium text-gray-700">Website</label>
                  <input
                    type="url"
                    id="orgWebsite"
                    value={newOrganization.website}
                    onChange={(e) => setNewOrganization({ ...newOrganization, website: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://www.organization.com"
                  />
                </div>
              </div>

              {/* University-specific fields */}
              {newOrganization.type === 'university' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="orgFoundingYear" className="block text-sm font-medium text-gray-700">Founding Year</label>
                      <input
                        type="number"
                        id="orgFoundingYear"
                        value={newOrganization.foundingYear}
                        onChange={(e) => setNewOrganization({ ...newOrganization, foundingYear: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., 1965"
                        min="1800"
                        max="2024"
                      />
                    </div>
                    <div>
                      <label htmlFor="orgAccreditation" className="block text-sm font-medium text-gray-700">Accreditation</label>
                      <input
                        type="text"
                        id="orgAccreditation"
                        value={newOrganization.accreditation}
                        onChange={(e) => setNewOrganization({ ...newOrganization, accreditation: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., AACSB, ABET, etc."
                      />
                    </div>
                  </div>

                  {/* Departments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Departments</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Add department (e.g., Computer Science)"
                        onKeyPress={(e) => e.key === 'Enter' && addDepartment()}
                      />
                      <button
                        type="button"
                        onClick={addDepartment}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                    {newOrganization.departments.length > 0 && (
                      <div className="space-y-1">
                        {newOrganization.departments.map((dept, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                            <span className="text-sm">{dept}</span>
                            <button
                              type="button"
                              onClick={() => removeDepartment(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Campuses */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campuses</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newCampus}
                        onChange={(e) => setNewCampus(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Add campus (e.g., Main Campus, North Campus)"
                        onKeyPress={(e) => e.key === 'Enter' && addCampus()}
                      />
                      <button
                        type="button"
                        onClick={addCampus}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                    {newOrganization.campuses.length > 0 && (
                      <div className="space-y-1">
                        {newOrganization.campuses.map((campus, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                            <span className="text-sm">{campus}</span>
                            <button
                              type="button"
                              onClick={() => removeCampus(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <label htmlFor="orgStatus" className="block text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
                <select
                  id="orgStatus"
                  value={newOrganization.status}
                  onChange={(e) => setNewOrganization({ ...newOrganization, status: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowCreateOrg(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrganization}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Create Organization
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white p-8 border border-gray-300 rounded-lg shadow-xl w-full max-w-md max-h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Team</h3>
              <button onClick={() => setShowCreateTeam(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">Team Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="teamName"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="teamDescription"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="organizationForTeam" className="block text-sm font-medium text-gray-700">Organization <span className="text-red-500">*</span></label>
                <select
                  id="organizationForTeam"
                  value={newTeam.organization_id}
                  onChange={(e) => setNewTeam({ ...newTeam, organization_id: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCreateTeam(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTeam}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Create Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white p-8 border border-gray-300 rounded-lg shadow-xl w-full max-w-md max-h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
              <button onClick={() => setShowEditUser(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="editName" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="editName"
                  defaultValue={editingUser.name}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  id="editEmail"
                  defaultValue={editingUser.email}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="editRole" className="block text-sm font-medium text-gray-700">Role <span className="text-red-500">*</span></label>
                <select
                  id="editRole"
                  defaultValue={editingUser.role}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="team_member">Team Member</option>
                  <option value="manager">Manager</option>
                  <option value="dean">Dean</option>
                  <option value="senior_leadership">Senior Leadership</option>
                  <option value="university_admin">University Admin</option>
                  <option value="admin">Admin</option>
                  <option value="supreme_admin">Supreme Admin</option>
                </select>
              </div>
              <div>
                <label htmlFor="editDepartment" className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  id="editDepartment"
                  defaultValue={editingUser.department || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="editPhone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  id="editPhone"
                  defaultValue={editingUser.phone || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowEditUser(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Edit functionality coming soon!');
                    setShowEditUser(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Update User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Organization Modal */}
      {showEditOrg && editingOrg && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white p-8 border border-gray-300 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Organization</h3>
              <button onClick={() => setShowEditOrg(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="editOrgName" className="block text-sm font-medium text-gray-700">Organization Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="editOrgName"
                  defaultValue={editingOrg.name}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="editOrgType" className="block text-sm font-medium text-gray-700">Type <span className="text-red-500">*</span></label>
                <select
                  id="editOrgType"
                  defaultValue={editingOrg.type}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="company">Company</option>
                  <option value="university">University</option>
                  <option value="government">Government</option>
                  <option value="non-profit">Non-Profit</option>
                </select>
              </div>
              <div>
                <label htmlFor="editOrgDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="editOrgDescription"
                  defaultValue={editingOrg.settings?.description || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows={3}
                  placeholder="Brief description of the organization"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editOrgAddress" className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    id="editOrgAddress"
                    defaultValue={editingOrg.settings?.address || ''}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Street address, city, country"
                  />
                </div>
                <div>
                  <label htmlFor="editOrgPhone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    id="editOrgPhone"
                    defaultValue={editingOrg.settings?.phone || ''}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editOrgEmail" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="editOrgEmail"
                    defaultValue={editingOrg.settings?.email || ''}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="contact@organization.com"
                  />
                </div>
                <div>
                  <label htmlFor="editOrgWebsite" className="block text-sm font-medium text-gray-700">Website</label>
                  <input
                    type="url"
                    id="editOrgWebsite"
                    defaultValue={editingOrg.settings?.website || ''}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://www.organization.com"
                  />
                </div>
              </div>

              {/* University-specific fields */}
              {editingOrg.type === 'university' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="editOrgFoundingYear" className="block text-sm font-medium text-gray-700">Founding Year</label>
                      <input
                        type="number"
                        id="editOrgFoundingYear"
                        defaultValue={editingOrg.settings?.foundingYear || ''}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., 1965"
                        min="1800"
                        max="2024"
                      />
                    </div>
                    <div>
                      <label htmlFor="editOrgAccreditation" className="block text-sm font-medium text-gray-700">Accreditation</label>
                      <input
                        type="text"
                        id="editOrgAccreditation"
                        defaultValue={editingOrg.settings?.accreditation || ''}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., AACSB, ABET, etc."
                      />
                    </div>
                  </div>

                  {/* Departments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Departments</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Add department (e.g., Computer Science)"
                        onKeyPress={(e) => e.key === 'Enter' && addDepartment()}
                      />
                      <button
                        type="button"
                        onClick={addDepartment}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                    {(editingOrg.settings?.departments && editingOrg.settings.departments.length > 0) && (
                      <div className="space-y-1">
                        {editingOrg.settings.departments.map((dept, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                            <span className="text-sm">{dept}</span>
                            <button
                              type="button"
                              onClick={() => removeDepartment(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Campuses */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campuses</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newCampus}
                        onChange={(e) => setNewCampus(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Add campus (e.g., Main Campus, North Campus)"
                        onKeyPress={(e) => e.key === 'Enter' && addCampus()}
                      />
                      <button
                        type="button"
                        onClick={addCampus}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                    {(editingOrg.settings?.campuses && editingOrg.settings.campuses.length > 0) && (
                      <div className="space-y-1">
                        {editingOrg.settings.campuses.map((campus, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                            <span className="text-sm">{campus}</span>
                            <button
                              type="button"
                              onClick={() => removeCampus(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <label htmlFor="editOrgStatus" className="block text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
                <select
                  id="editOrgStatus"
                  defaultValue={editingOrg.status}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowEditOrg(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Edit functionality coming soon!');
                    setShowEditOrg(false);
                  }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Update Organization
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseDashboard;

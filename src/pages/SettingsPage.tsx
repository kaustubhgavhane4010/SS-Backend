import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Bell,
  Palette,
  Save,
  Camera,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role: string;
  avatar?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  ticketUpdates: boolean;
  weeklyReports: boolean;
  systemAlerts: boolean;
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SettingsPage: React.FC = () => {
  const { user, updateCurrentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form State
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    role: user?.role || '',
    avatar: user?.avatar || '',
  });

  // Notification Settings State
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    ticketUpdates: true,
    weeklyReports: false,
    systemAlerts: true,
  });

  // Security Settings State
  const [security, setSecurity] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      // Load user profile and settings from API
      const response = await usersAPI.getUserProfile();
      if (response.data.success) {
        const userData = response.data.data;
        setProfile({
          name: userData.name || user?.name || '',
          email: userData.email || user?.email || '',
          phone: userData.phone || '',
          department: userData.department || '',
          role: userData.role || user?.role || '',
          avatar: userData.avatar || '',
        });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      const response = await usersAPI.updateProfile(profile);
      if (response.data.success) {
        updateCurrentUser(response.data.data);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (security.newPassword !== security.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    if (security.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long!');
      return;
    }

    try {
      setSaving(true);
      const response = await usersAPI.changePassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      });
      if (response.data.success) {
        toast.success('Password changed successfully!');
        setSecurity({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password. Please check your current password.');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setSaving(true);
      const response = await usersAPI.updateNotificationSettings(notifications);
      if (response.data.success) {
        toast.success('Notification settings updated!');
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await usersAPI.uploadAvatar(formData);
      if (response.data.success) {
        setProfile(prev => ({ ...prev, avatar: response.data.data.avatar }));
        updateCurrentUser({ avatar: response.data.data.avatar });
        toast.success('Avatar updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
      <div>
          <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>
          <p className="text-neutral-600 mt-2">Manage your account settings and preferences</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-secondary-400/90 text-neutral-900 font-semibold shadow-lg border-2 border-secondary-300'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary-100 rounded-xl">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900">Profile Information</h2>
                  <p className="text-neutral-600">Update your personal information and profile picture</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Avatar Section */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover"
                          />
                        ) : (
                          profile.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-secondary-600 transition-colors">
                        <Camera className="w-4 h-4 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">Profile Picture</h3>
                      <p className="text-sm text-neutral-600">Upload a new profile picture (max 5MB)</p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="input pl-10"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="input pl-10"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="input pl-10"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={profile.department}
                      onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                      className="input pl-10"
                      placeholder="Enter your department"
                    />
                  </div>
                </div>

                {/* Role (Read-only) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={profile.role}
                      className="input pl-10 bg-neutral-50 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t border-neutral-200">
                <button
                  onClick={handleProfileUpdate}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-secondary-100 rounded-xl">
                  <Bell className="w-6 h-6 text-secondary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900">Notification Preferences</h2>
                  <p className="text-neutral-600">Choose how you want to be notified about updates</p>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-neutral-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Receive notifications about {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t border-neutral-200">
                <button
                  onClick={handleNotificationUpdate}
                  disabled={saving}
                  className="px-6 py-3 bg-white border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="card p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-error-100 rounded-xl">
                  <Shield className="w-6 h-6 text-error-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900">Security Settings</h2>
                  <p className="text-neutral-600">Update your password and security preferences</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={security.currentPassword}
                      onChange={(e) => setSecurity(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="input pr-10"
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={security.newPassword}
                      onChange={(e) => setSecurity(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="input pr-10"
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">Password must be at least 8 characters long</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="input pr-10"
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {security.newPassword && security.confirmPassword && (
                    <div className="flex items-center gap-2 mt-1">
                      {security.newPassword === security.confirmPassword ? (
                        <CheckCircle className="w-4 h-4 text-success-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-error-500" />
                      )}
                      <span className={`text-sm ${
                        security.newPassword === security.confirmPassword ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {security.newPassword === security.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t border-neutral-200">
                <button
                  onClick={handlePasswordChange}
                  disabled={saving || !security.currentPassword || !security.newPassword || !security.confirmPassword}
                  className="px-6 py-3 bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

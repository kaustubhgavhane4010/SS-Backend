import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Ticket,
  Plus,
  Users,
  Settings,
  UserCheck,
  Menu,
  X,
  Bell,
  LogOut,
  ChevronDown,
  Search,
  Building,
  BarChart3,
} from 'lucide-react';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Different navigation for Supreme Admin
  const navigation = user?.role === 'supreme_admin' 
    ? [
        { name: 'Enterprise Dashboard', href: '/enterprise', icon: Home },
        { name: 'Organizations', href: '/enterprise?tab=organizations', icon: Building },
        { name: 'Users', href: '/enterprise?tab=users', icon: Users },
        { name: 'Teams', href: '/enterprise?tab=teams', icon: Users },
        { name: 'Analytics', href: '/enterprise?tab=analytics', icon: BarChart3 },
        { name: 'Settings', href: '/settings', icon: Settings },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'All Tickets', href: '/tickets', icon: Ticket },
        { name: 'New Ticket', href: '/tickets/new', icon: Plus },
        { name: 'Team', href: '/team', icon: Users },
        ...(user?.role === 'admin' ? [{ name: 'User Management', href: '/users', icon: UserCheck }] : []),
        { name: 'Settings', href: '/settings', icon: Settings },
      ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    if (href === '/enterprise') {
      return location.pathname === '/enterprise';
    }
    if (href === '/tickets') {
      // Only active for /tickets, not /tickets/new
      return location.pathname === '/tickets';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full bg-gradient-hero relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                                radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`
            }}></div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-bounce-gentle"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">NNU</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Student Support</h1>
                  <p className="text-xs text-white/70">Nottinghamshire New University</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        active
                          ? 'bg-yellow-400/90 text-neutral-900 font-semibold shadow-lg border-2 border-yellow-300'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-white/70 capitalize">{user?.role}</p>
                  </div>
                </div>

                <HeadlessMenu as="div" className="relative">
                  <HeadlessMenu.Button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <ChevronDown size={16} />
                  </HeadlessMenu.Button>

                  <Transition
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <HeadlessMenu.Items className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200/50 py-1 z-50">
                      <HeadlessMenu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`${
                              active ? 'bg-neutral-100' : ''
                            } flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors`}
                          >
                            <LogOut size={16} className="mr-2" />
                            Logout
                          </button>
                        )}
                      </HeadlessMenu.Item>
                    </HeadlessMenu.Items>
                  </Transition>
                </HeadlessMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200/50 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-xl font-semibold text-neutral-900">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-lg">
                <Search size={16} className="text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm text-neutral-700 placeholder-neutral-400 w-48"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full animate-pulse"></span>
              </button>

              {/* User Menu */}
              <HeadlessMenu as="div" className="relative">
                <HeadlessMenu.Button className="flex items-center gap-2 p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block font-medium">{user?.name}</span>
                  <ChevronDown size={16} />
                </HeadlessMenu.Button>

                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200/50 py-1 z-50">
                    <HeadlessMenu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={`${
                            active ? 'bg-neutral-100' : ''
                          } flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors`}
                        >
                          <LogOut size={16} className="mr-2" />
                          Logout
                        </button>
                      )}
                    </HeadlessMenu.Item>
                  </HeadlessMenu.Items>
                </Transition>
              </HeadlessMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

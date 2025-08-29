import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ticketsAPI } from '../services/api';
import { Ticket, DashboardStats } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import TicketCard from '../components/TicketCard';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  User,
  Tag,
  AlertCircle
} from 'lucide-react';

const TicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);

  // Load tickets based on current filters
  const loadTickets = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      };

      // Handle "My Tickets" filter
      if (currentFilter === 'my' && user?.id) {
        params.assigned_to = user.id;
      }

      const response = await ticketsAPI.getTickets(params);
      
      if (response.data.success) {
        setTickets(response.data.data);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalTickets(response.data.pagination?.total || 0);
      } else {
        toast.error('Failed to load tickets');
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard stats
  const loadStats = async () => {
    try {
      const response = await ticketsAPI.getDashboardStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadStats();
  }, []);

  // Reload tickets when filters change
  useEffect(() => {
    loadTickets();
  }, [currentFilter, currentPage, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  // Handle filter changes
  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadTickets();
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setCurrentFilter('all');
    setCurrentPage(1);
  };

  // Quick filter buttons
  const quickFilters = [
    { key: 'all', label: 'All Tickets', count: totalTickets },
    { key: 'my', label: 'My Tickets', count: stats?.myAssignedTickets || 0 },
    { key: 'open', label: 'Open', count: stats?.totalOpenTickets || 0 },
    { key: 'urgent', label: 'Urgent', count: stats?.highPriorityTickets || 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Support Tickets</h1>
              <p className="text-neutral-600">Manage and track support requests</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {quickFilters.map((filter) => (
              <div
                key={filter.key}
                onClick={() => handleFilterChange(filter.key)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  currentFilter === filter.key
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                    : 'bg-white hover:shadow-md border border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{filter.label}</span>
                  <span className={`text-2xl font-bold ${
                    currentFilter === filter.key ? 'text-white' : 'text-primary-600'
                  }`}>
                    {filter.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="technical">Technical</option>
                <option value="academic">Academic</option>
                <option value="administrative">Administrative</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Search
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="px-6 py-3 bg-white border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner />
              <p className="text-neutral-600 mt-4">Loading tickets...</p>
            </div>
          ) : tickets.length > 0 ? (
            <>
              {/* Tickets Header */}
              <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-900">
                    {totalTickets} ticket{totalTickets !== 1 ? 's' : ''} found
                  </h3>
                  <div className="text-sm text-neutral-600">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              </div>

                             {/* Tickets */}
               <div className="divide-y divide-neutral-200">
                 {tickets.map((ticket) => (
                   <TicketCard key={ticket.id} ticket={ticket} />
                 ))}
               </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-neutral-600">
                      Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalTickets)} of {totalTickets} tickets
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="px-3 py-2 text-sm font-medium">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No tickets found</h3>
              <p className="text-neutral-600 mb-6">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'No tickets match your current criteria'}
              </p>
              {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
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

export default TicketsPage;

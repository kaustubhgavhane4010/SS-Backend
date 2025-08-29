import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from '../types';
import { formatDistanceToNow } from 'date-fns';
import {
  Clock,
  User,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Calendar,
  Hash,
} from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  compact?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, compact = false }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'priority-urgent';
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'In Progress':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'Pending':
        return <Pause className="h-4 w-4 text-orange-600" />;
      case 'Closed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'status-open';
      case 'In Progress':
        return 'status-in-progress';
      case 'Pending':
        return 'status-in-progress';
      case 'Closed':
        return 'status-closed';
      default:
        return 'status-closed';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'ticket-urgent';
      case 'High':
        return 'ticket-high';
      case 'Medium':
        return 'ticket-medium';
      case 'Low':
        return 'ticket-low';
      default:
        return '';
    }
  };

  if (compact) {
    return (
      <Link
        to={`/tickets/${ticket.id}`}
        className="block p-4 bg-white rounded-lg border border-neutral-200 hover:shadow-md transition-all duration-200 group"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors duration-200">
              {ticket.title}
            </h4>
            <div className="flex items-center gap-4 text-xs text-neutral-600">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {ticket.student_name}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {ticket.category}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <p className="text-xs text-neutral-400 text-right">
              {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className={`ticket-card ${getPriorityClass(ticket.priority)}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-3">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority}
            </span>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 font-heading">{ticket.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{ticket.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <User className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Student</p>
            <p className="text-sm font-medium text-gray-900">{ticket.student_name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <MessageSquare className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Category</p>
            <p className="text-sm font-medium text-gray-900">{ticket.category}</p>
          </div>
        </div>
        
        {ticket.student_id && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Hash className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Student ID</p>
              <p className="text-sm font-medium text-gray-900">{ticket.student_id}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Course</p>
            <p className="text-sm font-medium text-gray-900">{ticket.course}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
          </span>
          {ticket.due_date && (
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Due {formatDistanceToNow(new Date(ticket.due_date), { addSuffix: true })}
            </span>
          )}
        </div>
        <Link
          to={`/tickets/${ticket.id}`}
          className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TicketCard;

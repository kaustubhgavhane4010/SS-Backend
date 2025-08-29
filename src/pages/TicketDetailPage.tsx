import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { ticketsAPI, notesAPI, attachmentsAPI, authAPI } from '../services/api';
import { Ticket, Note, User, CreateNoteData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  ArrowLeft,
  User as UserIcon,
  Mail,
  Calendar,
  Clock,
  Tag,
  AlertTriangle,
  FileText,
  MessageSquare,
  Edit,
  Save,
  X,
  Plus,
  Download,
  Trash2,
  CheckCircle,
  Star,
  Shield,
  MapPin,
  Phone,
  BookOpen,
  Upload,
  Send,
  MoreVertical,
  Eye,
  Paperclip
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'Internal' | 'Student Communication'>('Internal');
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const watchedStatus = watch('status');
  const watchedPriority = watch('priority');

  useEffect(() => {
    if (id) {
      loadTicketData();
      loadUsers();
    }
  }, [id]);

  const loadTicketData = async () => {
    try {
      setLoading(true);
      const [ticketResponse, notesResponse] = await Promise.all([
        ticketsAPI.getTicket(id!),
        notesAPI.getNotes(id!)
      ]);

      if (ticketResponse.data.success) {
        setTicket(ticketResponse.data.data);
        // Set form values for editing
        setValue('title', ticketResponse.data.data.title);
        setValue('description', ticketResponse.data.data.description);
        setValue('priority', ticketResponse.data.data.priority);
        setValue('status', ticketResponse.data.data.status);
        setValue('assigned_to', ticketResponse.data.data.assigned_to || '');
        setValue('due_date', ticketResponse.data.data.due_date ? ticketResponse.data.data.due_date.split('T')[0] : '');
      }

      if (notesResponse.data.success) {
        setNotes(notesResponse.data.data);
      }
    } catch (error) {
      console.error('Error loading ticket data:', error);
      toast.error('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      if (response.data.success) {
        setUsers(response.data.data.filter((u: User) => u.status === 'active'));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleUpdateTicket = async (data: any) => {
    try {
      setUpdating(true);
      const response = await ticketsAPI.updateTicket(id!, data);
      if (response.data.success) {
        setTicket(response.data.data);
        setEditing(false);
        toast.success('Ticket updated successfully');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const noteData: CreateNoteData = {
        ticket_id: id!,
        content: newNote,
        note_type: noteType,
      };

      const response = await notesAPI.createNote(id!, noteData);
      if (response.data.success) {
        setNotes(prev => [response.data.data, ...prev]);
        setNewNote('');
        toast.success('Note added successfully');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingAttachment(true);
      for (const file of files) {
        await attachmentsAPI.uploadAttachment(id!, file);
      }
      toast.success('Attachment uploaded successfully');
      // Reload ticket to get updated attachments
      loadTicketData();
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast.error('Failed to upload attachment');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-gradient-to-r from-error-500 to-error-600 text-white';
      case 'High':
        return 'bg-gradient-to-r from-warning-500 to-warning-600 text-white';
      case 'Medium':
        return 'bg-gradient-to-r from-accent-500 to-accent-600 text-white';
      case 'Low':
        return 'bg-gradient-to-r from-success-500 to-success-600 text-white';
      default:
        return 'bg-neutral-200 text-neutral-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-gradient-to-r from-primary-500 to-primary-600 text-white';
      case 'In Progress':
        return 'bg-gradient-to-r from-accent-500 to-accent-600 text-white';
      case 'Pending':
        return 'bg-gradient-to-r from-warning-500 to-warning-600 text-white';
      case 'Closed':
        return 'bg-gradient-to-r from-neutral-500 to-neutral-600 text-white';
      default:
        return 'bg-neutral-200 text-neutral-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return <AlertTriangle className="w-4 h-4" />;
      case 'High':
        return <Clock className="w-4 h-4" />;
      case 'Medium':
        return <Star className="w-4 h-4" />;
      case 'Low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <Eye className="w-4 h-4" />;
      case 'In Progress':
        return <Clock className="w-4 h-4" />;
      case 'Pending':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-neutral-600 mt-4">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-error-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Ticket Not Found</h2>
          <p className="text-neutral-600 mb-6">The ticket you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/tickets')}
            className="btn-primary"
          >
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/tickets')}
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Ticket #{ticket.id.slice(0, 8)}</h1>
              <p className="text-neutral-600">{ticket.title}</p>
            </div>
            <div className="flex items-center gap-3">
              {ticket.status !== 'Closed' ? (
                <button
                  onClick={async () => {
                    try {
                      setUpdating(true);
                      const response = await ticketsAPI.updateTicket(id!, { status: 'Closed' });
                      if (response.data.success) {
                        setTicket(response.data.data);
                        toast.success('Ticket marked as resolved');
                      }
                    } catch (error) {
                      console.error('Error updating ticket:', error);
                      toast.error('Failed to mark ticket as resolved');
                    } finally {
                      setUpdating(false);
                    }
                  }}
                  disabled={updating}
                  className="px-6 py-3 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? <LoadingSpinner /> : <CheckCircle className="w-4 h-4" />}
                  {updating ? 'Marking...' : 'Mark Resolved'}
                </button>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      setUpdating(true);
                      const response = await ticketsAPI.updateTicket(id!, { status: 'Open' });
                      if (response.data.success) {
                        setTicket(response.data.data);
                        toast.success('Ticket reopened');
                      }
                    } catch (error) {
                      console.error('Error updating ticket:', error);
                      toast.error('Failed to reopen ticket');
                    } finally {
                      setUpdating(false);
                    }
                  }}
                  disabled={updating}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? <LoadingSpinner /> : <Eye className="w-4 h-4" />}
                  {updating ? 'Reopening...' : 'Reopen Ticket'}
                </button>
              )}
              {user?.role === 'admin' && (
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-6 py-3 bg-white border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                >
                  {editing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Priority</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                      {getPriorityIcon(ticket.priority)}
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Created</p>
                  <p className="text-sm font-semibold text-neutral-900">
                    {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Notes</p>
                  <p className="text-sm font-semibold text-neutral-900">{notes.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Information */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">Ticket Information</h2>
                    <p className="text-neutral-600">Details and description</p>
                  </div>
                </div>
              </div>

              {editing ? (
                <form onSubmit={handleSubmit(handleUpdateTicket)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Title</label>
                    <input
                      type="text"
                      {...register('title', { required: 'Title is required' })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Description</label>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      rows={4}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Priority</label>
                      <select
                        {...register('priority')}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Status</label>
                      <select
                        {...register('status')}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Pending">Pending</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Assign To</label>
                      <select
                        {...register('assigned_to')}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Unassigned</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-6 py-3 bg-white border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? <LoadingSpinner /> : <Save className="w-4 h-4" />}
                      {updating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
    <div className="space-y-6">
      <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">{ticket.title}</h3>
                    <p className="text-neutral-600 whitespace-pre-wrap">{ticket.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Category</p>
                      <p className="text-sm font-semibold text-neutral-900">{ticket.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Course</p>
                      <p className="text-sm font-semibold text-neutral-900">{ticket.course}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">Notes & Updates</h2>
                    <p className="text-neutral-600">Communication history</p>
                  </div>
                </div>
              </div>

              {/* Add Note */}
              <div className="mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-center gap-3 mb-3">
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as 'Internal' | 'Student Communication')}
                    className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="Internal">Internal Note</option>
                    <option value="Student Communication">Student Communication</option>
                  </select>
                </div>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note or update..."
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="attachment-upload"
                      multiple
                    />
                    <label
                      htmlFor="attachment-upload"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
                    >
                      <Paperclip className="w-4 h-4" />
                      Attach Files
                    </label>
                    {uploadingAttachment && <LoadingSpinner />}
                  </div>
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Add Note
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          note.note_type === 'Internal' 
                            ? 'bg-neutral-200 text-neutral-700' 
                            : 'bg-primary-100 text-primary-700'
                        }`}>
                          {note.note_type}
                        </span>
                        <span className="text-sm text-neutral-500">
                          {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <p className="text-neutral-900 whitespace-pre-wrap">{note.content}</p>
                    {note.user && (
                      <p className="text-sm text-neutral-600 mt-2">
                        — {note.user.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Information */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-neutral-900">Student Information</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Name</p>
                  <p className="text-sm font-semibold text-neutral-900">{ticket.student_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600">Email</p>
                  <p className="text-sm font-semibold text-neutral-900">{ticket.student_email}</p>
                </div>
                {ticket.student_id && (
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Student ID</p>
                    <p className="text-sm font-semibold text-neutral-900">{ticket.student_id}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-neutral-600">Course</p>
                  <p className="text-sm font-semibold text-neutral-900">{ticket.course}</p>
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-success-500 to-success-600 rounded-lg flex items-center justify-center">
                  <Tag className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-neutral-900">Ticket Details</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Created</p>
                  <p className="text-sm font-semibold text-neutral-900">
                    {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600">Last Updated</p>
                  <p className="text-sm font-semibold text-neutral-900">
                    {format(new Date(ticket.updated_at), 'MMM dd, yyyy')}
                  </p>
                </div>
                {ticket.due_date && (
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Due Date</p>
                    <p className="text-sm font-semibold text-neutral-900">
                      {format(new Date(ticket.due_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-neutral-600">Created By</p>
                  <p className="text-sm font-semibold text-neutral-900">{ticket.created_by}</p>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-warning-500 to-warning-600 rounded-lg flex items-center justify-center">
                    <Paperclip className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-neutral-900">Attachments</h3>
      </div>
      
                <div className="space-y-2">
                  {ticket.attachments.map((attachment: any) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-neutral-400" />
                        <div>
                          <p className="text-sm font-medium text-neutral-700">{attachment.filename}</p>
                          <p className="text-xs text-neutral-500">
                            {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button className="p-1 text-neutral-400 hover:text-neutral-600 rounded">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;

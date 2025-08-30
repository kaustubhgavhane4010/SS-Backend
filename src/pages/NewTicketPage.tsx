import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { ticketsAPI, authAPI, attachmentsAPI } from '../services/api';
import { CreateTicketData, User } from '../types';
import {
  User as UserIcon,
  Mail,
  BookOpen,
  FileText,
  AlertTriangle,
  Calendar,
  Upload,
  X,
  ArrowLeft,
  Plus,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const NewTicketPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateTicketData>();

  const watchedPriority = watch('priority');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      if (response.data.success) {
        setUsers(response.data.data.filter((u: any) => u.status === 'active'));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const onSubmit = async (data: CreateTicketData) => {
    try {
      setLoading(true);
      
      // Create ticket
      const response = await ticketsAPI.createTicket(data);
      
      if (response.data.success) {
        const ticketId = response.data.data.id;
        
        // Upload attachments if any
        if (attachments.length > 0) {
          for (const file of attachments) {
            const formData = new FormData();
            formData.append('file', file);
            
            await attachmentsAPI.uploadAttachment(ticketId, file);
          }
        }
        
        toast.success('Ticket created successfully');
        navigate(`/tickets/${ticketId}`);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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

  const courseOptions = [
    'Business Management',
    'Computer Science',
    'Engineering',
    'Health Sciences',
    'Arts & Design',
    'Education',
    'Law',
    'Media & Communications',
    'Psychology',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
      {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/tickets')}
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Create New Ticket</h1>
              <p className="text-neutral-600">Submit a new student support request</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Student Information</h3>
                  <p className="text-sm text-neutral-600">Basic student details</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                  <span className="text-neutral-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-600">Ticket Details</h3>
                  <p className="text-sm text-neutral-500">Issue description</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                  <span className="text-neutral-600 font-semibold">3</span>
                </div>
      <div>
                  <h3 className="font-medium text-neutral-600">Review & Submit</h3>
                  <p className="text-sm text-neutral-500">Final confirmation</p>
                </div>
              </div>
            </div>
          </div>
      </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Student Information */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">Student Information</h2>
                <p className="text-neutral-600">Enter the student's basic details</p>
              </div>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Student Name *
              </label>
              <input
                type="text"
                {...register('student_name', {
                  required: 'Student name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                  className={`w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.student_name ? 'border-error-500' : ''
                  }`}
                placeholder="Enter student's full name"
              />
              {errors.student_name && (
                  <p className="mt-2 text-sm text-error-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.student_name.message}
                  </p>
              )}
            </div>

            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Student Email *
              </label>
              <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="email"
                  {...register('student_email', {
                    required: 'Student email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                    className={`w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      errors.student_email ? 'border-error-500' : ''
                    }`}
                    placeholder="student@campusassist.com"
                />
              </div>
              {errors.student_email && (
                  <p className="mt-2 text-sm text-error-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.student_email.message}
                  </p>
              )}
            </div>

            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Student ID
              </label>
              <input
                type="text"
                {...register('student_id')}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Optional student ID"
              />
            </div>

            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Course/Programme *
              </label>
              <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <select
                  {...register('course', { required: 'Course is required' })}
                    className={`w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      errors.course ? 'border-error-500' : ''
                    }`}
                >
                  <option value="">Select a course</option>
                  {courseOptions.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              {errors.course && (
                  <p className="mt-2 text-sm text-error-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.course.message}
                  </p>
              )}
            </div>
          </div>
        </div>

        {/* Ticket Details */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">Ticket Details</h2>
                <p className="text-neutral-600">Describe the issue and select category</p>
              </div>
            </div>
          
          <div className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Issue Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                  className={`w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.category ? 'border-error-500' : ''
                  }`}
              >
                <option value="">Select a category</option>
                <option value="Academic">Academic</option>
                <option value="IT Support">IT Support</option>
                <option value="Finance">Finance</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && (
                  <p className="mt-2 text-sm text-error-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.category.message}
                  </p>
              )}
            </div>

            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Issue Title/Summary *
              </label>
              <input
                type="text"
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 5, message: 'Title must be at least 5 characters' }
                })}
                  className={`w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.title ? 'border-error-500' : ''
                  }`}
                placeholder="Brief summary of the issue"
              />
              {errors.title && (
                  <p className="mt-2 text-sm text-error-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.title.message}
                  </p>
              )}
            </div>

            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 10, message: 'Description must be at least 10 characters' }
                })}
                rows={6}
                  className={`w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none ${
                    errors.description ? 'border-error-500' : ''
                  }`}
                placeholder="Provide a detailed description of the issue..."
              />
              {errors.description && (
                  <p className="mt-2 text-sm text-error-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.description.message}
                  </p>
              )}
            </div>
          </div>
        </div>

        {/* Ticket Properties */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">Ticket Properties</h2>
                <p className="text-neutral-600">Set priority and assignment</p>
              </div>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Priority *
              </label>
              <select
                {...register('priority', { required: 'Priority is required' })}
                  className={`w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.priority ? 'border-error-500' : ''
                  }`}
              >
                <option value="">Select priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
              {watchedPriority && (
                  <div className="mt-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(watchedPriority)}`}>
                      {watchedPriority === 'Urgent' && <AlertTriangle className="w-3 h-3" />}
                      {watchedPriority === 'High' && <Clock className="w-3 h-3" />}
                      {watchedPriority === 'Medium' && <Star className="w-3 h-3" />}
                      {watchedPriority === 'Low' && <CheckCircle className="w-3 h-3" />}
                  {watchedPriority} Priority
                    </span>
                  </div>
              )}
              {errors.priority && (
                  <p className="mt-2 text-sm text-error-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.priority.message}
                  </p>
              )}
            </div>

            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Assign To
              </label>
              <select
                {...register('assigned_to')}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Expected Resolution Date
              </label>
              <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="date"
                  {...register('due_date')}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Attachments */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-success-500 to-success-600 rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">Attachments</h2>
                <p className="text-neutral-600">Upload relevant files and documents</p>
              </div>
            </div>
          
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Upload Files
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
              />
                <p className="mt-2 text-sm text-neutral-500">
                Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, TXT
              </p>
            </div>

            {attachments.length > 0 && (
              <div>
                  <h4 className="text-sm font-semibold text-neutral-700 mb-3">Selected Files:</h4>
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-neutral-400" />
                          <div>
                            <span className="text-sm font-medium text-neutral-700">{file.name}</span>
                            <p className="text-xs text-neutral-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                          className="p-2 text-error-500 hover:text-error-700 hover:bg-error-50 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
                className="px-6 py-3 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
                <ArrowLeft className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
                className="btn-primary flex items-center gap-2 px-8 py-3"
          >
            {loading ? (
              <>
                    <LoadingSpinner />
                    Creating Ticket...
              </>
            ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Ticket
                  </>
            )}
          </button>
            </div>
        </div>
      </form>
      </div>
    </div>
  );
};

export default NewTicketPage;

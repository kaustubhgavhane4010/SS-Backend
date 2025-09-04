export interface User {
  id: string;
  name: string;
  email: string;
  role: 'supreme_admin' | 'admin' | 'university_admin' | 'senior_leadership' | 'dean' | 'manager' | 'team_member';
  status: 'active' | 'inactive';
  phone?: string;
  department?: string;
  avatar?: string;
  organization_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  organization_name?: string;
  created_by_name?: string;
}

export interface OrganizationSettings {
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  foundingYear?: string;
  accreditation?: string;
  departments?: string[];
  campuses?: string[];
}

export interface Organization {
  id: string;
  name: string;
  type: 'company' | 'university' | 'department';
  status: 'active' | 'inactive';
  created_by: string;
  created_at: string;
  updated_at: string;
  parent_organization_id?: string;
  settings?: OrganizationSettings;
  created_by_name?: string;
  parent_organization_name?: string;
}

export interface EnterpriseStats {
  organizations: {
    total_organizations: number;
    companies: number;
    universities: number;
    departments: number;
  };
  users: {
    total_users: number;
    admins: number;
    university_admins: number;
    senior_leadership: number;
    deans: number;
    managers: number;
    team_members: number;
  };
  recentUsers: User[];
}

export interface Ticket {
  id: string;
  student_name: string;
  student_email: string;
  student_id?: string;
  course: string;
  category: TicketCategory;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  attachments?: Attachment[];
}

export interface Note {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  note_type: NoteType;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Attachment {
  id: string;
  ticket_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export type TicketCategory = 'Academic' | 'IT Support' | 'Finance' | 'Accommodation' | 'Other';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketStatus = 'Open' | 'In Progress' | 'Pending' | 'Closed';
export type NoteType = 'Internal' | 'Student Communication' | 'System Update';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'supreme_admin' | 'admin' | 'university_admin' | 'senior_leadership' | 'dean' | 'manager' | 'team_member';
  status: 'active' | 'inactive';
  organization_id?: string;
  department?: string;
  phone?: string;
}

export interface CreateTicketData {
  student_name: string;
  student_email: string;
  student_id?: string;
  course: string;
  category: TicketCategory;
  title: string;
  description: string;
  priority: TicketPriority;
  assigned_to?: string;
  due_date?: string;
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  assigned_to?: string;
  due_date?: string;
}

export interface CreateNoteData {
  ticket_id: string;
  content: string;
  note_type: NoteType;
}

export interface DashboardStats {
  totalOpenTickets: number;
  myAssignedTickets: number;
  highPriorityTickets: number;
  resolvedToday: number;
}

export interface FilterOptions {
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: string;
  category?: TicketCategory;
  date_range?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

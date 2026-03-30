// ─── Enums ───────────────────────────────────────────────────
export type UserRole = 'client' | 'lawyer' | 'firm_admin';
export type CaseStatus = 'open' | 'pre_filing' | 'in_court' | 'closed';
export type RiskCategory = 'none' | 'inactivity' | 'unanswered' | 'missed_deadline';
export type RiskLevel = 'low' | 'medium' | 'high';
export type TaskStatus = 'not_started' | 'in_progress' | 'done';
export type DeadlineType = 'court_filing' | 'internal_review' | 'discovery_response';
export type MessageStatus = 'sent' | 'seen';
export type DocType = 'pleading' | 'contract' | 'draft' | 'evidence' | 'other';
export type BillingModel = 'hourly' | 'flat_fee';
export type EventType =
  | 'case_created'
  | 'document_uploaded'
  | 'message_sent'
  | 'task_updated'
  | 'deadline_updated'
  | 'ai_alert_generated';

// ─── Core Entities ────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  firm_id?: string;
  language: 'en' | 'ar' | 'es';
  avatar_url?: string;
  created_at: string;
}

export interface Firm {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  jurisdiction_id: string;
}

export interface Case {
  id: string;
  firm_id: string;
  title: string;
  practice_area: string;
  status: CaseStatus;
  risk_score: number;
  risk_category: RiskCategory;
  budget?: number;
  billing_model?: BillingModel;
  created_at: string;
  updated_at: string;
  client_name?: string;
  lawyer_name?: string;
  last_activity?: string;
}

export interface Task {
  id: string;
  case_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee_id: string;
  assignee_name?: string;
  due_date: string;
  created_at: string;
}

export interface Deadline {
  id: string;
  case_id: string;
  type: DeadlineType;
  due_date: string;
  internal_note?: string;
}

export interface CaseEvent {
  id: string;
  case_id: string;
  actor_id: string;
  actor_name?: string;
  actor_role?: UserRole;
  type: EventType;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AIAlert {
  id: string;
  case_id: string;
  case_title?: string;
  type: 'inactivity' | 'unanswered_message' | 'missed_deadline';
  risk_level: RiskLevel;
  description: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface Document {
  id: string;
  case_id: string;
  case_title?: string;
  dms_document_id: string;
  file_name: string;
  doc_type: DocType;
  is_public_to_client: boolean;
  uploaded_by: string;
  uploaded_by_name?: string;
  uploaded_at: string;
  expiry_date?: string;
  file_size?: number;
}

export interface Message {
  id: string;
  case_id: string;
  case_title?: string;
  sender_id: string;
  sender_name?: string;
  sender_role?: UserRole;
  receiver_id: string;
  receiver_name?: string;
  content: string;
  is_client_visible: boolean;
  status: MessageStatus;
  seen_at?: string;
  created_at: string;
  is_internal_note?: boolean;
}

export interface TimeEntry {
  id: string;
  case_id: string;
  case_title?: string;
  lawyer_id: string;
  lawyer_name?: string;
  started_at: string;
  ended_at: string;
  duration_minutes: number;
  description: string;
  is_billed: boolean;
}

export interface FlatFeeCase {
  id: string;
  case_id: string;
  total_fee_cents: number;
  already_billed_cents: number;
}

// ─── AI Engine ────────────────────────────────────────────────
export interface NegligenceReport {
  case_id: string;
  case_title: string;
  risk_score: number;
  risk_category: RiskCategory;
  risk_level: RiskLevel;
  issues: string[];
  recommendation: string;
  generated_at: string;
}

// ─── UI State ─────────────────────────────────────────────────
export interface DashboardStats {
  total_cases: number;
  active_cases: number;
  high_risk_cases: number;
  pending_messages: number;
  pending_tasks: number;
  alerts_today: number;
}

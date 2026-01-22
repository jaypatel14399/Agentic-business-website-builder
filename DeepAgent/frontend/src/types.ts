export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface JobRequest {
  industry: string;
  city: string;
  state: string;
  limit?: number;
}

export interface ProgressUpdate {
  step: string;
  progress: number;
  details: Record<string, any>;
  timestamp: string;
}

export interface WebsiteInfo {
  site_id: string;
  business_name: string;
  path: string;
  created_at: string;
}

export interface JobResponse {
  job_id: string;
  status: JobStatus;
  request: JobRequest;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  progress?: ProgressUpdate;
  generated_websites: WebsiteInfo[];
  error?: string;
}

export interface WebsiteListResponse {
  websites: WebsiteInfo[];
  total: number;
}

export interface WebSocketMessage {
  type: 'log' | 'progress' | 'connected';
  timestamp: string;
  level?: string;
  message?: string;
  logger?: string;
  step?: string;
  progress?: number;
  details?: Record<string, any>;
  job_id?: string;
  status?: string;
}

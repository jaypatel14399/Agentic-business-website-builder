export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/** Business object sent when creating a job from discovery UI (pre-discovered). */
export interface JobRequestBusiness {
  place_id: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  website?: string;
  hasWebsite: boolean;
}

export interface JobRequest {
  industry: string;
  city: string;
  state: string;
  limit?: number;
  /** Pre-discovered businesses from discovery UI (ensures these exact businesses are generated). */
  businesses?: JobRequestBusiness[];
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

export interface DiscoveredBusiness {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating?: number;
  reviews?: number;
  address: string;
  phone?: string;
  website?: string;
  hasWebsite?: boolean;
  websiteStatus?: string;
}

export interface DiscoveryRequest {
  industry: string;
  city: string;
  state: string;
  limit?: number;
}

import axios from 'axios';
import { JobRequest, JobResponse, WebsiteListResponse, WebsiteInfo, DiscoveredBusiness, DiscoveryRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const jobsApi = {
  createJob: async (request: JobRequest): Promise<JobResponse> => {
    const response = await apiClient.post<JobResponse>('/api/jobs', request);
    return response.data;
  },

  getJob: async (jobId: string): Promise<JobResponse> => {
    const response = await apiClient.get<JobResponse>(`/api/jobs/${jobId}`);
    return response.data;
  },

  listJobs: async (): Promise<JobResponse[]> => {
    const response = await apiClient.get<JobResponse[]>('/api/jobs');
    return response.data;
  },

  cancelJob: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/api/jobs/${jobId}`);
  },
};

export const websitesApi = {
  listWebsites: async (): Promise<WebsiteListResponse> => {
    const response = await apiClient.get<WebsiteListResponse>('/api/websites');
    return response.data;
  },

  getWebsite: async (siteId: string): Promise<WebsiteInfo> => {
    const response = await apiClient.get<WebsiteInfo>(`/api/websites/${siteId}`);
    return response.data;
  },

  deleteWebsite: async (siteId: string): Promise<void> => {
    await apiClient.delete(`/api/websites/${siteId}`);
  },

  /** Run npm install & build, returns preview_url to open the site */
  buildWebsite: async (siteId: string): Promise<{ success: boolean; preview_url: string }> => {
    const response = await apiClient.post<{ success: boolean; preview_url: string }>(
      `/api/websites/${siteId}/build`
    );
    return response.data;
  },

  /**
   * Run npm install and npm run dev in the site folder, wait until server is ready,
   * then return the localhost URL to open in the browser.
   */
  buildAndOpen: async (siteId: string): Promise<{ success: boolean; url: string }> => {
    const response = await apiClient.post<{ success: boolean; url: string }>(
      `/api/websites/${siteId}/start-dev`
    );
    return response.data;
  },
};

export const discoveryApi = {
  discoverBusinesses: async (request: DiscoveryRequest): Promise<DiscoveredBusiness[]> => {
    // Use new /api/discover endpoint (backward compatible with /api/discover-businesses)
    const response = await apiClient.post<DiscoveredBusiness[]>('/api/discover', request);
    return response.data;
  },

  generateWebsite: async (businessId: string): Promise<JobResponse> => {
    const response = await apiClient.post<JobResponse>('/api/generate-website', { businessId });
    return response.data;
  },
};

export default apiClient;

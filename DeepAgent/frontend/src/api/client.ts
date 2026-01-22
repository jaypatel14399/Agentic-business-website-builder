import axios from 'axios';
import { JobRequest, JobResponse, WebsiteListResponse, WebsiteInfo } from '../types';

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
};

export default apiClient;

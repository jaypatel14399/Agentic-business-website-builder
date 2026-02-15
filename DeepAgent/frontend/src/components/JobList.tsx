import { useEffect, useState } from 'react';
import { JobResponse, JobStatus } from '../types';
import { jobsApi } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';

interface JobListProps {
  /** When provided, use this list (centralized from parent) instead of fetching */
  jobs?: JobResponse[];
  /** When provided, Refresh button and post-cancel refresh use this */
  onRefresh?: () => void | Promise<void>;
  onJobSelect: (job: JobResponse) => void;
  selectedJobId?: string;
  onJobCancel?: (jobId: string) => void;
}

export const JobList = ({
  jobs: jobsProp,
  onRefresh,
  onJobSelect,
  selectedJobId,
  onJobCancel,
}: JobListProps) => {
  const { theme } = useTheme();
  const [internalJobs, setInternalJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(!jobsProp);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const useCentralized = jobsProp != null;
  const jobs = useCentralized ? jobsProp : internalJobs;

  const loadJobs = async () => {
    if (onRefresh) {
      await onRefresh();
      return;
    }
    try {
      const jobList = await jobsApi.listJobs();
      setInternalJobs(jobList);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (useCentralized) {
      setLoading(false);
      return;
    }
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, [useCentralized]);


  const handleCancel = async (e: React.MouseEvent, job: JobResponse) => {
    e.stopPropagation();
    if (job.status !== JobStatus.RUNNING && job.status !== JobStatus.PENDING) return;
    setCancellingId(job.job_id);
    try {
      await jobsApi.cancelJob(job.job_id);
      onJobCancel?.(job.job_id);
      await loadJobs();
    } catch (error) {
      console.error('Error cancelling job:', error);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadgeClass = (status: JobStatus) => {
    switch (status) {
      case JobStatus.COMPLETED:
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case JobStatus.RUNNING:
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case JobStatus.FAILED:
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case JobStatus.CANCELLED:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    }
  };

  const cardBg = theme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-gray-200';
  const borderColor = theme === 'dark' ? 'border-[#1F2937]' : 'border-gray-200';
  const titleColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const textColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-500' : 'text-gray-500';
  const itemBg = theme === 'dark' ? 'bg-[#0B1220] hover:bg-[#111827]' : 'bg-gray-50 hover:bg-gray-100';
  const selectedBg = theme === 'dark' ? 'bg-indigo-600/10' : 'bg-indigo-50';

  if (loading && !useCentralized) {
    return (
      <div className={`${cardBg} border rounded-xl p-6 transition-colors duration-200`}>
        <div className={`text-center text-sm ${textColor} py-10`}>Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className={`${cardBg} border rounded-xl flex flex-col max-h-[500px] transition-colors duration-200`}>
      <div className={`p-4 border-b ${borderColor} flex justify-between items-center`}>
        <h3 className={`text-sm font-semibold ${titleColor}`}>Jobs</h3>
        <button
          type="button"
          onClick={loadJobs}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg px-3 py-1.5 text-xs transition-all duration-200"
        >
          Refresh
        </button>
      </div>
      <div className="overflow-y-auto p-2">
        {jobs.length === 0 ? (
          <div className={`text-center text-sm ${textColor} py-10 px-4`}>No jobs yet. Start a new job to begin.</div>
        ) : (
          jobs.map((job) => {
            const isRunning = job.status === JobStatus.RUNNING;
            const canCancel = (job.status === JobStatus.RUNNING || job.status === JobStatus.PENDING) && !cancellingId;
            const isSelected = selectedJobId === job.job_id;
            return (
              <div
                key={job.job_id}
                onClick={() => onJobSelect(job)}
                className={`p-3 mb-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? `border-indigo-500 ${selectedBg}`
                    : `${borderColor} ${itemBg}`
                } ${isRunning ? 'border-l-2 border-l-blue-500' : ''}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-mono text-xs ${textSecondary}`}>{job.job_id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusBadgeClass(job.status)} relative`}>
                    {isRunning && (
                      <span className="absolute inset-0 rounded border border-blue-400 animate-ping opacity-50" aria-hidden />
                    )}
                    {job.status}
                  </span>
                </div>
                <div className={`text-sm ${textPrimary} mb-1`}>
                  {job.request.industry} in {job.request.city}, {job.request.state}
                </div>
                <div className={`text-xs ${textSecondary} mb-1`}>
                  Created: {new Date(job.created_at).toLocaleString()}
                  {job.completed_at && (
                    <> • Completed: {new Date(job.completed_at).toLocaleString()}</>
                  )}
                </div>
                {job.generated_websites.length > 0 && (
                  <div className="text-xs text-green-500 font-medium mb-2">
                    {job.generated_websites.length} website(s) generated
                  </div>
                )}
                {canCancel && (
                  <button
                    type="button"
                    className="mt-2 px-2 py-1 bg-transparent text-red-500 border border-red-500/30 rounded-lg text-xs font-medium hover:bg-red-500/10 transition-all duration-200"
                    onClick={(e) => handleCancel(e, job)}
                    disabled={cancellingId === job.job_id}
                  >
                    {cancellingId === job.job_id ? 'Cancelling…' : 'Cancel'}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { JobResponse, JobStatus } from '../types';
import { jobsApi } from '../api/client';

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

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.COMPLETED:
        return '#28a745';
      case JobStatus.RUNNING:
        return '#007bff';
      case JobStatus.FAILED:
        return '#dc3545';
      case JobStatus.CANCELLED:
        return '#6c757d';
      default:
        return '#ffc107';
    }
  };

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

  if (loading && !useCentralized) {
    return (
      <div className="job-list">
        <div className="job-list__loading">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="job-list">
      <div className="job-list__header">
        <h3 className="job-list__title">Jobs</h3>
        <button type="button" onClick={loadJobs} className="job-list__refresh-btn">
          Refresh
        </button>
      </div>
      <div className="job-list__list">
        {jobs.length === 0 ? (
          <div className="job-list__empty">No jobs yet. Start a new job to begin.</div>
        ) : (
          jobs.map((job) => {
            const isRunning = job.status === JobStatus.RUNNING;
            const canCancel = (job.status === JobStatus.RUNNING || job.status === JobStatus.PENDING) && !cancellingId;
            return (
              <div
                key={job.job_id}
                onClick={() => onJobSelect(job)}
                className={`job-list__item ${selectedJobId === job.job_id ? 'job-list__item--selected' : ''} ${isRunning ? 'job-list__item--running' : ''}`}
              >
                <div className="job-list__item-header">
                  <span className="job-list__job-id">{job.job_id}</span>
                  <span
                    className={`job-list__status-badge ${isRunning ? 'job-list__status-badge--running' : ''}`}
                    style={{ backgroundColor: getStatusColor(job.status) }}
                  >
                    {isRunning && <span className="job-list__pulse" aria-hidden />}
                    {job.status}
                  </span>
                </div>
                <div className="job-list__item-details">
                  <div>
                    {job.request.industry} in {job.request.city}, {job.request.state}
                  </div>
                  <div className="job-list__meta">
                    Created: {new Date(job.created_at).toLocaleString()}
                    {job.completed_at && (
                      <> • Completed: {new Date(job.completed_at).toLocaleString()}</>
                    )}
                  </div>
                  {job.generated_websites.length > 0 && (
                    <div className="job-list__website-count">
                      {job.generated_websites.length} website(s) generated
                    </div>
                  )}
                </div>
                {canCancel && (
                  <button
                    type="button"
                    className="job-list__cancel-btn"
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

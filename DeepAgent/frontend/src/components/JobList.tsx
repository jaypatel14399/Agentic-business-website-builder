import { useEffect, useState } from 'react';
import { JobResponse, JobStatus } from '../types';
import { jobsApi } from '../api/client';

interface JobListProps {
  onJobSelect: (job: JobResponse) => void;
  selectedJobId?: string;
}

export const JobList = ({ onJobSelect, selectedJobId }: JobListProps) => {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    try {
      const jobList = await jobsApi.listJobs();
      setJobs(jobList);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

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

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading jobs...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Jobs</h3>
        <button onClick={loadJobs} style={styles.refreshButton}>
          Refresh
        </button>
      </div>
      <div style={styles.list}>
        {jobs.length === 0 ? (
          <div style={styles.empty}>No jobs yet. Start a new job to begin.</div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.job_id}
              onClick={() => onJobSelect(job)}
              style={{
                ...styles.jobItem,
                ...(selectedJobId === job.job_id ? styles.jobItemSelected : {}),
              }}
            >
              <div style={styles.jobHeader}>
                <span style={styles.jobId}>{job.job_id}</span>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(job.status),
                  }}
                >
                  {job.status}
                </span>
              </div>
              <div style={styles.jobDetails}>
                <div>
                  {job.request.industry} in {job.request.city}, {job.request.state}
                </div>
                <div style={styles.jobMeta}>
                  Created: {new Date(job.created_at).toLocaleString()}
                  {job.completed_at && (
                    <> • Completed: {new Date(job.completed_at).toLocaleString()}</>
                  )}
                </div>
                {job.generated_websites.length > 0 && (
                  <div style={styles.websiteCount}>
                    {job.generated_websites.length} website(s) generated
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '500px',
  },
  header: {
    padding: '16px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  refreshButton: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  list: {
    overflowY: 'auto',
    padding: '8px',
  },
  jobItem: {
    padding: '12px',
    marginBottom: '8px',
    borderRadius: '4px',
    border: '1px solid #eee',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  jobItemSelected: {
    borderColor: '#007bff',
    backgroundColor: '#e7f3ff',
  },
  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  jobId: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#666',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  jobDetails: {
    fontSize: '14px',
    color: '#333',
  },
  jobMeta: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  },
  websiteCount: {
    fontSize: '12px',
    color: '#28a745',
    marginTop: '4px',
    fontWeight: '500',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
  },
};

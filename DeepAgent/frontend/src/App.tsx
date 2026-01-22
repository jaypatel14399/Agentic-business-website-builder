import { useState, useEffect, useCallback } from 'react';
import { JobForm } from './components/JobForm';
import { JobList } from './components/JobList';
import { LogViewer } from './components/LogViewer';
import { ProgressTracker } from './components/ProgressTracker';
import { WebsiteList } from './components/WebsiteList';
import { useWebSocket } from './hooks/useWebSocket';
import { JobResponse, WebSocketMessage, JobStatus } from './types';
import { jobsApi } from './api/client';

function App() {
  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [logMessages, setLogMessages] = useState<WebSocketMessage[]>([]);
  const [jobs, setJobs] = useState<JobResponse[]>([]);

  // Load jobs on mount
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobList = await jobsApi.listJobs();
        setJobs(jobList);
      } catch (error) {
        console.error('Error loading jobs:', error);
      }
    };
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update selected job periodically if it's running
  useEffect(() => {
    if (!selectedJob || selectedJob.status !== JobStatus.RUNNING) {
      return;
    }

    const updateJob = async () => {
      try {
        const updated = await jobsApi.getJob(selectedJob.job_id);
        setSelectedJob(updated);
        // Update in jobs list too
        setJobs((prev) =>
          prev.map((j) => (j.job_id === updated.job_id ? updated : j))
        );
      } catch (error) {
        console.error('Error updating job:', error);
      }
    };

    const interval = setInterval(updateJob, 2000);
    return () => clearInterval(interval);
  }, [selectedJob]);

  // WebSocket connection for real-time logs
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    setLogMessages((prev) => [...prev, message]);

    // Update progress if it's a progress message
    if (message.type === 'progress' && selectedJob) {
      setSelectedJob((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          progress: {
            step: message.step || '',
            progress: message.progress || 0,
            details: message.details || {},
            timestamp: message.timestamp,
          },
        };
      });
    }
  }, [selectedJob]);

  const { isConnected } = useWebSocket({
    jobId: selectedJob?.job_id || null,
    onMessage: handleWebSocketMessage,
    enabled: !!selectedJob && selectedJob.status === JobStatus.RUNNING,
  });

  const handleJobCreated = (job: JobResponse) => {
    setSelectedJob(job);
    setLogMessages([]);
    setJobs((prev) => [job, ...prev]);
  };

  const handleJobSelect = (job: JobResponse) => {
    setSelectedJob(job);
    setLogMessages([]);
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>Multi-Agent Business Website Generator</h1>
        <p style={styles.subtitle}>
          AI-powered website generation for local businesses
        </p>
      </header>

      <main style={styles.main}>
        <div style={styles.leftColumn}>
          <JobForm onJobCreated={handleJobCreated} />
          
          {selectedJob && (
            <>
              <ProgressTracker
                progress={selectedJob.progress}
                status={selectedJob.status}
              />
              <LogViewer
                messages={logMessages}
                filterLevel={undefined}
              />
            </>
          )}

          {!selectedJob && (
            <div style={styles.placeholder}>
              <p>Start a new job or select an existing job to view progress and logs.</p>
            </div>
          )}
        </div>

        <div style={styles.rightColumn}>
          <JobList
            onJobSelect={handleJobSelect}
            selectedJobId={selectedJob?.job_id}
          />
          <WebsiteList />
        </div>
      </main>

      {selectedJob && (
        <div style={styles.connectionStatus}>
          {isConnected ? (
            <span style={styles.connected}>● Connected</span>
          ) : (
            <span style={styles.disconnected}>○ Disconnected</span>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px 24px',
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '24px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  placeholder: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    color: '#666',
  },
  connectionStatus: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '8px 16px',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    fontSize: '14px',
  },
  connected: {
    color: '#28a745',
  },
  disconnected: {
    color: '#dc3545',
  },
};

export default App;

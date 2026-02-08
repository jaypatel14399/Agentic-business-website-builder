import { useState, useEffect, useCallback } from 'react';
import { AgentPipelineView } from './components/AgentPipelineView';
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

  const loadJobs = useCallback(async () => {
    try {
      const jobList = await jobsApi.listJobs();
      setJobs(jobList);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  }, []);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, [loadJobs]);

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
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">DeepAgent</h1>
        <p className="app__subtitle">
          Multi-agent business website generator — AI-powered sites for local businesses
        </p>
      </header>

      <main className="app__main">
        <div className="app__left">
          <JobForm onJobCreated={handleJobCreated} />

          {selectedJob && (
            <>
              <AgentPipelineView
                progress={selectedJob.progress}
                status={selectedJob.status}
              />
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
            <div className="app__placeholder">
              <p>Start a new job or select an existing job to view progress and logs.</p>
            </div>
          )}
        </div>

        <div className="app__right">
          <JobList
            jobs={jobs}
            onRefresh={loadJobs}
            onJobSelect={handleJobSelect}
            selectedJobId={selectedJob?.job_id}
            onJobCancel={(jobId) => {
              if (selectedJob?.job_id === jobId) setSelectedJob(null);
            }}
          />
          <WebsiteList />
        </div>
      </main>

      {selectedJob && (
        <div className="app__connection">
          {isConnected ? (
            <span className="app__connection--connected">● Connected</span>
          ) : (
            <span className="app__connection--disconnected">○ Disconnected</span>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

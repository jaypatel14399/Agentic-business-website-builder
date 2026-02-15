import { useState, useEffect, useCallback } from 'react';
import { AgentPipelineView } from './components/AgentPipelineView';
import { JobForm } from './components/JobForm';
import { JobList } from './components/JobList';
import { LogViewer } from './components/LogViewer';
import { ProgressTracker } from './components/ProgressTracker';
import { WebsiteList } from './components/WebsiteList';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { DiscoverySection } from './components/DiscoverySection';
import { useWebSocket } from './hooks/useWebSocket';
import { useTheme } from './contexts/ThemeContext';
import { JobResponse, WebSocketMessage, JobStatus, DiscoveryRequest } from './types';
import { jobsApi } from './api/client';
import { websitesApi } from './api/client';
import { discoveryApi } from './api/client';

function App() {
  const { theme } = useTheme();
  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [logMessages, setLogMessages] = useState<WebSocketMessage[]>([]);
  const [allLogs, setAllLogs] = useState<Map<string, WebSocketMessage[]>>(new Map());
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [websites, setWebsites] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'jobs' | 'websites' | 'logs' | 'settings'>('dashboard');
  const [isDiscoveryMode, setIsDiscoveryMode] = useState(false);
  const [discoveryRequest, setDiscoveryRequest] = useState<DiscoveryRequest | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      const jobList = await jobsApi.listJobs();
      setJobs(jobList);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  }, []);

  const loadWebsites = useCallback(async () => {
    try {
      const response = await websitesApi.listWebsites();
      setWebsites(response.websites);
    } catch (error) {
      console.error('Error loading websites:', error);
    }
  }, []);

  useEffect(() => {
    loadJobs();
    loadWebsites();
    const interval = setInterval(() => {
      loadJobs();
      loadWebsites();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadJobs, loadWebsites]);

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
    const jobId = selectedJob?.job_id;
    if (!jobId) return;

    // Update logs for selected job
    setLogMessages((prev) => [...prev, message]);

    // Store logs for all jobs (for logs view)
    setAllLogs((prev) => {
      const newMap = new Map(prev);
      const jobLogs = newMap.get(jobId) || [];
      newMap.set(jobId, [...jobLogs, message]);
      return newMap;
    });

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
    setIsDiscoveryMode(false);
    setDiscoveryRequest(null);
    // Initialize logs map for this job
    setAllLogs((prev) => {
      const newMap = new Map(prev);
      if (!newMap.has(job.job_id)) {
        newMap.set(job.job_id, []);
      }
      return newMap;
    });
  };

  const handleStartDiscovery = (request: DiscoveryRequest) => {
    setDiscoveryRequest(request);
    setIsDiscoveryMode(true);
  };

  const handleGenerateForBusinesses = async (businesses: { id: string; name: string; address: string; phone?: string; rating?: number; reviews?: number; website?: string; hasWebsite?: boolean }[]) => {
    try {
      // Pass full business objects so backend uses them as pre-discovered (no re-discovery/re-detection)
      const job = await jobsApi.createJob({
        industry: discoveryRequest!.industry,
        city: discoveryRequest!.city,
        state: discoveryRequest!.state,
        limit: businesses.length,
        businesses: businesses.map((b) => ({
          place_id: b.id,
          name: b.name,
          address: b.address,
          phone: b.phone,
          rating: b.rating,
          reviews: b.reviews,
          website: b.website,
          hasWebsite: b.hasWebsite === true,
        })),
      });
      handleJobCreated(job);
    } catch (error) {
      console.error('Error generating websites:', error);
    }
  };

  const handleJobSelect = (job: JobResponse) => {
    setSelectedJob(job);
    // Load existing logs for this job if available
    const existingLogs = allLogs.get(job.job_id) || [];
    setLogMessages(existingLogs);
  };

  // Get all logs combined for logs view
  const getAllLogsCombined = () => {
    const combined: WebSocketMessage[] = [];
    allLogs.forEach((logs) => {
      combined.push(...logs);
    });
    // Sort by timestamp
    return combined.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const completedJobs = jobs.filter(j => j.status === JobStatus.COMPLETED).length;
  const successRate = jobs.length > 0 ? Math.round((completedJobs / jobs.length) * 100) : 0;

  const renderContent = () => {
    switch (activeView) {
      case 'jobs':
        return (
          <div className="space-y-6">
            <div>
              <h1 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Jobs</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Manage and monitor website generation jobs</p>
            </div>
            <JobList
              jobs={jobs}
              onRefresh={loadJobs}
              onJobSelect={handleJobSelect}
              selectedJobId={selectedJob?.job_id}
              onJobCancel={(jobId) => {
                if (selectedJob?.job_id === jobId) setSelectedJob(null);
              }}
            />
          </div>
        );
      case 'websites':
        return (
          <div className="space-y-6">
            <div>
              <h1 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Websites</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>View and manage generated websites</p>
            </div>
            <WebsiteList />
          </div>
        );
      case 'logs':
        return (
          <div className="space-y-6">
            <div>
              <h1 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Logs</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>View real-time logs from all jobs</p>
            </div>
            <LogViewer
              messages={getAllLogsCombined()}
              filterLevel={undefined}
              fullHeight={true}
            />
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Settings</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Configure your preferences</p>
            </div>
            <div className={`${theme === 'dark' ? 'bg-[#111827] border-[#1F2937] text-gray-400' : 'bg-white border-gray-200 text-gray-600'} border rounded-xl p-6 transition-colors duration-200`}>
              <p className="text-sm">Settings coming soon...</p>
            </div>
          </div>
        );
      default: // dashboard
        return (
          <div className="space-y-6">
            <div>
              <h1 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>AI Website Generator</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Generate SEO-optimized websites for local businesses</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Total Jobs"
                value={jobs.length}
                subtitle={`${completedJobs} completed`}
              />
              <StatCard
                label="Generated Websites"
                value={websites.length}
                subtitle="All time"
              />
              <StatCard
                label="Success Rate"
                value={`${successRate}%`}
                subtitle={`${completedJobs} of ${jobs.length}`}
              />
            </div>

            {/* Generator Form */}
            <JobForm 
              onJobCreated={handleJobCreated}
              onStartDiscovery={handleStartDiscovery}
            />

            {/* Discovery Section */}
            {isDiscoveryMode && discoveryRequest && (
              <DiscoverySection
                discoveryRequest={discoveryRequest}
                onGenerateForBusinesses={handleGenerateForBusinesses}
                onClose={() => {
                  setIsDiscoveryMode(false);
                  setDiscoveryRequest(null);
                }}
              />
            )}

            {/* Job Details */}
            {selectedJob && !isDiscoveryMode && (
              <div className="space-y-6">
                <AgentPipelineView
                  jobId={selectedJob.job_id}
                  initialJob={selectedJob}
                />
                <ProgressTracker
                  progress={selectedJob.progress}
                  status={selectedJob.status}
                />
              </div>
            )}

            {!selectedJob && !isDiscoveryMode && jobs.length > 0 && (
              <div className={`${theme === 'dark' ? 'bg-[#111827] border-[#1F2937] text-gray-400' : 'bg-white border-gray-200 text-gray-600'} border rounded-xl p-6 text-center transition-colors duration-200`}>
                <p className="text-sm">Select a job from the Jobs view to see details and logs.</p>
              </div>
            )}
          </div>
        );
    }
  };

  const bgClass = theme === 'dark' ? 'bg-[#0B1220]' : 'bg-gray-50';

  return (
    <div className={`min-h-screen ${bgClass} flex transition-colors duration-200`}>
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 ml-[240px]">
        <main className="p-8">
          {renderContent()}
        </main>
      </div>

    </div>
  );
}

export default App;

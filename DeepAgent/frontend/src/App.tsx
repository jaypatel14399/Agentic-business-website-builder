import { useState, useEffect, useCallback, useRef } from 'react';

const ACTIVE_VIEW_KEY = 'deepagent_activeView';
const SELECTED_JOB_ID_KEY = 'deepagent_selectedJobId';
const VALID_VIEWS = ['dashboard', 'jobs', 'websites', 'logs', 'settings'] as const;

function getStoredActiveView(): 'dashboard' | 'jobs' | 'websites' | 'logs' | 'settings' {
  try {
    const s = sessionStorage.getItem(ACTIVE_VIEW_KEY);
    if (s && VALID_VIEWS.includes(s as any)) return s as typeof VALID_VIEWS[number];
  } catch (_) {}
  return 'dashboard';
}
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
import { jobsApi, websitesApi } from './api/client';
import { discoveryApi } from './api/client';
import { ConfirmDialog } from './components/ConfirmDialog';
import { stripAnsi } from './utils/stripAnsi';

function App() {
  const { theme } = useTheme();
  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [logMessages, setLogMessages] = useState<WebSocketMessage[]>([]);
  const [allLogs, setAllLogs] = useState<Map<string, WebSocketMessage[]>>(new Map());
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [websites, setWebsites] = useState<any[]>([]);
  const [activeView, setActiveViewState] = useState<'dashboard' | 'jobs' | 'websites' | 'logs' | 'settings'>(getStoredActiveView);
  const setActiveView = useCallback((view: 'dashboard' | 'jobs' | 'websites' | 'logs' | 'settings') => {
    setActiveViewState(view);
    try {
      sessionStorage.setItem(ACTIVE_VIEW_KEY, view);
    } catch (_) {}
  }, []);
  const [isDiscoveryMode, setIsDiscoveryMode] = useState(false);
  const [discoveryRequest, setDiscoveryRequest] = useState<DiscoveryRequest | null>(null);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [buildOpenSiteId, setBuildOpenSiteId] = useState<string | null>(null);
  const hasRestoredJobRef = useRef(false);

  const loadJobs = useCallback(async () => {
    try {
      const jobList = await jobsApi.listJobs();
      setJobs(jobList);
      if (!hasRestoredJobRef.current) {
        hasRestoredJobRef.current = true;
        try {
          const storedId = sessionStorage.getItem(SELECTED_JOB_ID_KEY);
          if (storedId && jobList.some((j) => j.job_id === storedId)) {
            const job = jobList.find((j) => j.job_id === storedId)!;
            setSelectedJob(job);
          }
        } catch (_) {}
      }
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
    try {
      if (selectedJob) sessionStorage.setItem(SELECTED_JOB_ID_KEY, selectedJob.job_id);
      else sessionStorage.removeItem(SELECTED_JOB_ID_KEY);
    } catch (_) {}
  }, [selectedJob]);

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
      const step = message.step || '';
      const isCompleted = step === 'completed';
      setSelectedJob((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          progress: {
            step,
            progress: message.progress ?? 100,
            details: message.details || {},
            timestamp: message.timestamp,
          },
          ...(isCompleted ? { status: JobStatus.COMPLETED } : {}),
        };
      });
      // Refetch job when completed so we get generated_websites and final state
      if (isCompleted && selectedJob?.job_id) {
        jobsApi.getJob(selectedJob.job_id).then((updated) => {
          setSelectedJob(updated);
          setJobs((prev) =>
            prev.map((j) => (j.job_id === updated.job_id ? updated : j))
          );
        }).catch((err) => console.error('Failed to refetch job:', err));
      }
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
                {/* Generated websites (when job completed) */}
                {selectedJob.status === JobStatus.COMPLETED && selectedJob.generated_websites?.length > 0 && (
                  <div className={`rounded-xl border p-6 transition-colors duration-200 ${theme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                      Generated Websites ({selectedJob.generated_websites.length})
                    </h3>
                    <div className="space-y-4">
                      {selectedJob.generated_websites.map((site) => (
                        <div
                          key={site.site_id}
                          className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-[#0B1220] border-[#1F2937]' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex justify-between items-start gap-4 flex-wrap">
                            <div className="min-w-0 flex-1">
                              <h4 className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                                {site.business_name}
                              </h4>
                              <p className={`font-mono text-xs mt-1 break-all ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                {site.path}
                              </p>
                              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                Created: {new Date(site.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 shrink-0">
                              <button
                                type="button"
                                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-xs font-medium transition-colors"
                                onClick={() => {
                                  navigator.clipboard.writeText(site.path);
                                  alert('Path copied to clipboard');
                                }}
                              >
                                Copy path
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                disabled={buildOpenSiteId !== null}
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setBuildOpenSiteId(site.site_id);
                                  try {
                                    const { url } = await websitesApi.buildAndOpen(site.site_id);
                                    window.open(url, '_blank', 'noopener');
                                  } catch (err: any) {
                                    const msg = err?.response?.data?.detail || err?.message || 'Failed to start dev server';
                                    setBuildError(stripAnsi(typeof msg === 'string' ? msg : JSON.stringify(msg)));
                                  } finally {
                                    setBuildOpenSiteId(null);
                                  }
                                }}
                              >
                                {buildOpenSiteId === site.site_id ? (
                                  <>
                                    <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Starting…
                                  </>
                                ) : (
                                  'Build & Open'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
      {buildOpenSiteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`rounded-xl shadow-xl p-6 max-w-sm mx-4 flex flex-col items-center gap-4 ${theme === 'dark' ? 'bg-[#111827]' : 'bg-white'}`}>
            <span className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className={`font-medium text-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
              Installing dependencies and starting dev server…
            </p>
            <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              The site will open in a new tab when ready.
            </p>
          </div>
        </div>
      )}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 ml-[240px]">
        <main className="p-8">
          {renderContent()}
        </main>
      </div>

      <ConfirmDialog
        open={buildError !== null}
        title="Build & Open Error"
        message={buildError || ''}
        confirmLabel="OK"
        cancelLabel=""
        onConfirm={() => setBuildError(null)}
        onCancel={() => setBuildError(null)}
      />
    </div>
  );
}

export default App;

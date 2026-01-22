import { ProgressUpdate } from '../types';

interface ProgressTrackerProps {
  progress?: ProgressUpdate;
  status: string;
}

export const ProgressTracker = ({ progress, status }: ProgressTrackerProps) => {
  const steps = [
    { id: 'discovering_businesses', label: 'Discovering Businesses', progress: 0 },
    { id: 'detecting_websites', label: 'Detecting Websites', progress: 0 },
    { id: 'filtering_businesses', label: 'Filtering', progress: 0 },
    { id: 'processing_business', label: 'Processing Businesses', progress: 0 },
    { id: 'completed', label: 'Completed', progress: 0 },
  ];

  const getStepProgress = (stepId: string) => {
    if (!progress) return 0;
    
    const stepMap: Record<string, number> = {
      discovering_businesses: 20,
      detecting_websites: 35,
      filtering_businesses: 45,
      processing_business: 95,
      completed: 100,
    };

    if (progress.step === stepId) {
      return progress.progress;
    }

    const currentStepIndex = steps.findIndex((s) => s.id === progress.step);
    const stepIndex = steps.findIndex((s) => s.id === stepId);

    if (stepIndex < currentStepIndex) {
      return stepMap[stepId] || 0;
    }
    if (stepIndex > currentStepIndex) {
      return 0;
    }

    return 0;
  };

  const getCurrentStepIndex = () => {
    if (!progress) return -1;
    return steps.findIndex((s) => s.id === progress.step);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Progress</h3>
      <div style={styles.statusBadge}>
        Status: <span style={styles.statusValue}>{status}</span>
      </div>
      {progress && (
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progress.progress}%`,
            }}
          />
        </div>
      )}
      <div style={styles.steps}>
        {steps.map((step, idx) => {
          const stepProgress = getStepProgress(step.id);
          const isActive = idx === currentStepIndex;
          const isCompleted = idx < currentStepIndex;

          return (
            <div
              key={step.id}
              style={{
                ...styles.step,
                ...(isActive ? styles.stepActive : {}),
                ...(isCompleted ? styles.stepCompleted : {}),
              }}
            >
              <div style={styles.stepIndicator}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <div style={styles.stepContent}>
                <div style={styles.stepLabel}>{step.label}</div>
                {isActive && progress?.details && (
                  <div style={styles.stepDetails}>
                    {progress.details.message || JSON.stringify(progress.details)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '16px',
  },
  statusBadge: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
  },
  statusValue: {
    fontWeight: 'bold',
    color: '#007bff',
    textTransform: 'capitalize',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '24px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007bff',
    transition: 'width 0.3s ease',
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    borderRadius: '4px',
    backgroundColor: '#f8f9fa',
  },
  stepActive: {
    backgroundColor: '#e7f3ff',
    borderLeft: '3px solid #007bff',
  },
  stepCompleted: {
    backgroundColor: '#f0f9f0',
  },
  stepIndicator: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#dee2e6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: '#666',
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontWeight: '500',
    color: '#333',
    marginBottom: '4px',
  },
  stepDetails: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  },
};

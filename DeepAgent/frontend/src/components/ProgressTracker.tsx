import { ProgressUpdate } from '../types';
import {
  PIPELINE_STEPS,
  getStepLabel,
  isStepActive,
  isStepCompleted,
} from '../constants/pipelineSteps';

interface ProgressTrackerProps {
  progress?: ProgressUpdate;
  status: string;
}

/** Steps to show in the list (exclude initializing and failed as separate row; failed shown in summary) */
const TRACKER_STEP_IDS = PIPELINE_STEPS.filter(
  (s) => s.id !== 'initializing' && s.id !== 'failed'
).map((s) => s.id);

export const ProgressTracker = ({ progress, status }: ProgressTrackerProps) => {
  const currentStepId = progress?.step ?? '';
  const details = progress?.details ?? {};
  const isDone = currentStepId === 'completed' || currentStepId === 'failed' || status === 'completed' || status === 'failed';
  const websitesGenerated = details.websites_generated as number | undefined;
  const totalBusinesses = details.total_businesses as number | undefined;
  const errorMessage = details.error as string | undefined;
  const message = details.message as string | undefined;

  const stepsToShow = PIPELINE_STEPS.filter((s) => TRACKER_STEP_IDS.includes(s.id));

  return (
    <div className="progress-tracker">
      <h3 className="progress-tracker__title">Progress</h3>
      <div className="progress-tracker__status">
        Status: <span className="progress-tracker__status-value">{status}</span>
      </div>
      {progress && (
        <div className="progress-tracker__bar">
          <div
            className="progress-tracker__bar-fill"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      )}
      <div className="progress-tracker__steps">
        {stepsToShow.map((step) => {
          const active = isStepActive(currentStepId, step.id);
          const completed = isStepCompleted(currentStepId, step.id);

          return (
            <div
              key={step.id}
              className={`progress-tracker__step progress-tracker__step--${completed ? 'completed' : active ? 'active' : 'pending'}`}
            >
              <div className="progress-tracker__step-indicator">
                {completed ? '✓' : stepsToShow.indexOf(step) + 1}
              </div>
              <div className="progress-tracker__step-content">
                <div className="progress-tracker__step-label">{getStepLabel(step.id)}</div>
                {active && progress?.details && (
                  <div className="progress-tracker__step-details">
                    {details.business_name && (
                      <span className="progress-tracker__business-name">
                        {details.business_name}
                        {details.business_index != null && details.total_businesses != null && (
                          <span className="progress-tracker__business-index">
                            {' '}({details.business_index}/{details.total_businesses})
                          </span>
                        )}
                      </span>
                    )}
                    {(message || details.message) && (
                      <span className="progress-tracker__message">
                        {message ?? details.message}
                      </span>
                    )}
                    {!details.business_name && !message && !details.message && Object.keys(details).length > 0 && (
                      <span className="progress-tracker__message">
                        {JSON.stringify(details)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {isDone && (
        <div className={`progress-tracker__summary progress-tracker__summary--${currentStepId === 'failed' ? 'failed' : 'completed'}`}>
          {currentStepId === 'failed' || status === 'failed' ? (
            <>
              <strong>Run failed</strong>
              {errorMessage && <p className="progress-tracker__summary-error">{errorMessage}</p>}
            </>
          ) : (
            <>
              <strong>Run completed</strong>
              {websitesGenerated != null && totalBusinesses != null && (
                <p className="progress-tracker__summary-count">
                  Generated {websitesGenerated} of {totalBusinesses} website(s).
                </p>
              )}
              {message && <p className="progress-tracker__summary-message">{message}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
};

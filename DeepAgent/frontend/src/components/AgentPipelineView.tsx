import { ProgressUpdate } from '../types';
import {
  PIPELINE_STEPS,
  PIPELINE_STRIP_IDS,
  getStepLabel,
  isStepActive,
  isStepCompleted,
} from '../constants/pipelineSteps';

interface AgentPipelineViewProps {
  progress?: ProgressUpdate | null;
  status: string;
}

export const AgentPipelineView = ({ progress, status }: AgentPipelineViewProps) => {
  const currentStepId = progress?.step ?? '';
  const details = progress?.details ?? {};
  const businessName = details.business_name as string | undefined;
  const message = details.message as string | undefined;
  const businessIndex = details.business_index as number | undefined;
  const totalBusinesses = details.total_businesses as number | undefined;
  const isFailed = currentStepId === 'failed' || status === 'failed';

  const stripSteps = PIPELINE_STEPS.filter((s) =>
    (PIPELINE_STRIP_IDS as readonly string[]).includes(s.id)
  );

  return (
    <div className="agent-pipeline">
      <h3 className="agent-pipeline__title">Agent pipeline</h3>
      <div className="agent-pipeline__strip" role="list">
        {stripSteps.map((step, idx) => {
          const active = isStepActive(currentStepId, step.id);
          const completed = isStepCompleted(currentStepId, step.id);
          const failed = step.id === 'failed' && (active || isFailed);
          const state = failed ? 'failed' : completed ? 'completed' : active ? 'active' : 'pending';
          if (step.id === 'failed' && !isFailed && !active) return null;
          return (
            <div
              key={step.id}
              className={`agent-pipeline__node agent-pipeline__node--${state}`}
              role="listitem"
            >
              <div className="agent-pipeline__node-indicator">
                {completed && step.id !== 'failed' ? (
                  <span className="agent-pipeline__check">✓</span>
                ) : (
                  <span className="agent-pipeline__num">{idx + 1}</span>
                )}
              </div>
              <span className="agent-pipeline__node-label">{getStepLabel(step.id)}</span>
              {idx < stripSteps.length - 1 && (
                <span className="agent-pipeline__connector" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
      {(businessName || message) && (
        <div className="agent-pipeline__detail">
          {businessIndex != null && totalBusinesses != null && (
            <span className="agent-pipeline__business-index">
              Business {businessIndex}/{totalBusinesses}
            </span>
          )}
          {businessName && (
            <span className="agent-pipeline__business-name">{businessName}</span>
          )}
          {message && (
            <span className="agent-pipeline__message">{message}</span>
          )}
        </div>
      )}
    </div>
  );
};

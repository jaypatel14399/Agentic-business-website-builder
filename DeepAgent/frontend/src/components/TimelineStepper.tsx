import { PipelineStage } from './AgentPipelineView';
import { useTheme } from '../contexts/ThemeContext';

interface TimelineStepperProps {
  stages: PipelineStage[];
  currentStage: string;
  jobStatus: string;
}

export const TimelineStepper = ({ stages, currentStage, jobStatus }: TimelineStepperProps) => {
  const { theme } = useTheme();
  
  const cardBg = theme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-gray-200';
  const lineBg = theme === 'dark' ? 'bg-[#1F2937]' : 'bg-gray-200';
  const titleColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const textColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  // Filter out failed stage if job hasn't failed
  const displayStages = jobStatus === 'failed' 
    ? stages 
    : stages.filter(s => s.id !== 'failed');

  return (
    <div className={`${cardBg} border rounded-xl p-6 transition-colors duration-200`}>
      <h3 className={`text-sm font-semibold ${titleColor} mb-6`}>Agent Pipeline</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className={`absolute left-3 top-0 bottom-0 w-[1px] ${lineBg}`} />
        
        <div className="space-y-6">
          {displayStages.map((stage, idx) => {
            const isActive = stage.id === currentStage;
            const isCompleted = stage.status === 'completed';
            const isRunning = stage.status === 'running';
            const isFailed = stage.status === 'failed';
            const isPending = stage.status === 'pending';

            return (
              <div key={stage.id} className="relative flex items-start gap-4">
                {/* Circle indicator */}
                <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isRunning
                    ? 'bg-indigo-500 text-white animate-pulse'
                    : isFailed
                    ? 'bg-red-500 text-white'
                    : theme === 'dark'
                    ? 'bg-[#1F2937] border border-[#374151] text-gray-500'
                    : 'bg-gray-200 border border-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <span className="text-xs">✓</span>
                  ) : isFailed ? (
                    <span className="text-xs">✕</span>
                  ) : isRunning ? (
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                
                {/* Step content */}
                <div className="flex-1 pt-0.5">
                  <div className={`text-sm font-medium transition-colors duration-200 ${
                    isRunning
                      ? 'text-indigo-500'
                      : isCompleted
                      ? 'text-green-500'
                      : isFailed
                      ? 'text-red-500'
                      : textColor
                  }`}>
                    {stage.label}
                    {isRunning && (
                      <span className="ml-2 inline-block w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import { ProgressUpdate } from '../types';
import { DarkProgressBar } from './DarkProgressBar';
import { useTheme } from '../contexts/ThemeContext';

interface ProgressTrackerProps {
  progress?: ProgressUpdate;
  status: string;
}

export const ProgressTracker = ({ progress, status }: ProgressTrackerProps) => {
  const { theme } = useTheme();
  const details = progress?.details ?? {};
  const isDone = progress?.step === 'completed' || progress?.step === 'failed' || status === 'completed' || status === 'failed';
  const websitesGenerated = details.websites_generated as number | undefined;
  const totalBusinesses = details.total_businesses as number | undefined;
  const errorMessage = details.error as string | undefined;
  const message = details.message as string | undefined;

  const cardBg = theme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-gray-200';
  const titleColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const textColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`${cardBg} border rounded-xl p-6 transition-colors duration-200`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-sm font-semibold ${titleColor}`}>Progress</h3>
        <span className={`text-xs ${textColor} capitalize`}>{status}</span>
      </div>
      {progress && (
        <div className="mb-6">
          <DarkProgressBar progress={progress.progress} />
        </div>
      )}
      {isDone && (
        <div className={`p-4 rounded-lg text-sm ${
          progress?.step === 'failed' || status === 'failed'
            ? 'bg-red-500/10 border border-red-500/20 text-red-500'
            : 'bg-green-500/10 border border-green-500/20 text-green-600'
        }`}>
          {progress?.step === 'failed' || status === 'failed' ? (
            <>
              <div className="font-semibold mb-2">Run failed</div>
              {errorMessage && <div className={`text-xs ${textColor}`}>{errorMessage}</div>}
            </>
          ) : (
            <>
              <div className="font-semibold mb-2">Run completed</div>
              {websitesGenerated != null && totalBusinesses != null && (
                <div className={`text-xs ${textColor}`}>
                  Generated {websitesGenerated} of {totalBusinesses} website(s).
                </div>
              )}
              {message && <div className={`text-xs ${textColor} mt-1`}>{message}</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
};

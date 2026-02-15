import { useTheme } from '../contexts/ThemeContext';

interface DarkProgressBarProps {
  progress: number;
  showPercentage?: boolean;
}

export const DarkProgressBar = ({ progress, showPercentage = true }: DarkProgressBarProps) => {
  const { theme } = useTheme();
  const barBg = theme === 'dark' ? 'bg-[#1F2937]' : 'bg-gray-200';
  const textColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="space-y-2">
      <div className={`${barBg} h-2 rounded-full overflow-hidden transition-colors duration-200`}>
        <div
          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {showPercentage && (
        <div className={`text-right text-xs ${textColor} font-medium`}>
          {progress.toFixed(1)}%
        </div>
      )}
    </div>
  );
};

import { useTheme } from '../contexts/ThemeContext';

type Mode = 'auto' | 'manual';

interface ModeToggleProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  const { theme } = useTheme();
  const buttonBg = theme === 'dark' ? 'bg-[#0B1220] border-[#1F2937]' : 'bg-gray-100 border-gray-300';
  const activeBg = theme === 'dark' ? 'bg-indigo-600' : 'bg-indigo-600';
  const textColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const activeText = 'text-white';

  return (
    <div className={`flex gap-2 p-1 ${buttonBg} border rounded-lg`}>
      <button
        type="button"
        onClick={() => onModeChange('auto')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          mode === 'auto' ? `${activeBg} ${activeText}` : textColor
        }`}
      >
        Auto Select Mode
      </button>
      <button
        type="button"
        onClick={() => onModeChange('manual')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          mode === 'manual' ? `${activeBg} ${activeText}` : textColor
        }`}
      >
        Manual Select Mode
      </button>
    </div>
  );
};

import { useTheme } from '../contexts/ThemeContext';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
}

export const StatCard = ({ label, value, subtitle }: StatCardProps) => {
  const { theme } = useTheme();
  const bgClass = theme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-gray-200';
  const textLabel = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const textValue = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const textSubtitle = theme === 'dark' ? 'text-gray-500' : 'text-gray-500';

  return (
    <div className={`${bgClass} border rounded-xl p-6 transition-colors duration-200`}>
      <div className={`text-xs ${textLabel} uppercase tracking-wide mb-2`}>{label}</div>
      <div className={`text-2xl font-semibold ${textValue} mb-1`}>{value}</div>
      {subtitle && <div className={`text-xs ${textSubtitle}`}>{subtitle}</div>}
    </div>
  );
};

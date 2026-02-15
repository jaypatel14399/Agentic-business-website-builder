export const getThemeClasses = (theme: 'dark' | 'light') => {
  return {
    bg: theme === 'dark' ? 'bg-[#0B1220]' : 'bg-gray-50',
    bgSurface: theme === 'dark' ? 'bg-[#111827]' : 'bg-white',
    bgSidebar: theme === 'dark' ? 'bg-[#0F172A]' : 'bg-gray-50',
    border: theme === 'dark' ? 'border-[#1F2937]' : 'border-gray-200',
    textPrimary: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    textMuted: theme === 'dark' ? 'text-gray-500' : 'text-gray-500',
    inputBg: theme === 'dark' ? 'bg-[#0B1220]' : 'bg-white',
    hoverBg: theme === 'dark' ? 'hover:bg-[#111827]' : 'hover:bg-gray-100',
  };
};

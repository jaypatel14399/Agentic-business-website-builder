import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  activeView: 'dashboard' | 'jobs' | 'websites' | 'logs' | 'settings';
  onViewChange: (view: 'dashboard' | 'jobs' | 'websites' | 'logs' | 'settings') => void;
}

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const { theme, toggleTheme } = useTheme();
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard' },
    { id: 'jobs' as const, label: 'Jobs' },
    { id: 'websites' as const, label: 'Websites' },
    { id: 'logs' as const, label: 'Logs' },
    { id: 'settings' as const, label: 'Settings' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full w-[240px] flex flex-col transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-[#0F172A] border-r border-[#1F2937]' 
        : 'bg-gray-50 border-r border-gray-200'
    }`}>
      <div className={`p-6 border-b ${theme === 'dark' ? 'border-[#1F2937]' : 'border-gray-200'}`}>
        <div className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
          DeepAgent
        </div>
        <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          AI Website Generator
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeView === item.id
                ? 'bg-indigo-600/20 text-indigo-400'
                : theme === 'dark'
                ? 'text-gray-400 hover:text-gray-200 hover:bg-[#1F2937]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className={`p-4 border-t ${theme === 'dark' ? 'border-[#1F2937]' : 'border-gray-200'}`}>
        <button
          onClick={toggleTheme}
          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-[#1F2937] text-gray-300 hover:bg-[#374151]'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
    </div>
  );
};

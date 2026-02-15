import { useEffect, useRef, useState } from 'react';
import { WebSocketMessage } from '../types';
import { getStepLabel } from '../constants/pipelineSteps';
import { useTheme } from '../contexts/ThemeContext';

type TabId = 'logs' | 'progress';
const LOG_LEVELS = ['ALL', 'INFO', 'WARNING', 'ERROR', 'DEBUG'] as const;

interface LogViewerProps {
  messages: WebSocketMessage[];
  filterLevel?: string;
  fullHeight?: boolean;
}

export const LogViewer = ({ messages, filterLevel: filterLevelProp, fullHeight = false }: LogViewerProps) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>('logs');
  const [levelFilter, setLevelFilter] = useState<string>(filterLevelProp ?? 'ALL');
  const [collapsed, setCollapsed] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const logMessages = messages.filter((m) => m.type === 'log');
  const progressMessages = messages.filter((m) => m.type === 'progress');

  const logsFilteredByLevel =
    levelFilter === 'ALL'
      ? logMessages
      : logMessages.filter((msg) => msg.level?.toUpperCase() === levelFilter);

  const displayMessages = activeTab === 'logs' ? logsFilteredByLevel : progressMessages;

  const getLogColorClass = (level?: string) => {
    switch (level?.toUpperCase()) {
      case 'ERROR':
        return 'text-red-500';
      case 'WARNING':
        return 'text-yellow-500';
      case 'INFO':
        return 'text-blue-500';
      case 'DEBUG':
        return 'text-gray-500';
      default:
        return 'text-gray-300';
    }
  };

  const cardBg = theme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-gray-200';
  const borderColor = theme === 'dark' ? 'border-[#1F2937]' : 'border-gray-200';
  const titleColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const buttonBg = theme === 'dark' ? 'bg-[#0B1220] border-[#1F2937] text-gray-400 hover:text-gray-200' : 'bg-gray-100 border-gray-300 text-gray-600 hover:text-gray-900';
  const logBg = theme === 'dark' ? 'bg-[#0B1220] text-gray-300' : 'bg-gray-900 text-gray-300';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-500';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  const heightClass = fullHeight 
    ? (collapsed ? 'min-h-auto' : 'h-[calc(100vh-200px)]')
    : (collapsed ? 'min-h-auto' : 'h-[400px]');

  return (
    <div className={`${cardBg} border rounded-xl flex flex-col transition-colors duration-200 ${heightClass}`}>
      <div className={`p-4 border-b ${borderColor} flex justify-between items-center`}>
        <h3 className={`text-sm font-semibold ${titleColor}`}>Real-time Activity</h3>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeTab === 'logs'
                  ? 'bg-indigo-600 text-white'
                  : buttonBg
              }`}
              onClick={() => setActiveTab('logs')}
            >
              Logs
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeTab === 'progress'
                  ? 'bg-indigo-600 text-white'
                  : buttonBg
              }`}
              onClick={() => setActiveTab('progress')}
            >
              Progress
            </button>
          </div>
          <button
            type="button"
            className={`px-2 py-1 ${buttonBg} rounded-lg text-xs font-medium transition-all duration-200`}
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Expand logs' : 'Collapse logs'}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>
      {!collapsed && activeTab === 'logs' && (
        <div className={`px-4 py-2 border-b ${borderColor} flex items-center gap-2 flex-wrap`}>
          <span className={`text-xs ${textMuted} uppercase tracking-wide`}>Level:</span>
          {LOG_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                levelFilter === level
                  ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-500'
                  : buttonBg
              }`}
              onClick={() => setLevelFilter(level)}
            >
              {level}
            </button>
          ))}
        </div>
      )}
      {!collapsed && (
        <div className={`flex-1 overflow-y-auto p-4 ${logBg} font-mono text-xs transition-colors duration-200`}>
          {displayMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-20 italic">
              {activeTab === 'logs'
                ? 'No logs yet. Start a job to see logs here.'
                : 'No progress events yet.'}
            </div>
          ) : (
            displayMessages.map((msg, idx) => (
              <div key={idx} className="mb-2 leading-relaxed break-words">
                {msg.type === 'log' && (
                  <>
                    <span className="text-gray-500 mr-2">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`font-semibold uppercase mr-2 ${getLogColorClass(msg.level)}`}>
                      {msg.level}
                    </span>
                    <span className="text-gray-300">{msg.message}</span>
                  </>
                )}
                {msg.type === 'progress' && (
                  <div className="flex gap-3 items-center flex-wrap text-emerald-400">
                    <span className="text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="font-medium capitalize">
                      {getStepLabel(msg.step ?? '')}
                    </span>
                    <span className="font-semibold">
                      {msg.progress?.toFixed(1)}%
                    </span>
                    {msg.details?.message && (
                      <span className="text-gray-500 text-xs">{msg.details.message}</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
};

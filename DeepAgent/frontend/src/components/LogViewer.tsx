import { useEffect, useRef, useState } from 'react';
import { WebSocketMessage } from '../types';
import { getStepLabel } from '../constants/pipelineSteps';

type TabId = 'logs' | 'progress';
const LOG_LEVELS = ['ALL', 'INFO', 'WARNING', 'ERROR', 'DEBUG'] as const;

interface LogViewerProps {
  messages: WebSocketMessage[];
  filterLevel?: string;
}

export const LogViewer = ({ messages, filterLevel: filterLevelProp }: LogViewerProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('logs');
  const [levelFilter, setLevelFilter] = useState<string>(filterLevelProp ?? 'ALL');
  const [collapsed, setCollapsed] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getLogColor = (level?: string) => {
    switch (level?.toUpperCase()) {
      case 'ERROR':
        return '#dc3545';
      case 'WARNING':
        return '#ffc107';
      case 'INFO':
        return '#007bff';
      case 'DEBUG':
        return '#6c757d';
      default:
        return '#333';
    }
  };

  const logMessages = messages.filter((m) => m.type === 'log');
  const progressMessages = messages.filter((m) => m.type === 'progress');

  const logsFilteredByLevel =
    levelFilter === 'ALL'
      ? logMessages
      : logMessages.filter((msg) => msg.level?.toUpperCase() === levelFilter);

  const displayMessages = activeTab === 'logs' ? logsFilteredByLevel : progressMessages;

  return (
    <div className={`log-viewer ${collapsed ? 'log-viewer--collapsed' : ''}`}>
      <div className="log-viewer__header">
        <h3 className="log-viewer__title">Real-time activity</h3>
        <div className="log-viewer__header-actions">
          <div className="log-viewer__tabs">
            <button
              type="button"
              className={`log-viewer__tab ${activeTab === 'logs' ? 'log-viewer__tab--active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              Logs
            </button>
            <button
              type="button"
              className={`log-viewer__tab ${activeTab === 'progress' ? 'log-viewer__tab--active' : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              Progress events
            </button>
          </div>
          <button
            type="button"
            className="log-viewer__collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Expand logs' : 'Collapse logs'}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>
      {!collapsed && activeTab === 'logs' && (
        <div className="log-viewer__level-filter">
          <span className="log-viewer__level-label">Level:</span>
          {LOG_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              className={`log-viewer__level-btn ${levelFilter === level ? 'log-viewer__level-btn--active' : ''}`}
              onClick={() => setLevelFilter(level)}
            >
              {level}
            </button>
          ))}
        </div>
      )}
      {!collapsed && (
      <div className="log-viewer__content">
        {displayMessages.length === 0 ? (
          <div className="log-viewer__empty">
            {activeTab === 'logs'
              ? 'No logs yet. Start a job to see logs here.'
              : 'No progress events yet.'}
          </div>
        ) : (
          displayMessages.map((msg, idx) => (
            <div key={idx} className="log-viewer__entry">
              {msg.type === 'log' && (
                <>
                  <span className="log-viewer__timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className="log-viewer__level"
                    style={{ color: getLogColor(msg.level) }}
                  >
                    {msg.level}
                  </span>
                  <span className="log-viewer__message">{msg.message}</span>
                </>
              )}
              {msg.type === 'progress' && (
                <div className="log-viewer__progress-entry">
                  <span className="log-viewer__timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="log-viewer__progress-step">
                    {getStepLabel(msg.step ?? '')}
                  </span>
                  <span className="log-viewer__progress-value">
                    {msg.progress?.toFixed(1)}%
                  </span>
                  {msg.details?.message && (
                    <span className="log-viewer__progress-detail">{msg.details.message}</span>
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

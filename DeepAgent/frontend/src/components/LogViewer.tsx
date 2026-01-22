import { useEffect, useRef } from 'react';
import { WebSocketMessage } from '../types';

interface LogViewerProps {
  messages: WebSocketMessage[];
  filterLevel?: string;
}

export const LogViewer = ({ messages, filterLevel }: LogViewerProps) => {
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

  const filteredMessages = filterLevel
    ? messages.filter((msg) => msg.level?.toUpperCase() === filterLevel.toUpperCase())
    : messages;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Real-Time Logs</h3>
        {filterLevel && (
          <span style={styles.filter}>Filter: {filterLevel}</span>
        )}
      </div>
      <div style={styles.logContainer}>
        {filteredMessages.length === 0 ? (
          <div style={styles.empty}>No logs yet. Start a job to see logs here.</div>
        ) : (
          filteredMessages.map((msg, idx) => (
            <div key={idx} style={styles.logEntry}>
              {msg.type === 'log' && (
                <>
                  <span style={styles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    style={{
                      ...styles.level,
                      color: getLogColor(msg.level),
                    }}
                  >
                    {msg.level}
                  </span>
                  <span style={styles.message}>{msg.message}</span>
                </>
              )}
              {msg.type === 'progress' && (
                <div style={styles.progressEntry}>
                  <span style={styles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  <span style={styles.progressStep}>{msg.step}</span>
                  <span style={styles.progressValue}>
                    {msg.progress?.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: '400px',
  },
  header: {
    padding: '16px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  filter: {
    fontSize: '12px',
    color: '#666',
    padding: '4px 8px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
  },
  logContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    fontFamily: 'monospace',
    fontSize: '13px',
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
  },
  logEntry: {
    marginBottom: '8px',
    lineHeight: '1.5',
    wordBreak: 'break-word',
  },
  timestamp: {
    color: '#858585',
    marginRight: '8px',
  },
  level: {
    fontWeight: 'bold',
    marginRight: '8px',
    textTransform: 'uppercase',
  },
  message: {
    color: '#d4d4d4',
  },
  progressEntry: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    color: '#4ec9b0',
  },
  progressStep: {
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  progressValue: {
    fontWeight: 'bold',
  },
  empty: {
    color: '#858585',
    textAlign: 'center',
    padding: '40px',
    fontStyle: 'italic',
  },
};

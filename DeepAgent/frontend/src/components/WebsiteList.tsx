import { useEffect, useState } from 'react';
import { WebsiteInfo } from '../types';
import { websitesApi } from '../api/client';

export const WebsiteList = () => {
  const [websites, setWebsites] = useState<WebsiteInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWebsites = async () => {
    try {
      const response = await websitesApi.listWebsites();
      setWebsites(response.websites);
    } catch (error) {
      console.error('Error loading websites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebsites();
    const interval = setInterval(loadWebsites, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (siteId: string) => {
    if (!confirm('Are you sure you want to delete this website?')) {
      return;
    }

    try {
      await websitesApi.deleteWebsite(siteId);
      loadWebsites();
    } catch (error) {
      console.error('Error deleting website:', error);
      alert('Failed to delete website');
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading websites...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Generated Websites ({websites.length})</h3>
        <button onClick={loadWebsites} style={styles.refreshButton}>
          Refresh
        </button>
      </div>
      <div style={styles.list}>
        {websites.length === 0 ? (
          <div style={styles.empty}>No websites generated yet.</div>
        ) : (
          websites.map((website) => (
            <div key={website.site_id} style={styles.websiteItem}>
              <div style={styles.websiteHeader}>
                <h4 style={styles.websiteName}>{website.business_name}</h4>
                <span style={styles.websiteId}>{website.site_id}</span>
              </div>
              <div style={styles.websiteDetails}>
                <div style={styles.path}>{website.path}</div>
                <div style={styles.created}>
                  Created: {new Date(website.created_at).toLocaleString()}
                </div>
              </div>
              <div style={styles.actions}>
                <button
                  onClick={() => {
                    // Open in file explorer (path-based)
                    alert(`Website location: ${website.path}`);
                  }}
                  style={styles.viewButton}
                >
                  View Location
                </button>
                <button
                  onClick={() => handleDelete(website.site_id)}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
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
    maxHeight: '600px',
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
  refreshButton: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  list: {
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  websiteItem: {
    padding: '16px',
    border: '1px solid #eee',
    borderRadius: '4px',
    backgroundColor: '#f8f9fa',
  },
  websiteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  websiteName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  websiteId: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#666',
    backgroundColor: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  websiteDetails: {
    marginBottom: '12px',
  },
  path: {
    fontSize: '13px',
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: '4px',
  },
  created: {
    fontSize: '12px',
    color: '#999',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  viewButton: {
    padding: '6px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
  },
};

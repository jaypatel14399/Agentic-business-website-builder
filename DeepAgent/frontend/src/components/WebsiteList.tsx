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
    const interval = setInterval(loadWebsites, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (siteId: string) => {
    if (!confirm('Are you sure you want to delete this website?')) return;
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
      <div className="website-list">
        <div className="website-list__loading">Loading websites...</div>
      </div>
    );
  }

  return (
    <div className="website-list">
      <div className="website-list__header">
        <h3 className="website-list__title">Generated websites ({websites.length})</h3>
        <button type="button" onClick={loadWebsites} className="website-list__refresh">
          Refresh
        </button>
      </div>
      <div className="website-list__list">
        {websites.length === 0 ? (
          <div className="website-list__empty">No websites generated yet.</div>
        ) : (
          websites.map((website) => (
            <div key={website.site_id} className="website-list__item">
              <div className="website-list__item-header">
                <h4 className="website-list__name">{website.business_name}</h4>
                <span className="website-list__id">{website.site_id}</span>
              </div>
              <div className="website-list__path">{website.path}</div>
              <div className="website-list__created">
                Created: {new Date(website.created_at).toLocaleString()}
              </div>
              <div className="website-list__actions">
                <button
                  type="button"
                  className="website-list__btn website-list__btn--view"
                  onClick={() => alert(`Website location: ${website.path}`)}
                >
                  View location
                </button>
                <button
                  type="button"
                  className="website-list__btn website-list__btn--delete"
                  onClick={() => handleDelete(website.site_id)}
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

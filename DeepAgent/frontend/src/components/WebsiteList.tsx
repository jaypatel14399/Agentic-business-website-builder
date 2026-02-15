import { useEffect, useState } from 'react';
import { WebsiteInfo } from '../types';
import { websitesApi } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';

export const WebsiteList = () => {
  const { theme } = useTheme();
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

  const cardBg = theme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-gray-200';
  const borderColor = theme === 'dark' ? 'border-[#1F2937]' : 'border-gray-200';
  const titleColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const textColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-500' : 'text-gray-500';
  const itemBg = theme === 'dark' ? 'bg-[#0B1220]' : 'bg-gray-50';
  const itemBorder = theme === 'dark' ? 'border-[#1F2937]' : 'border-gray-200';
  const itemIdBg = theme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-gray-100 border-gray-200';

  if (loading) {
    return (
      <div className={`${cardBg} border rounded-xl p-6 transition-colors duration-200`}>
        <div className={`text-center text-sm ${textColor} py-10`}>Loading websites...</div>
      </div>
    );
  }

  return (
    <div className={`${cardBg} border rounded-xl flex flex-col max-h-[600px] transition-colors duration-200`}>
      <div className={`p-4 border-b ${borderColor} flex justify-between items-center`}>
        <h3 className={`text-sm font-semibold ${titleColor}`}>Generated Websites ({websites.length})</h3>
        <button
          type="button"
          onClick={loadWebsites}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg px-3 py-1.5 text-xs transition-all duration-200"
        >
          Refresh
        </button>
      </div>
      <div className="overflow-y-auto p-4 space-y-3">
        {websites.length === 0 ? (
          <div className={`text-center text-sm ${textColor} py-10`}>No websites generated yet.</div>
        ) : (
          websites.map((website) => (
            <div
              key={website.site_id}
              className={`p-4 border ${itemBorder} rounded-lg ${itemBg} transition-colors duration-200`}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className={`text-sm font-semibold ${textPrimary}`}>{website.business_name}</h4>
                <span className={`font-mono text-xs ${textSecondary} ${itemIdBg} px-2 py-1 rounded border`}>
                  {website.site_id}
                </span>
              </div>
              <div className={`font-mono text-xs ${textSecondary} mb-2 break-all`}>{website.path}</div>
              <div className={`text-xs ${textSecondary} mb-3`}>
                Created: {new Date(website.created_at).toLocaleString()}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-medium transition-all duration-200"
                  onClick={() => alert(`Website location: ${website.path}`)}
                >
                  View location
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-all duration-200"
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

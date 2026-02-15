import { useEffect, useState } from 'react';
import { WebsiteInfo } from '../types';
import { websitesApi } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';
import { ConfirmDialog } from './ConfirmDialog';
import { stripAnsi } from '../utils/stripAnsi';

export const WebsiteList = () => {
  const { theme } = useTheme();
  const [websites, setWebsites] = useState<WebsiteInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<WebsiteInfo | null>(null);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [buildOpenSiteId, setBuildOpenSiteId] = useState<string | null>(null);

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

  const handleDeleteClick = (website: WebsiteInfo) => {
    setDeleteTarget(website);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await websitesApi.deleteWebsite(deleteTarget.site_id);
      setDeleteTarget(null);
      loadWebsites();
    } catch (error) {
      console.error('Error deleting website:', error);
      alert('Failed to delete website');
    } finally {
      setDeleteTarget(null);
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
    <div className="relative">
      {buildOpenSiteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] rounded-xl shadow-xl p-6 max-w-sm mx-4 flex flex-col items-center gap-4">
            <span className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-900 dark:text-gray-100 font-medium text-center">
              Installing dependencies and starting dev server…
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              The site will open in a new tab when ready.
            </p>
          </div>
        </div>
      )}
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
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-xs font-medium transition-all duration-200"
                  onClick={() => {
                    navigator.clipboard.writeText(website.path);
                    alert('Path copied to clipboard');
                  }}
                >
                  Copy path
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  disabled={buildOpenSiteId !== null}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setBuildOpenSiteId(website.site_id);
                    try {
                      const { url } = await websitesApi.buildAndOpen(website.site_id);
                      window.open(url, '_blank', 'noopener');
                    } catch (err: any) {
                      const msg = err?.response?.data?.detail || err?.message || 'Failed to start dev server';
                      setBuildError(stripAnsi(typeof msg === 'string' ? msg : JSON.stringify(msg)));
                    } finally {
                      setBuildOpenSiteId(null);
                    }
                  }}
                >
                  {buildOpenSiteId === website.site_id ? (
                    <>
                      <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Starting…
                    </>
                  ) : (
                    'Build & Open'
                  )}
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-all duration-200"
                  onClick={() => handleDeleteClick(website)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete website"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.business_name}"? This will remove the folder from disk.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={buildError !== null}
        title="Build & Open Error"
        message={buildError || ''}
        confirmLabel="OK"
        cancelLabel=""
        onConfirm={() => setBuildError(null)}
        onCancel={() => setBuildError(null)}
      />
    </div>
  );
};

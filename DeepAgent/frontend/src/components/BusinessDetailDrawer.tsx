import { DiscoveredBusiness } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface BusinessDetailDrawerProps {
  business: DiscoveredBusiness | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerateWebsite: (business: DiscoveredBusiness) => void;
  onAddToBatch: (business: DiscoveredBusiness) => void;
}

export const BusinessDetailDrawer = ({
  business,
  isOpen,
  onClose,
  onGenerateWebsite,
  onAddToBatch,
}: BusinessDetailDrawerProps) => {
  const { theme } = useTheme();
  const cardBg = theme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-gray-200';
  const borderColor = theme === 'dark' ? 'border-[#1F2937]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  if (!isOpen || !business) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-[420px] ${cardBg} border-l ${borderColor} shadow-lg z-50 transition-transform duration-300 overflow-y-auto`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2 className={`text-xl font-semibold ${textPrimary}`}>{business.name}</h2>
            <button
              onClick={onClose}
              className={`${textSecondary} hover:${textPrimary} transition-colors`}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div>
              <div className={`text-xs font-medium ${textSecondary} uppercase tracking-wide mb-1`}>
                Address
              </div>
              <div className={textPrimary}>{business.address}</div>
            </div>

            {business.rating && (
              <div>
                <div className={`text-xs font-medium ${textSecondary} uppercase tracking-wide mb-1`}>
                  Rating
                </div>
                <div className={textPrimary}>
                  ⭐ {business.rating} {business.reviews ? `(${business.reviews} reviews)` : ''}
                </div>
              </div>
            )}

            {business.phone && (
              <div>
                <div className={`text-xs font-medium ${textSecondary} uppercase tracking-wide mb-1`}>
                  Phone
                </div>
                <div className={textPrimary}>{business.phone}</div>
              </div>
            )}

            {business.website && (
              <div>
                <div className={`text-xs font-medium ${textSecondary} uppercase tracking-wide mb-1`}>
                  Website
                </div>
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 hover:text-indigo-400"
                >
                  {business.website}
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  onGenerateWebsite(business);
                  onClose();
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg px-4 py-2 text-sm transition-all duration-200"
              >
                Generate Website
              </button>
              <button
                type="button"
                onClick={() => {
                  onAddToBatch(business);
                }}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg px-4 py-2 text-sm transition-all duration-200"
              >
                Add to Batch
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

import { DiscoveredBusiness } from '../types';
import { BusinessListItem } from './BusinessListItem';
import { ModeToggle } from './ModeToggle';
import { useTheme } from '../contexts/ThemeContext';

type Mode = 'auto' | 'manual';

interface BusinessListPanelProps {
  businesses: DiscoveredBusiness[];
  selectedBusinesses: string[];
  mode: Mode;
  hoveredBusinessId: string | null;
  onModeChange: (mode: Mode) => void;
  onBusinessClick: (business: DiscoveredBusiness) => void;
  onBusinessToggle?: (business: DiscoveredBusiness) => void;
  onBusinessHover: (businessId: string) => void;
  onBusinessLeave: () => void;
  onGenerateSelected: () => void;
}

export const BusinessListPanel = ({
  businesses,
  selectedBusinesses,
  mode,
  hoveredBusinessId,
  onModeChange,
  onBusinessClick,
  onBusinessToggle,
  onBusinessHover,
  onBusinessLeave,
  onGenerateSelected,
}: BusinessListPanelProps) => {
  const { theme } = useTheme();
  const cardBg = theme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-gray-200';
  const borderColor = theme === 'dark' ? 'border-[#1F2937]' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  const handleItemClick = (business: DiscoveredBusiness) => {
    if (mode === 'manual' && onBusinessToggle) {
      onBusinessToggle(business);
    } else {
      onBusinessClick(business);
    }
  };

  return (
    <div className={`w-[380px] ${cardBg} border rounded-xl h-[600px] flex flex-col transition-colors duration-200`}>
      <div className={`p-4 border-b ${borderColor}`}>
        <ModeToggle mode={mode} onModeChange={onModeChange} />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {businesses.length === 0 ? (
          <div className={`text-center ${textColor} py-10 text-sm`}>
            No businesses found
          </div>
        ) : (
          businesses.map((business) => (
            <BusinessListItem
              key={business.id}
              business={business}
              isSelected={selectedBusinesses.includes(business.id)}
              isHovered={hoveredBusinessId === business.id}
              onClick={() => handleItemClick(business)}
              onHover={() => onBusinessHover(business.id)}
              onLeave={onBusinessLeave}
            />
          ))
        )}
      </div>
      {selectedBusinesses.length > 0 && (
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-[#1F2937]' : 'border-gray-200'}`}>
          <button
            type="button"
            onClick={onGenerateSelected}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg px-4 py-2 text-sm transition-all duration-200"
          >
            Generate for {selectedBusinesses.length} Selected Business{selectedBusinesses.length !== 1 ? 'es' : ''}
          </button>
        </div>
      )}
    </div>
  );
};

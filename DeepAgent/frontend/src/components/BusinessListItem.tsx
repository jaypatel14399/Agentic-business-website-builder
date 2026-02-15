import { DiscoveredBusiness } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface BusinessListItemProps {
  business: DiscoveredBusiness;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}

export const BusinessListItem = ({
  business,
  isSelected,
  isHovered,
  onClick,
  onHover,
  onLeave,
}: BusinessListItemProps) => {
  const { theme } = useTheme();
  const itemBg = theme === 'dark' 
    ? (isHovered ? 'bg-[#1F2937]' : 'bg-[#111827]')
    : (isHovered ? 'bg-gray-100' : 'bg-white');
  const borderColor = isSelected 
    ? 'border-indigo-500' 
    : (theme === 'dark' ? 'border-[#1F2937]' : 'border-gray-200');
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`p-3 mb-2 rounded-lg border cursor-pointer transition-all duration-200 ${itemBg} ${borderColor} ${
        isSelected ? 'ring-2 ring-indigo-500/50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className={`text-sm font-semibold ${textPrimary} flex-1`}>{business.name}</h4>
        {isSelected && (
          <span className="ml-2 text-indigo-500">✓</span>
        )}
      </div>
      {business.rating && (
        <div className={`text-xs ${textSecondary} mb-1`}>
          ⭐ {business.rating} {business.reviews ? `(${business.reviews} reviews)` : ''}
        </div>
      )}
      <div className={`text-xs ${textSecondary} mb-2`}>{business.address}</div>
      <button
        type="button"
        className="text-xs text-indigo-500 hover:text-indigo-400 font-medium"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        View Details
      </button>
    </div>
  );
};

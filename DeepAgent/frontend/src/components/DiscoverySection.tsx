import { useState, useEffect } from 'react';
import { DiscoveredBusiness, DiscoveryRequest } from '../types';
import { MapContainer } from './MapContainer';
import { BusinessListPanel } from './BusinessListPanel';
import { BusinessDetailDrawer } from './BusinessDetailDrawer';
import { discoveryApi } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';

type Mode = 'auto' | 'manual';

interface DiscoverySectionProps {
  discoveryRequest: DiscoveryRequest;
  onGenerateForBusinesses: (businesses: DiscoveredBusiness[]) => void;
  onClose: () => void;
}

export const DiscoverySection = ({
  discoveryRequest,
  onGenerateForBusinesses,
  onClose,
}: DiscoverySectionProps) => {
  const { theme } = useTheme();
  const [businesses, setBusinesses] = useState<DiscoveredBusiness[]>([]);
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<DiscoveredBusiness | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('manual');
  const [hoveredBusinessId, setHoveredBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load businesses on mount
  useEffect(() => {
    const loadBusinesses = async () => {
      setLoading(true);
      try {
        const data = await discoveryApi.discoverBusinesses(discoveryRequest);
        setBusinesses(data);
        
        // Auto-select first N businesses WITHOUT websites if in auto mode
        if (mode === 'auto' && data.length > 0) {
          // Filter businesses that don't have websites
          const businessesWithoutWebsites = data.filter(b => !b.hasWebsite);
          
          if (businessesWithoutWebsites.length > 0) {
            const limit = discoveryRequest.limit || 5;
            const autoSelected = businessesWithoutWebsites.slice(0, limit);
            setSelectedBusinesses(autoSelected.map(b => b.id));
            
            // Show confirmation modal
            const confirmed = window.confirm(
              `Generate websites for ${autoSelected.length} businesses without websites?`
            );
            if (confirmed) {
              onGenerateForBusinesses(autoSelected);
            }
          } else {
            // No businesses without websites found
            window.alert('No businesses without websites found. All discovered businesses already have websites.');
          }
        }
      } catch (error) {
        console.error('Error discovering businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, [discoveryRequest]);

  // Handle mode change - auto-select when switching to auto mode
  useEffect(() => {
    if (mode === 'auto' && businesses.length > 0 && selectedBusinesses.length === 0) {
      // Filter businesses that don't have websites
      const businessesWithoutWebsites = businesses.filter(b => !b.hasWebsite);
      
      if (businessesWithoutWebsites.length > 0) {
        const limit = discoveryRequest.limit || 5;
        const autoSelected = businessesWithoutWebsites.slice(0, limit);
        setSelectedBusinesses(autoSelected.map(b => b.id));
        
        const confirmed = window.confirm(
          `Generate websites for ${autoSelected.length} businesses without websites?`
        );
        if (confirmed) {
          onGenerateForBusinesses(autoSelected);
        }
      } else {
        // No businesses without websites found
        window.alert('No businesses without websites found. All discovered businesses already have websites.');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleBusinessClick = (business: DiscoveredBusiness) => {
    if (mode === 'manual') {
      // In manual mode, clicking toggles selection
      handleBusinessToggle(business);
    } else {
      // In auto mode, clicking opens drawer
      setActiveBusiness(business);
      setIsDrawerOpen(true);
    }
  };

  const handleBusinessToggle = (business: DiscoveredBusiness) => {
    setSelectedBusinesses((prev) => {
      if (prev.includes(business.id)) {
        return prev.filter(id => id !== business.id);
      } else {
        return [...prev, business.id];
      }
    });
  };

  const handleGenerateSelected = () => {
    if (selectedBusinesses.length > 0) {
      const selected = businesses.filter((b) => selectedBusinesses.includes(b.id));
      onGenerateForBusinesses(selected);
    }
  };

  const handleGenerateWebsite = async (business: DiscoveredBusiness) => {
    try {
      onGenerateForBusinesses([business]);
    } catch (error) {
      console.error('Error generating website:', error);
    }
  };

  const handleAddToBatch = (business: DiscoveredBusiness) => {
    if (!selectedBusinesses.includes(business.id)) {
      setSelectedBusinesses([...selectedBusinesses, business.id]);
    }
    setIsDrawerOpen(false);
  };

  const textColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  if (loading) {
    return (
      <div className={`${theme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-gray-200'} border rounded-xl p-8 text-center`}>
        <div className={textColor}>Discovering businesses...</div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex gap-6">
        <BusinessListPanel
          businesses={businesses}
          selectedBusinesses={selectedBusinesses}
          mode={mode}
          hoveredBusinessId={hoveredBusinessId}
          onModeChange={setMode}
          onBusinessClick={handleBusinessClick}
          onBusinessToggle={handleBusinessToggle}
          onBusinessHover={setHoveredBusinessId}
          onBusinessLeave={() => setHoveredBusinessId(null)}
          onGenerateSelected={handleGenerateSelected}
        />
        <MapContainer
          businesses={businesses}
          city={discoveryRequest.city}
          state={discoveryRequest.state}
          hoveredBusinessId={hoveredBusinessId}
          selectedBusinessId={activeBusiness?.id || null}
          onMarkerClick={handleBusinessClick}
          onMarkerHover={setHoveredBusinessId}
          onMarkerLeave={() => setHoveredBusinessId(null)}
        />
      </div>
      <BusinessDetailDrawer
        business={activeBusiness}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onGenerateWebsite={handleGenerateWebsite}
        onAddToBatch={handleAddToBatch}
      />
    </div>
  );
};

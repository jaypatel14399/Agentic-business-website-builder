import { useState } from 'react';
import { JobRequest, JobResponse } from '../types';
import { jobsApi } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';

const INDUSTRIES = [
  'Plumbing',
  'Roofing',
  'Cleaning',
  'HVAC',
  'Landscaping',
  'Electrical',
  'Painting',
  'Moving',
  'Pest Control',
  'Handyman',
  'Auto Repair',
  'Dental',
  'Legal',
  'Accounting',
  'Restaurant',
  'Salon',
  'Fitness',
  'Real Estate',
  'Insurance',
  'Photography',
  'Catering',
  'Florist',
  'Bakery',
  'Pet Grooming',
  'Locksmith',
  'Others',
];

const OTHERS_VALUE = 'Others';

interface JobFormProps {
  onJobCreated: (job: JobResponse) => void;
  onStartDiscovery?: (request: { industry: string; city: string; state: string; limit?: number }) => void;
}

export const JobForm = ({ onJobCreated, onStartDiscovery }: JobFormProps) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<JobRequest>({
    industry: '',
    city: '',
    state: '',
    limit: undefined,
  });
  const [selectedIndustryOption, setSelectedIndustryOption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const industryToSend = selectedIndustryOption === OTHERS_VALUE ? formData.industry : selectedIndustryOption;
    if (!industryToSend.trim()) {
      setError('Please select an industry or enter one under Others.');
      return;
    }
    setIsSubmitting(true);

    try {
      // Trigger discovery mode instead of directly creating job
      if (onStartDiscovery) {
        onStartDiscovery({
          industry: industryToSend.trim(),
          city: formData.city,
          state: formData.state,
          limit: formData.limit,
        });
        setIsSubmitting(false);
        return;
      }

      // Fallback to direct job creation if discovery not enabled
      const job = await jobsApi.createJob({ ...formData, industry: industryToSend.trim() });
      onJobCreated(job);
      setFormData({
        industry: '',
        city: '',
        state: '',
        limit: undefined,
      });
      setSelectedIndustryOption('');
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : null;
      setError(typeof message === 'string' ? message : err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardBg = theme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-[#0B1220] border-[#1F2937] text-gray-100' : 'bg-white border-gray-300 text-gray-900';
  const labelColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const placeholderColor = theme === 'dark' ? 'placeholder-gray-500' : 'placeholder-gray-400';

  return (
    <div className={`${cardBg} border rounded-xl p-6 transition-colors duration-200`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={`text-xs font-medium ${labelColor} uppercase tracking-wide block`}>
              Industry *
            </label>
            <select
              className={`w-full ${inputBg} ${placeholderColor} rounded-lg h-11 px-3 text-sm focus:border-indigo-500 focus:outline-none transition-all duration-200 appearance-none cursor-pointer bg-no-repeat bg-right pr-9`}
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
              value={selectedIndustryOption}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedIndustryOption(v);
                setFormData({ ...formData, industry: v === OTHERS_VALUE ? '' : v });
              }}
              required
            >
              <option value="" disabled>Select industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            {selectedIndustryOption === OTHERS_VALUE && (
              <input
                type="text"
                className={`w-full ${inputBg} ${placeholderColor} rounded-lg h-11 px-3 text-sm focus:border-indigo-500 focus:outline-none transition-all duration-200 mt-2`}
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="Enter industry not in the list"
                required
              />
            )}
          </div>
          <div className="space-y-2">
            <label className={`text-xs font-medium ${labelColor} uppercase tracking-wide block`}>
              City *
            </label>
            <input
              type="text"
              className={`w-full ${inputBg} ${placeholderColor} rounded-lg h-11 px-3 text-sm focus:border-indigo-500 focus:outline-none transition-all duration-200`}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g., Austin"
              required
            />
          </div>
          <div className="space-y-2">
            <label className={`text-xs font-medium ${labelColor} uppercase tracking-wide block`}>
              State *
            </label>
            <input
              type="text"
              className={`w-full ${inputBg} ${placeholderColor} rounded-lg h-11 px-3 text-sm focus:border-indigo-500 focus:outline-none transition-all duration-200`}
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
              placeholder="e.g., TX"
              required
              maxLength={2}
            />
          </div>
          <div className="space-y-2">
            <label className={`text-xs font-medium ${labelColor} uppercase tracking-wide block`}>
              Limit (optional)
            </label>
            <input
              type="number"
              className={`w-full ${inputBg} ${placeholderColor} rounded-lg h-11 px-3 text-sm focus:border-indigo-500 focus:outline-none transition-all duration-200`}
              value={formData.limit ?? ''}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value ? parseInt(e.target.value, 10) : undefined })}
              placeholder="Number of businesses"
              min={1}
            />
          </div>
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg px-6 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Discovering…' : 'Discover Businesses'}
        </button>
      </form>
    </div>
  );
};

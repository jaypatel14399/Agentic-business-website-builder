import { useState } from 'react';
import { JobRequest, JobResponse } from '../types';
import { jobsApi } from '../api/client';

interface JobFormProps {
  onJobCreated: (job: JobResponse) => void;
}

export const JobForm = ({ onJobCreated }: JobFormProps) => {
  const [formData, setFormData] = useState<JobRequest>({
    industry: '',
    city: '',
    state: '',
    limit: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const job = await jobsApi.createJob(formData);
      onJobCreated(job);
      setFormData({
        industry: '',
        city: '',
        state: '',
        limit: undefined,
      });
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : null;
      setError(typeof message === 'string' ? message : err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="job-form">
      <h2 className="job-form__title">Start website generation</h2>
      <form onSubmit={handleSubmit} className="job-form__form">
        <div className="job-form__group">
          <label className="job-form__label">
            Industry *
            <input
              type="text"
              className="job-form__input"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="e.g., roofing, plumbing"
              required
            />
          </label>
        </div>
        <div className="job-form__group">
          <label className="job-form__label">
            City *
            <input
              type="text"
              className="job-form__input"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g., Austin"
              required
            />
          </label>
        </div>
        <div className="job-form__group">
          <label className="job-form__label">
            State *
            <input
              type="text"
              className="job-form__input"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
              placeholder="e.g., TX"
              required
              maxLength={2}
            />
          </label>
        </div>
        <div className="job-form__group">
          <label className="job-form__label">
            Limit (optional)
            <input
              type="number"
              className="job-form__input"
              value={formData.limit ?? ''}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value ? parseInt(e.target.value, 10) : undefined })}
              placeholder="Number of businesses to process"
              min={1}
            />
          </label>
        </div>
        {error && <div className="job-form__error">{error}</div>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="job-form__button"
        >
          {isSubmitting ? 'Starting…' : 'Start generation'}
        </button>
      </form>
    </div>
  );
};

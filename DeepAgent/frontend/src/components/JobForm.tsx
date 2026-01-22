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
      // Reset form
      setFormData({
        industry: '',
        city: '',
        state: '',
        limit: undefined,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Start Website Generation</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Industry *
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="e.g., roofing, plumbing"
              required
              style={styles.input}
            />
          </label>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            City *
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g., Austin"
              required
              style={styles.input}
            />
          </label>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            State *
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
              placeholder="e.g., TX"
              required
              maxLength={2}
              style={styles.input}
            />
          </label>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Limit (optional)
            <input
              type="number"
              value={formData.limit || ''}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="Number of businesses to process"
              min="1"
              style={styles.input}
            />
          </label>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={isSubmitting ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
        >
          {isSubmitting ? 'Starting...' : 'Start Generation'}
        </button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '8px',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  error: {
    padding: '12px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
    fontSize: '14px',
  },
};

import { useEffect, useState } from 'react';
import { TimelineStepper } from './TimelineStepper';
import { JobResponse } from '../types';
import { jobsApi } from '../api/client';

interface AgentPipelineViewProps {
  jobId: string;
  initialJob?: JobResponse;
}

export interface PipelineStage {
  id: string;
  label: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  order: number;
}

// Helper function to derive stages (defined outside component to avoid dependency issues)
const deriveStages = (jobData: JobResponse | null): { stages: PipelineStage[]; currentStage: string } => {
    if (!jobData) {
      return { stages: [], currentStage: '' };
    }

    const allStages: PipelineStage[] = [
      { id: 'discovering_businesses', label: 'Discover businesses', order: 1, status: 'pending' },
      { id: 'detecting_websites', label: 'Detect websites', order: 2, status: 'pending' },
      { id: 'filtering_businesses', label: 'Filter (no website)', order: 3, status: 'pending' },
      { id: 'processing_business', label: 'Process business', order: 4, status: 'pending' },
      { id: 'finding_competitors', label: 'Find competitors', order: 5, status: 'pending' },
      { id: 'analyzing_competitors', label: 'Analyze competitors', order: 6, status: 'pending' },
      { id: 'generating_content', label: 'Generate content', order: 7, status: 'pending' },
      { id: 'generating_site', label: 'Generate Next.js site', order: 8, status: 'pending' },
      { id: 'completed', label: 'Completed', order: 9, status: 'pending' },
    ];

    const currentStepId = jobData.progress?.step || '';
    const jobStatus = jobData.status;
    let currentStageId = currentStepId || '';

    // Determine current stage based on job status
    if (jobStatus === 'completed') {
      currentStageId = 'completed';
    } else if (jobStatus === 'failed') {
      currentStageId = 'failed';
    } else if (jobStatus === 'running' && currentStepId) {
      currentStageId = currentStepId;
    } else if (jobStatus === 'pending') {
      currentStageId = 'discovering_businesses'; // First stage
    }

    // Find current stage order
    const currentStageObj = allStages.find(s => s.id === currentStageId);
    const currentOrder = currentStageObj?.order || 0;

    // Map stages based on current step and job status
    const updatedStages = allStages.map((stage) => {
      const stageOrder = stage.order;

      // Job failed
      if (jobStatus === 'failed') {
        // Mark current stage (where failure occurred) as failed if it's not completed stage
        if (stage.id === currentStageId && currentStageId !== 'completed') {
          return { ...stage, status: 'failed' as const };
        }
        // Mark stages before failure as completed
        if (stageOrder < currentOrder) {
          return { ...stage, status: 'completed' as const };
        }
        // Mark stages after failure as pending
        return { ...stage, status: 'pending' as const };
      }

      // Job completed
      if (jobStatus === 'completed') {
        if (stage.id === 'completed') {
          return { ...stage, status: 'completed' as const };
        }
        // All stages before completed are completed
        if (stageOrder < currentOrder) {
          return { ...stage, status: 'completed' as const };
        }
        return { ...stage, status: 'pending' as const };
      }

      // Job running
      if (stage.id === currentStageId) {
        return { ...stage, status: 'running' as const };
      }
      // Stages before current are completed
      if (stageOrder < currentOrder) {
        return { ...stage, status: 'completed' as const };
      }
      // Stages after current are pending
      return { ...stage, status: 'pending' as const };
    });

    // Add failed stage if job failed
    if (jobStatus === 'failed') {
      updatedStages.push({
        id: 'failed',
        label: 'Failed',
        order: 10,
        status: 'failed',
      });
    }

    return { stages: updatedStages, currentStage: currentStageId };
};

export const AgentPipelineView = ({ jobId, initialJob }: AgentPipelineViewProps) => {
  const [job, setJob] = useState<JobResponse | null>(initialJob || null);
  
  // Initialize stages from initial job
  const initialStages = deriveStages(initialJob || null);
  const [stages, setStages] = useState<PipelineStage[]>(initialStages.stages);
  const [currentStage, setCurrentStage] = useState<string>(initialStages.currentStage);

  // Poll job status
  useEffect(() => {
    if (!jobId) return;

    let intervalId: NodeJS.Timeout | null = null;
    let isPolling = true;

    const pollJob = async () => {
      if (!isPolling) return;

      try {
        const jobData = await jobsApi.getJob(jobId);
        setJob(jobData);

        const { stages: derivedStages, currentStage: derivedCurrentStage } = deriveStages(jobData);
        setStages(derivedStages);
        setCurrentStage(derivedCurrentStage);

        // Stop polling if job is completed or failed
        if (jobData.status === 'completed' || jobData.status === 'failed' || jobData.status === 'cancelled') {
          isPolling = false;
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    };

    // Initial poll
    pollJob();

    // Set up polling interval (every 2 seconds)
    intervalId = setInterval(pollJob, 2000);

    // Cleanup on unmount
    return () => {
      isPolling = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [jobId]);

  // Update stages when job changes
  useEffect(() => {
    const { stages: derivedStages, currentStage: derivedCurrentStage } = deriveStages(job);
    setStages(derivedStages);
    setCurrentStage(derivedCurrentStage);
  }, [job]);

  return <TimelineStepper stages={stages} currentStage={currentStage} jobStatus={job?.status || 'pending'} />;
};

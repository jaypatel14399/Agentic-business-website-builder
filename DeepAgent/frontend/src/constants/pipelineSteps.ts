/**
 * Maps backend progress step IDs (from orchestrator progress_callback) to
 * display labels and ordering for the Agent Pipeline and ProgressTracker.
 */
export interface PipelineStepDef {
  id: string;
  label: string;
  order: number;
  /** True for per-business sub-steps (repeat for each business) */
  isPerBusiness?: boolean;
}

export const PIPELINE_STEPS: PipelineStepDef[] = [
  { id: 'initializing', label: 'Initializing', order: 0 },
  { id: 'discovering_businesses', label: 'Discover businesses', order: 1 },
  { id: 'detecting_websites', label: 'Detect websites', order: 2 },
  { id: 'filtering_businesses', label: 'Filter (no website)', order: 3 },
  { id: 'processing_business', label: 'Process business', order: 4 },
  { id: 'finding_competitors', label: 'Find competitors', order: 5, isPerBusiness: true },
  { id: 'analyzing_competitors', label: 'Analyze competitors', order: 6, isPerBusiness: true },
  { id: 'generating_content', label: 'Generate content', order: 7, isPerBusiness: true },
  { id: 'generating_site', label: 'Generate Next.js site', order: 8, isPerBusiness: true },
  { id: 'business_completed', label: 'Business done', order: 9, isPerBusiness: true },
  { id: 'completed', label: 'Completed', order: 10 },
  { id: 'failed', label: 'Failed', order: 11 },
];

const stepById = new Map(PIPELINE_STEPS.map((s) => [s.id, s]));

export function getStepLabel(stepId: string): string {
  return stepById.get(stepId)?.label ?? stepId.replace(/_/g, ' ');
}

export function getStepOrder(stepId: string): number {
  return stepById.get(stepId)?.order ?? 999;
}

export function isStepCompleted(currentStepId: string, stepId: string): boolean {
  const currentOrder = getStepOrder(currentStepId);
  const stepOrder = getStepOrder(stepId);
  if (currentStepId === 'completed' && stepId !== 'failed') return true;
  if (currentStepId === 'failed') return stepId === 'failed' ? true : getStepOrder(stepId) < getStepOrder('failed');
  return stepOrder < currentOrder;
}

export function isStepActive(currentStepId: string, stepId: string): boolean {
  return currentStepId === stepId;
}

/** Steps to show in the main pipeline strip (high-level + one "per-business" block) */
export const PIPELINE_STRIP_IDS = [
  'discovering_businesses',
  'detecting_websites',
  'filtering_businesses',
  'processing_business',
  'finding_competitors',
  'analyzing_competitors',
  'generating_content',
  'generating_site',
  'completed',
  'failed',
] as const;

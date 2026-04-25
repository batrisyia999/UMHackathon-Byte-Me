// ─── User / Profile ───────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  avatar: string;
  course: string;
  faculty: string;
  year: number;
  studyLevel: 'Undergraduate' | 'Postgraduate';
  cgpaMin: number;
  cgpaMax: number;
  cgpaLabel: string;
  goal: string;
  timeAvailability: string;
  readinessLevel: 'Just Exploring' | 'Actively Preparing' | 'Ready to Apply';
  skills: string[];
  interests: string[];
}

// ─── Opportunities ────────────────────────────────────────────────────────────

export type OpportunityCategory =
  | 'Internship'
  | 'Scholarship'
  | 'Competition'
  | 'Grant'
  | 'Certification'
  | 'Programme';

export type EffortLevel = 'Low' | 'Medium' | 'High';
export type EligibilityLevel = 'Low' | 'Medium' | 'High';
export type PipelineStage = 'apply-now' | 'prepare-soon' | 'track-later' | 'skip';

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  logo?: string;
  category: OpportunityCategory;
  deadline: string;
  estimatedValue: string;
  estimatedValueRaw?: number; // numeric for calculations
  fitScore: number;           // 0-100
  effort: EffortLevel;
  eligibility: EligibilityLevel;
  roiScore: number;           // 0-100
  recommendation: string;
  pipelineStage: PipelineStage;
  verified: boolean;
  tag?: string;               // 'Highly Matched' | 'Newly Added' | 'Trending'
  topPick?: boolean;
  location?: string;
  type?: string;              // 'On-site' | 'Remote' | 'Hybrid'
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export interface PipelineSummary {
  totalEstimatedValue: number;
  totalOpportunities: number;
  highFitCount: number;
  applicationsCount: number;
  interviewsCount: number;
  expiringValue: number;
  stageCounts: Record<PipelineStage, number>;
}

// ─── Readiness ────────────────────────────────────────────────────────────────

export type ReadinessStatus = 'complete' | 'warning' | 'critical';

export interface ReadinessItem {
  id: string;
  label: string;
  percentage: number;
  status: ReadinessStatus;
}

// ─── Planner ──────────────────────────────────────────────────────────────────

export interface PlannerTask {
  id: string;
  title: string;
  dueLabel: string;    // 'Today' | 'Tomorrow' | '11 May' etc.
  completed: boolean;
  opportunityId?: string;
}

// ─── Insights / Weekly Stats ──────────────────────────────────────────────────

export interface WeeklyInsight {
  timeSavedHours: number;
  timeSavedChange: number;    // % change vs last week
  matchesFound: number;
  matchesChange: number;
  valueUnlocked: number;
  valueUnlockedChange: number;
}

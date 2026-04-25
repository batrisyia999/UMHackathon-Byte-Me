/**
 * lib/mockData.ts
 *
 * Centralised mock data for OpportunIQ.
 * Both Developer A and Developer B import from here.
 * When the backend is ready, replace these with real API calls.
 *
 * Shape mirrors the TypeScript interfaces in types/index.ts.
 */

import type {
  UserProfile,
  Opportunity,
  PipelineSummary,
  ReadinessItem,
  PlannerTask,
  WeeklyInsight,
} from '../types';

// ─── User ─────────────────────────────────────────────────────────────────────

export const MOCK_USER: UserProfile = {
  id: 'user-001',
  name: 'Aisha Rahman',
  firstName: 'Aisha',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
  course: 'Computer Science',
  faculty: 'Faculty of Engineering',
  year: 3,
  studyLevel: 'Undergraduate',
  cgpaMin: 3.5,
  cgpaMax: 3.74,
  cgpaLabel: 'Good Standing',
  goal: 'Industry Experience',
  timeAvailability: '10 - 15 hrs/week',
  readinessLevel: 'Actively Preparing',
  skills: ['Python', 'Data Analysis', 'Problem Solving', 'Machine Learning', 'Web Development'],
  interests: ['Data Science', 'Machine Learning', 'Web Development'],
};

// ─── Opportunities ────────────────────────────────────────────────────────────

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'petronas-2025',
    title: 'PETRONAS Digital Innovation Internship 2025',
    company: 'PETRONAS',
    logo: 'https://logo.clearbit.com/petronas.com',
    category: 'Internship',
    deadline: '31 May 2025',
    estimatedValue: 'RM 7,000/month',
    estimatedValueRaw: 7000,
    fitScore: 96,
    effort: 'Medium',
    eligibility: 'High',
    roiScore: 92,
    recommendation:
      'Strong match with your skills in Python, Data Analysis and Problem Solving. Aligns with your goal of gaining industry experience.',
    pipelineStage: 'apply-now',
    verified: true,
    tag: 'Highly Matched',
    topPick: true,
    location: 'Kuala Lumpur',
    type: 'On-site',
  },
  {
    id: 'google-step-2025',
    title: 'Google STEP Internship (GAPAC) 2025',
    company: 'Google',
    logo: 'https://logo.clearbit.com/google.com',
    category: 'Internship',
    deadline: '24 May 2025',
    estimatedValue: 'RM 9,500/month',
    estimatedValueRaw: 9500,
    fitScore: 96,
    effort: 'Medium',
    eligibility: 'Medium',
    roiScore: 91,
    recommendation:
      'Great opportunity to work on real-world projects at Google. Your coding skills and problem-solving align well.',
    pipelineStage: 'apply-now',
    verified: true,
    tag: 'Newly Added',
    location: 'Singapore',
    type: 'On-site',
  },
  {
    id: 'maybank-ytp-2025',
    title: 'Maybank Young Talent Programme 2025',
    company: 'Maybank',
    logo: 'https://logo.clearbit.com/maybank.com',
    category: 'Programme',
    deadline: '28 May 2025',
    estimatedValue: 'RM 12,000/month',
    estimatedValueRaw: 12000,
    fitScore: 87,
    effort: 'Medium',
    eligibility: 'High',
    roiScore: 85,
    recommendation:
      'Strong alignment with your finance and tech interests. High employment conversion rate.',
    pipelineStage: 'apply-now',
    verified: true,
    location: 'Kuala Lumpur',
    type: 'On-site',
  },
  {
    id: 'shell-grad-2026',
    title: 'Shell Graduate Programme 2026',
    company: 'Shell',
    logo: 'https://logo.clearbit.com/shell.com',
    category: 'Programme',
    deadline: '30 Jun 2025',
    estimatedValue: 'RM 10,000/month',
    estimatedValueRaw: 10000,
    fitScore: 87,
    effort: 'High',
    eligibility: 'High',
    roiScore: 88,
    recommendation:
      'Excellent graduate scheme with global rotation. Your leadership experience is a strong asset here.',
    pipelineStage: 'prepare-soon',
    verified: true,
    location: 'Kuala Lumpur',
    type: 'On-site',
  },
  {
    id: 'microsoft-mlsa-2025',
    title: 'Microsoft Learn Student Ambassadors 2025',
    company: 'Microsoft',
    logo: 'https://logo.clearbit.com/microsoft.com',
    category: 'Programme',
    deadline: '15 Jun 2025',
    estimatedValue: 'RM 3,500/month',
    estimatedValueRaw: 3500,
    fitScore: 87,
    effort: 'Medium',
    eligibility: 'High',
    roiScore: 75,
    recommendation:
      'Great for building your cloud and developer profile. Microsoft certification included.',
    pipelineStage: 'prepare-soon',
    verified: true,
  },
  {
    id: 'khazanah-scholar-2026',
    title: 'Khazanah Global Scholarship 2026',
    company: 'Khazanah Nasional',
    logo: 'https://logo.clearbit.com/khazanah.com.my',
    category: 'Scholarship',
    deadline: '1 Sep 2026',
    estimatedValue: 'Full Scholarship',
    estimatedValueRaw: 150000,
    fitScore: 87,
    effort: 'High',
    eligibility: 'Medium',
    roiScore: 95,
    recommendation:
      'Prestigious scholarship fully funding postgraduate studies abroad. Requires strong leadership profile.',
    pipelineStage: 'track-later',
    verified: true,
    topPick: false,
  },
  {
    id: 'adb-japan-2025',
    title: 'ADB-Japan Scholarship Program 2025',
    company: 'Asian Development Bank',
    logo: 'https://logo.clearbit.com/adb.org',
    category: 'Scholarship',
    deadline: '15 May 2025',
    estimatedValue: 'Full Tuition + Living Allowance',
    estimatedValueRaw: 120000,
    fitScore: 97,
    effort: 'High',
    eligibility: 'High',
    roiScore: 90,
    recommendation:
      "Excellent fit for your academic profile and career goals. Provides full financial support for Master's studies.",
    pipelineStage: 'track-later',
    verified: true,
    topPick: true,
  },
  {
    id: 'icpc-2025',
    title: 'ICPC Asia Pacific Finals 2025',
    company: 'ICPC Foundation',
    logo: 'https://logo.clearbit.com/icpc.global',
    category: 'Competition',
    deadline: '15 Jun 2025',
    estimatedValue: 'RM 2,000',
    estimatedValueRaw: 2000,
    fitScore: 88,
    effort: 'Medium',
    eligibility: 'High',
    roiScore: 85,
    recommendation:
      'You have a strong track record in programming competitions. High visibility and networking opportunities.',
    pipelineStage: 'track-later',
    verified: true,
    tag: 'Trending',
  },
  {
    id: 'hackathon-series-2025',
    title: 'Random Hackathon Series 2025',
    company: 'Various',
    category: 'Competition',
    deadline: '31 May 2025',
    estimatedValue: 'RM 500',
    estimatedValueRaw: 500,
    fitScore: 55,
    effort: 'Low',
    eligibility: 'High',
    roiScore: 40,
    recommendation: 'Low financial value relative to effort. Consider skipping unless you need the practice.',
    pipelineStage: 'skip',
    verified: false,
  },
];

// ─── Pipeline Summary ─────────────────────────────────────────────────────────

export const MOCK_PIPELINE_SUMMARY: PipelineSummary = {
  totalEstimatedValue: 86450,
  totalOpportunities: 24,
  highFitCount: 12,
  applicationsCount: 3,
  interviewsCount: 2,
  expiringValue: 19450,
  stageCounts: {
    'apply-now': 4,
    'prepare-soon': 5,
    'track-later': 6,
    skip: 3,
  },
};

// ─── Readiness Tracker ────────────────────────────────────────────────────────

export const MOCK_READINESS_ITEMS: ReadinessItem[] = [
  { id: 'cv',         label: 'CV / Resume',  percentage: 90, status: 'complete'  },
  { id: 'transcript', label: 'Transcript',   percentage: 80, status: 'complete'  },
  { id: 'portfolio',  label: 'Portfolio',    percentage: 40, status: 'warning'   },
  { id: 'linkedin',   label: 'LinkedIn',     percentage: 70, status: 'critical'  },
  { id: 'essay',      label: 'Essay',        percentage: 40, status: 'warning'   },
  { id: 'referee',    label: 'Referee',      percentage: 50, status: 'critical'  },
];

// ─── Weekly Planner Tasks ─────────────────────────────────────────────────────

export const MOCK_PLANNER_TASKS: PlannerTask[] = [
  { id: 'task-1', title: 'Customize CV for Maybank YTP',             dueLabel: 'Today',    completed: false, opportunityId: 'maybank-ytp-2025' },
  { id: 'task-2', title: 'Start PETRONAS internship application',    dueLabel: 'Tomorrow', completed: false, opportunityId: 'petronas-2025'    },
  { id: 'task-3', title: 'Prepare for Google STEP online test',      dueLabel: '11 May',   completed: false, opportunityId: 'google-step-2025' },
  { id: 'task-4', title: 'Ask referee for recommendation letter',    dueLabel: '17 May',   completed: false                                    },
  { id: 'task-5', title: 'Practice coding challenge (Google STEP)',  dueLabel: '18 May',   completed: false, opportunityId: 'google-step-2025' },
];

// ─── Weekly Insights ──────────────────────────────────────────────────────────

export const MOCK_WEEKLY_INSIGHT: WeeklyInsight = {
  timeSavedHours: 6.8,
  timeSavedChange: 26,
  matchesFound: 18,
  matchesChange: 30,
  valueUnlocked: 23450,
  valueUnlockedChange: 18,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Filter opportunities by pipeline stage */
export function getOpportunitiesByStage(stage: Opportunity['pipelineStage']) {
  return MOCK_OPPORTUNITIES.filter((o) => o.pipelineStage === stage);
}

/** Get the featured / top pick opportunity */
export function getFeaturedOpportunity() {
  return MOCK_OPPORTUNITIES.find((o) => o.topPick && o.pipelineStage === 'apply-now')
    ?? MOCK_OPPORTUNITIES[0];
}

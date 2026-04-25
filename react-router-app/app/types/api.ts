export interface SharedAIContract {
  summary: string;
  reasoningBullets: string[];
  tradeoff: string;
  whyNotNow: string;
  nextStep: string;
  economicImpact: string;
  confidenceScore: number;
  confidenceReason: string;
  uncertainFields: string[];
  source: "glm" | "fallback";
}

export interface ApiUserProfile {
  id: string;
  name: string;
  firstName: string;
  avatar: string;
  email: string;
  phone: string;
  university: string;
  course: string;
  faculty: string;
  year: number;
  studyLevel: string;
  cgpaMin: number;
  cgpaMax: number;
  cgpaLabel: string;
  goal: string;
  timeAvailability: string;
  readinessLevel: string;
  skills: string[];
  interests: string[];
  goalsProgress: Array<{ label: string; progress: number }>;
  assets: Array<{
    id: string;
    label: string;
    completion: number;
    status: string;
    filename?: string | null;
    link?: string | null;
    category?: string | null;
  }>;
  savedOpportunityIds: string[];
}

export interface ApiOpportunity {
  id: string;
  title: string;
  company: string;
  logo?: string | null;
  category: string;
  deadline: string;
  deadlineIso?: string | null;
  daysUntilDeadline?: number | null;
  estimatedValue: string;
  estimatedValueRaw?: number | null;
  fitScore: number;
  effort: string;
  eligibility: string;
  roiScore: number;
  recommendation: string;
  pipelineStage: "apply-now" | "prepare-soon" | "track-later" | "skip";
  verified: boolean;
  tag?: string | null;
  topPick?: boolean;
  location?: string | null;
  type?: string | null;
  priorityScore?: number;
  urgencyScore?: number;
  readinessScore?: number;
  valueScore?: number;
  summary?: string;
  whyTopMatchBullets?: string[];
  topPickRationale?: string;
  explanationSource?: "glm" | "fallback";
  aiExplanation?: SharedAIContract;
}

export interface ApiPlannerTask {
  id: string;
  title: string;
  subtitle: string;
  dueLabel: string;
  dueDate?: string | null;
  time?: string | null;
  duration: string;
  durationMinutes?: number | null;
  completed: boolean;
  opportunityId?: string | null;
  type: "apply-now" | "prepare-soon" | "track-later" | "skip" | "break";
  done: boolean;
}

export interface DashboardResponse {
  user: ApiUserProfile;
  pipelineSummary: {
    totalEstimatedValue: number;
    totalOpportunities: number;
    highFitCount: number;
    applicationsCount: number;
    interviewsCount: number;
    expiringValue: number;
    stageCounts: Record<"apply-now" | "prepare-soon" | "track-later" | "skip", number>;
  };
  featuredRecommendation: ApiOpportunity | null;
  stageBuckets: Record<string, ApiOpportunity[]>;
  readinessItems: Array<{
    id: string;
    label: string;
    percentage: number;
    status: "complete" | "warning" | "critical";
  }>;
  plannerTasks: ApiPlannerTask[];
  weeklyInsight: {
    timeSavedHours: number;
    timeSavedChange: number;
    matchesFound: number;
    matchesChange: number;
    valueUnlocked: number;
    valueUnlockedChange: number;
  };
  overallReadiness: number;
  aiPromptSuggestions: string[];
  behaviorSignals: Record<string, unknown>;
}

export interface OpportunitiesResponse {
  profileContext: {
    course: string;
    year: number;
    cgpaRange: string;
    goal: string;
  };
  totalCount: number;
  items: ApiOpportunity[];
  comparison: {
    label: string;
    items: Array<{
      id: string;
      name: string;
      type: string;
      score: number;
      whyRecommended: string;
      confidenceScore: number;
    }>;
  };
  whyRecommended: string[];
  availableCategories: string[];
}

export interface OpportunityDetailResponse {
  id: string;
  requestedId: string;
  title: string;
  company: string;
  logo?: string | null;
  topPick: boolean;
  verified: boolean;
  category: string;
  deadline: string;
  estimatedValue: string;
  location?: string | null;
  type?: string | null;
  fitScore: number;
  fitLabel: string;
  urgencyScore: number;
  urgencyLabel: string;
  economicValue: number;
  effortLevel: string;
  recommendedAction: string;
  summary: string;
  reasoningBullets: string[];
  tradeoff: string;
  whyNotNow: string;
  nextStep: string;
  economicImpact: string;
  estimatedValueUnlocked: number;
  valueAtRisk: number;
  timeSavedEstimate: number;
  strategicValueNarrative: string;
  confidenceScore: number;
  confidenceReason: string;
  uncertainFields: string[];
  missingRequirements: string[];
  topPickRationale: string;
  requiredDocuments: Array<{
    name: string;
    status: string;
    action?: string | null;
    ready: boolean;
  }>;
  checklist: Array<{
    label: string;
    done: boolean;
  }>;
  competitionInfo: {
    estimatedApplicants: string;
    selectionRate: string;
    standing: string;
  };
  aiExplanation: SharedAIContract;
  quickActions: Array<{
    label: string;
    href?: string;
    saved?: boolean;
  }>;
}

export interface PipelineResponse {
  summary: DashboardResponse["pipelineSummary"];
  expiringValue: number;
  atRisk: ApiOpportunity[];
  stages: Record<"apply-now" | "prepare-soon" | "track-later" | "skip", ApiOpportunity[]>;
}

export interface PlannerResponse {
  weekLabel: string;
  tasks: ApiPlannerTask[];
  categories: Array<{
    title: string;
    count: number;
    effort: string;
    roi: string;
  }>;
  totalEstimatedTimeHours: number;
  focusScore: number;
  rationale: string[];
  optimization: {
    title: string;
    text: string;
  };
  focusTip: string;
  aiExplanation: SharedAIContract;
}

export interface ReadinessResponse {
  overallReadiness: number;
  label: string;
  modules: Array<{
    id: string;
    title: string;
    description: string;
    completion: number;
    impact: string;
    action: string;
    href: string;
    status: string;
    suggestions?: string | null;
  }>;
  blockers: Array<{
    name: string;
    impact: number;
    missingRequirements: string[];
    unlockImpact: string;
  }>;
  aiChecklist: Array<{
    label: string;
    impact: string;
    unlockImpact: string;
  }>;
  tip: string;
  blockerNarrative: string;
  aiExplanation: SharedAIContract;
  nextMilestone: {
    target: number;
    current: number;
    message: string;
  };
}

export interface ApplicationsResponse {
  stats: {
    totalApplications: number;
    inProgress: number;
    underReview: number;
    accepted: number;
  };
  items: Array<{
    id: string;
    opportunityId: string;
    title: string;
    company: string;
    status: string;
    submittedDate: string;
    deadline: string;
    stage: string;
    progress: number;
    interviewDate?: string | null;
    detailOpportunityId: string;
  }>;
}

export interface ProfileResponse {
  profile: ApiUserProfile;
  aiProfileSummary: {
    matchQuality: string;
    matchQualityScore: number;
    bestSuited: Array<{
      label: string;
      match: string;
      color: string;
    }>;
  };
  improvementTips: Array<{
    tip: string;
    sub: string;
  }>;
  profileStrength: {
    completeness: number;
    assets: number;
    relevance: number;
    engagement: number;
  };
  assets: ApiUserProfile["assets"];
  readinessModules: ReadinessResponse["modules"];
}

export interface InsightsResponse {
  metrics: Array<{
    id: string;
    title: string;
    value: string;
    change: number;
  }>;
  missedValueTracker: {
    pipelineValue: number;
    expiringSoon: number;
  };
  categoriesByValue: Array<{
    label: string;
    value: number;
    percent: number;
  }>;
  urgencyDistribution: Record<string, number>;
  readinessBottlenecks: Array<{
    title: string;
    match: number;
  }>;
  pipelineGrowth: Array<{
    month: string;
    value: number;
  }>;
  economicImpactSummary: Array<{
    label: string;
    value: string;
    sub: string;
  }>;
  aiInsights: Array<{
    label: string;
    color: string;
    text: string;
  }>;
  strategicShift: {
    currentFocus: string;
    suggestedFocus: string;
    impactText: string;
  };
  economicImpactNarrative: string;
  aiExplanation: SharedAIContract;
}

export interface AdvisorBootstrapResponse {
  quickPrompts: string[];
  goals: Array<{
    label: string;
    progress: number;
  }>;
  urgent: Array<{
    title: string;
    note: string;
  }>;
  history: Array<{
    id: string | number;
    role: "user" | "assistant";
    content: string;
    time: string;
  }>;
}

export interface AdvisorChatResponse {
  response: string;
  citedOpportunityIds: string[];
  recommendedActions: string[];
  suggestedPrompts: string[];
  source: "glm" | "fallback";
  confidenceScore: number;
  confidenceReason: string;
  uncertainFields: string[];
  aiExplanation: SharedAIContract;
}

export interface CalendarResponse {
  monthLabel: string;
  dayHeaders: string[];
  grid: Array<{
    date: number;
    iso: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: Array<{
      title: string;
      type: string;
      color: string;
    }>;
  }>;
  upcoming: Array<{
    date: string;
    title: string;
    type: string;
    color: string;
  }>;
}

export interface DocumentsResponse {
  stats: {
    totalDocuments: number;
    ready: number;
    needsUpdate: number;
    missing: number;
  };
  items: Array<{
    id: string;
    title: string;
    category: string;
    size: string;
    uploadDate: string;
    status: "ready" | "needs-update" | "missing";
    usedIn: number;
    path?: string | null;
  }>;
}

export interface NetworkResponse {
  stats: {
    totalConnections: number;
    mentors: number;
    alumni: number;
    activeChats: number;
  };
  connections: Array<{
    id: string;
    name: string;
    role: string;
    company: string;
    type: string;
    date: string;
    mutual: number;
    expertise: string[];
    messaging: boolean;
    message: string;
  }>;
  suggestedConnections: Array<{
    id: string;
    name: string;
    role: string;
    company: string;
    mutual: number;
    connected: boolean;
  }>;
}

export interface ResourcesResponse {
  resources: Array<{
    id: string;
    title: string;
    type: string;
    description: string;
    duration: string;
    rating: number;
    downloads: number;
    downloaded: boolean;
  }>;
  webinars: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    registered: boolean;
  }>;
  categories: string[];
}

export interface SettingsResponse {
  account: {
    fullName: string;
    name: string;
    firstName: string;
    email: string;
    phone: string;
    university: string;
    avatar: string;
  };
  preferences: Array<{
    title: string;
    description: string;
    enabled: boolean;
  }>;
  notifications: Array<{
    title: string;
    description: string;
    enabled: boolean;
  }>;
  aiPreferences: {
    proactiveSuggestions: boolean;
    contextAwareness: string;
    responseStyle: string;
    dataUsageForTraining: boolean;
  };
  region: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
  privacy: {
    profileVisibility: string;
    showUniversity: boolean;
    analyticsEnabled: boolean;
    thirdPartySharing: boolean;
  };
  security: {
    passwordLastChangedLabel: string;
    twoFactorEnabled: boolean;
  };
  subscription: {
    currentPlan: string;
    validUntil: string;
    priceMonthly: number;
    currency: string;
    billingLabel: string;
    benefits: string[];
    recentTransactions: Array<{
      label: string;
      date: string;
      amount: string;
    }>;
  };
  support: {
    supportEmail: string;
    helpCenterLabel: string;
    communityLabel: string;
    faq: Array<{
      question: string;
      answer: string;
    }>;
  };
  dataControls: {
    exportAvailable: boolean;
    clearHistoryAvailable: boolean;
    deactivateAvailable: boolean;
    deleteAvailable: boolean;
  };
}

export interface SearchResponse {
  query: string;
  totalCount: number;
  results: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    link: string;
    fitScore?: number;
  }>;
}

export interface ExportResponse {
  message: string;
  generatedAt: string;
  exportPath: string;
  sections: Record<string, unknown>;
}

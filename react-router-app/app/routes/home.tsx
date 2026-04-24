import { useState } from 'react';
import { Link } from 'react-router';
import {
  BookOpen,
  GraduationCap,
  Target,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Calendar,
  Sparkles,
  Edit,
  BookmarkCheck,
  Bookmark,
} from 'lucide-react';

import {
  MOCK_USER,
  MOCK_PIPELINE_SUMMARY,
  MOCK_READINESS_ITEMS,
  MOCK_PLANNER_TASKS,
  MOCK_WEEKLY_INSIGHT,
  getOpportunitiesByStage,
  getFeaturedOpportunity,
} from '../lib/mockData';
import type { Opportunity, ReadinessItem, PlannerTask } from '../types/index';

// ─── Page ─────────────────────────────────────────────────────────────────────

export function loader() {
  return {};
}

export default function Home() {
  const user = MOCK_USER;
  const pipeline = MOCK_PIPELINE_SUMMARY;
  const readiness = MOCK_READINESS_ITEMS;
  const insight = MOCK_WEEKLY_INSIGHT;
  const featured = getFeaturedOpportunity();

  const applyNow = getOpportunitiesByStage('apply-now');
  const prepareSoon = getOpportunitiesByStage('prepare-soon');
  const trackLater = getOpportunitiesByStage('track-later');
  const skip = getOpportunitiesByStage('skip');

  // Local state for planner task toggling
  const [tasks, setTasks] = useState(MOCK_PLANNER_TASKS);
  const toggleTask = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold mb-1">
          {greeting}, {user.firstName} 👋
        </h1>
        <p className="text-gray-600">
          Here's your personalized opportunity overview for today.
        </p>
      </div>

      {/* ── Profile Pills ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        <ProfilePill icon={<BookOpen className="w-4 h-4 text-indigo-600" />} primary={user.course} secondary={user.faculty} />
        <ProfilePill icon={<GraduationCap className="w-4 h-4 text-indigo-600" />} primary={`Year ${user.year}`} secondary={user.studyLevel} />
        <ProfilePill
          icon={<Target className="w-4 h-4 text-indigo-600" />}
          primary={`CGPA ${user.cgpaMin} – ${user.cgpaMax}`}
          secondary={user.cgpaLabel}
        />
        <ProfilePill icon={<Target className="w-4 h-4 text-green-600" />} primary="Goal" secondary={user.goal} />
        <ProfilePill icon={<Clock className="w-4 h-4 text-orange-600" />} primary="Time Availability" secondary={user.timeAvailability} />
        <Link
          to="/profile"
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <Edit className="w-4 h-4 text-gray-600" />
          <span className="text-sm">Edit Profile</span>
        </Link>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-3 gap-6">

        {/* ── Left: 2/3 ── */}
        <div className="col-span-2 space-y-6">

          {/* Opportunity Pipeline */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Opportunity Pipeline</h2>
              <Link to="/pipeline" className="text-sm text-indigo-600 hover:text-indigo-700">
                View Details
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <PipelineStat label="Total Estimated Value" value={`RM ${pipeline.totalEstimatedValue.toLocaleString()}`} highlight />
              <PipelineStat label="Opportunities" value={String(pipeline.totalOpportunities)} />
              <PipelineStat label="High Fit" value={String(pipeline.highFitCount)} />
              <PipelineStat label="Applications" value={String(pipeline.applicationsCount)} />
              <PipelineStat label="Interviews" value={String(pipeline.interviewsCount)} />
              <div className="col-span-3">
                <Link
                  to="/pipeline"
                  className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>RM {pipeline.expiringValue.toLocaleString()} in value is expiring within 30 days</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Link>
              </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-4 gap-4">
              <PipelineColumn
                title="Apply Now"
                count={pipeline.stageCounts['apply-now']}
                opportunities={applyNow.slice(0, 1)}
                stageSlug="apply-now"
              />
              <PipelineColumn
                title="Prepare Soon"
                titleClass="text-orange-600"
                count={pipeline.stageCounts['prepare-soon']}
                opportunities={prepareSoon.slice(0, 1)}
                stageSlug="prepare-soon"
              />
              <PipelineColumn
                title="Track Later"
                count={pipeline.stageCounts['track-later']}
                opportunities={trackLater.slice(0, 1)}
                stageSlug="track-later"
              />
              <PipelineColumn
                title="Skip for Now"
                count={pipeline.stageCounts['skip']}
                opportunities={skip.slice(0, 1)}
                stageSlug="skip"
              />
            </div>
          </section>

          {/* Readiness + Planner */}
          <div className="grid grid-cols-2 gap-6">
            <ReadinessTrackerCard items={readiness} />
            <WeeklyPlannerCard tasks={tasks} onToggle={toggleTask} />
          </div>
        </div>

        {/* ── Right: 1/3 ── */}
        <div className="space-y-6">
          <FeaturedRecommendation opportunity={featured} />
          <WeeklyInsightsCard insight={insight} />
          <AIAdvisorCard firstName={user.firstName} />
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfilePill({
  icon,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  primary: string;
  secondary: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
      {icon}
      <span className="text-sm">{primary}</span>
      <span className="text-xs text-gray-500">{secondary}</span>
    </div>
  );
}

function PipelineStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-semibold ${highlight ? 'text-indigo-600' : ''}`}>
        {value}
      </div>
    </div>
  );
}

function PipelineColumn({
  title,
  titleClass = '',
  count,
  opportunities,
  stageSlug,
}: {
  title: string;
  titleClass?: string;
  count: number;
  opportunities: Opportunity[];
  stageSlug: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-medium ${titleClass}`}>{title}</span>
        <span className="text-xs text-gray-500">{count}</span>
      </div>
      <div className="space-y-2">
        {opportunities.map((opp) => (
          <MiniOpportunityCard
            key={opp.id}
            opportunity={opp}
            highlight={stageSlug === 'prepare-soon'}
          />
        ))}
        <Link
          to="/pipeline"
          className="block text-xs text-center text-indigo-600 py-2 hover:underline"
        >
          View all ({count})
        </Link>
      </div>
    </div>
  );
}

function MiniOpportunityCard({
  opportunity: opp,
  highlight,
}: {
  opportunity: Opportunity;
  highlight?: boolean;
}) {
  return (
    <Link
      to={`/opportunities/${opp.id}`}
      className={`block border rounded-lg p-3 hover:shadow-md transition-shadow ${highlight ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'
        }`}
    >
      <div className="text-xs font-medium mb-2 line-clamp-2">{opp.title}</div>
      <div className="space-y-1">
        <MiniRow label="Deadline" value={opp.deadline} />
        <MiniRow label="Value" value={opp.estimatedValue} />
        <MiniRow label="Fit Score" value={`${opp.fitScore}%`} />
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Effort</span>
          <span
            className={`font-medium ${opp.effort === 'High'
              ? 'text-red-600'
              : opp.effort === 'Medium'
                ? 'text-orange-600'
                : 'text-green-600'
              }`}
          >
            {opp.effort}
          </span>
        </div>
      </div>
    </Link>
  );
}

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ReadinessTrackerCard({ items }: { items: ReadinessItem[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Opportunity Readiness Tracker</h3>
        <Link to="/readiness" className="text-sm text-indigo-600 hover:text-indigo-700">
          View Details
        </Link>
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const isGood = item.percentage >= 75;
          const Icon = isGood ? CheckCircle2 : AlertCircle;
          const iconColor =
            item.status === 'complete'
              ? 'text-green-500'
              : item.status === 'warning'
                ? 'text-yellow-500'
                : 'text-red-500';

          return (
            <div key={item.id} className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
              <div className="flex-1">
                <div className="text-sm">{item.label}</div>
                <div className="text-xs text-gray-500">{item.percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyPlannerCard({
  tasks,
  onToggle,
}: {
  tasks: PlannerTask[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Weekly Priority Planner</h3>
        <Link to="/planner" className="text-sm text-indigo-600 hover:text-indigo-700">
          View Calendar
        </Link>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              className="w-4 h-4 rounded border-gray-300 accent-indigo-600 cursor-pointer"
            />
            <div className="flex-1">
              <div
                className={`text-sm ${task.completed ? 'line-through text-gray-400' : ''
                  }`}
              >
                {task.title}
              </div>
              <div className="text-xs text-gray-500">{task.dueLabel}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturedRecommendation({ opportunity: opp }: { opportunity: Opportunity }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="text-xs text-indigo-600 font-medium mb-3">Top Pick for You</div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {opp.logo ? (
            <img
              src={opp.logo}
              alt={opp.company}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-white font-bold text-lg">{opp.company[0]}</span>
          )}
        </div>
        <div>
          <div className="font-semibold text-sm mb-1 line-clamp-2">{opp.title}</div>
          <div className="text-xs text-gray-600 mb-1">
            {opp.category} • {opp.type ?? 'On-site'}
          </div>
          <div className="text-xs font-medium text-gray-900">
            {opp.estimatedValue}
            {opp.location ? ` • ${opp.location}` : ''}
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-lg p-3 mb-4">
        <div className="text-xs font-medium text-gray-900 mb-2">Why this is a top match</div>
        <div className="space-y-1.5 text-xs text-gray-700">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Strong match with your skills in Python, Data Analysis, and Problem Solving.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>High application success rate for your profile (Top 18%).</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Aligns with your goal to gain industry experience.</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 bg-gray-100 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-500">Fit Score</div>
          <div className="text-lg font-semibold text-green-600">{opp.fitScore}%</div>
        </div>
        <div className="flex-1 bg-gray-100 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-500">Effort</div>
          <div className="text-lg font-semibold">{opp.effort}</div>
        </div>
        <div className="flex-1 bg-gray-100 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-500">ROI</div>
          <div className="text-lg font-semibold">{opp.roiScore}/100</div>
        </div>
      </div>

      <Link
        to={`/opportunities/${opp.id}`}
        className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
      >
        View Opportunity
      </Link>
      <button
        onClick={() => setSaved((s) => !s)}
        className={`w-full mt-2 border text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 ${saved ? 'border-indigo-300 bg-indigo-50 text-indigo-600' : 'border-gray-200 hover:bg-gray-50'}`}
      >
        {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        {saved ? 'Saved!' : 'Save for Later'}
      </button>
    </div>
  );
}

function WeeklyInsightsCard({ insight }: { insight: typeof MOCK_WEEKLY_INSIGHT }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">This Week's Insights</h3>
        <span className="text-xs text-gray-500">This Week</span>
      </div>
      <div className="space-y-4">
        <InsightRow
          icon={<Clock className="w-4 h-4 text-indigo-600" />}
          label="Time Saved"
          value={`${insight.timeSavedHours} hrs`}
          change={insight.timeSavedChange}
        />
        <InsightRow
          icon={<Target className="w-4 h-4 text-indigo-600" />}
          label="Matches Found"
          value={String(insight.matchesFound)}
          change={insight.matchesChange}
        />
        <InsightRow
          icon={<TrendingUp className="w-4 h-4 text-indigo-600" />}
          label="Value Unlocked"
          value={`RM ${insight.valueUnlocked.toLocaleString()}`}
          change={insight.valueUnlockedChange}
        />
      </div>
    </div>
  );
}

function InsightRow({
  icon,
  label,
  value,
  change,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: number;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-2xl font-semibold">{value}</div>
        <div className="flex items-center gap-1 text-xs text-green-600">
          <TrendingUp className="w-3 h-3" />
          {change}%
        </div>
      </div>
    </div>
  );
}

function AIAdvisorCard({ firstName }: { firstName: string }) {
  const prompts = [
    'What should I apply for this week?',
    'Which opportunities give me the best ROI?',
    'What am I missing based on my profile?',
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold">Hi {firstName}! I'm your AI copilot.</h3>
      </div>
      <p className="text-sm text-gray-700 mb-4">
        I can help you discover, evaluate and decide what's next.
      </p>
      <div className="text-xs text-gray-600 mb-3">Try asking me...</div>
      <div className="space-y-2">
        {prompts.map((prompt) => (
          <Link
            key={prompt}
            to={`/ai-advisor?q=${encodeURIComponent(prompt)}`}
            className="w-full text-left text-xs bg-white hover:bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 flex items-center justify-between transition-colors"
          >
            <span>{prompt}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// Re-export for convenience (allows direct named import from pages/Home)
import type { WeeklyInsight } from '../types';

import { useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import {
  BookOpen,
  GraduationCap,
  Target,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Edit,
  BookmarkCheck,
  Bookmark,
} from "lucide-react";

import { apiGet, apiPost } from "../lib/api";
import type { ApiOpportunity, ApiPlannerTask, DashboardResponse } from "../types/api";

export function meta() {
  return [
    { title: "Home | Zenith" },
    { name: "description", content: "Welcome to Zenith." },
  ];
}

export async function loader() {
  return apiGet<DashboardResponse>("/api/dashboard");
}

export default function Home() {
  const data = useLoaderData() as DashboardResponse;
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(data.plannerTasks);
  const [isSavingFeatured, setIsSavingFeatured] = useState(false);
  const [isTogglingTask, setIsTogglingTask] = useState<string | null>(null);
  const featured = data.featuredRecommendation;
  const [featuredSaved, setFeaturedSaved] = useState(
    featured ? data.user.savedOpportunityIds.includes(featured.id) : false,
  );

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("isLoggedIn")) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    setTasks(data.plannerTasks);
  }, [data.plannerTasks]);

  useEffect(() => {
    setFeaturedSaved(
      featured ? data.user.savedOpportunityIds.includes(featured.id) : false,
    );
  }, [data.user.savedOpportunityIds, featured]);

  const applyNow = data.stageBuckets["apply-now"] ?? [];
  const prepareSoon = data.stageBuckets["prepare-soon"] ?? [];
  const trackLater = data.stageBuckets["track-later"] ?? [];
  const skip = data.stageBuckets["skip"] ?? [];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  async function toggleTask(id: string) {
    const previous = tasks;

    setIsTogglingTask(id);
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              done: !task.done,
            }
          : task,
      ),
    );

    try {
      const updated = await apiPost<ApiPlannerTask>(`/api/planner/tasks/${id}/toggle`);
      setTasks((current) =>
        current.map((task) => (task.id === id ? updated : task)),
      );
    } catch {
      setTasks(previous);
    } finally {
      setIsTogglingTask(null);
    }
  }

  async function toggleFeaturedSave() {
    if (!featured || isSavingFeatured) {
      return;
    }

    const nextSaved = !featuredSaved;
    setIsSavingFeatured(true);
    setFeaturedSaved(nextSaved);

    try {
      await apiPost(`/api/opportunities/${featured.id}/save`, { saved: nextSaved });
    } catch {
      setFeaturedSaved(!nextSaved);
    } finally {
      setIsSavingFeatured(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      <div className="mb-6">
        <h1 className="mb-1 text-3xl font-semibold">
          {greeting}, {data.user.firstName}
        </h1>
        <p className="text-gray-600">
          Here&apos;s your personalized opportunity overview for today.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <ProfilePill
          icon={<BookOpen className="h-4 w-4 text-indigo-600" />}
          primary={data.user.course}
          secondary={data.user.faculty}
        />
        <ProfilePill
          icon={<GraduationCap className="h-4 w-4 text-indigo-600" />}
          primary={`Year ${data.user.year}`}
          secondary={data.user.studyLevel}
        />
        <ProfilePill
          icon={<Target className="h-4 w-4 text-indigo-600" />}
          primary={`CGPA ${data.user.cgpaMin} - ${data.user.cgpaMax}`}
          secondary={data.user.cgpaLabel}
        />
        <ProfilePill
          icon={<Target className="h-4 w-4 text-green-600" />}
          primary="Goal"
          secondary={data.user.goal}
        />
        <ProfilePill
          icon={<Clock className="h-4 w-4 text-orange-600" />}
          primary="Time Availability"
          secondary={data.user.timeAvailability}
        />
        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 transition-colors hover:bg-gray-50"
        >
          <Edit className="h-4 w-4 text-gray-600" />
          <span className="text-sm">Edit Profile</span>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Opportunity Pipeline</h2>
              <Link
                to="/pipeline"
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                View Details
              </Link>
            </div>

            <div className="mb-6 grid grid-cols-4 gap-4">
              <PipelineStat
                label="Total Estimated Value"
                value={`RM ${data.pipelineSummary.totalEstimatedValue.toLocaleString()}`}
                highlight
              />
              <PipelineStat
                label="Opportunities"
                value={String(data.pipelineSummary.totalOpportunities)}
              />
              <PipelineStat
                label="High Fit"
                value={String(data.pipelineSummary.highFitCount)}
              />
              <PipelineStat
                label="Applications"
                value={String(data.pipelineSummary.applicationsCount)}
              />
              <PipelineStat
                label="Interviews"
                value={String(data.pipelineSummary.interviewsCount)}
              />
              <div className="col-span-3">
                <Link
                  to="/pipeline"
                  className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-600 transition-colors hover:bg-orange-100"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    RM {data.pipelineSummary.expiringValue.toLocaleString()} in value
                    is expiring within 30 days
                  </span>
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <PipelineColumn
                title="Apply Now"
                count={data.pipelineSummary.stageCounts["apply-now"]}
                opportunities={applyNow.slice(0, 1)}
              />
              <PipelineColumn
                title="Prepare Soon"
                titleClass="text-orange-600"
                count={data.pipelineSummary.stageCounts["prepare-soon"]}
                opportunities={prepareSoon.slice(0, 1)}
                highlight
              />
              <PipelineColumn
                title="Track Later"
                count={data.pipelineSummary.stageCounts["track-later"]}
                opportunities={trackLater.slice(0, 1)}
              />
              <PipelineColumn
                title="Skip for Now"
                count={data.pipelineSummary.stageCounts.skip}
                opportunities={skip.slice(0, 1)}
              />
            </div>
          </section>

          <div className="grid grid-cols-2 gap-6">
            <ReadinessTrackerCard items={data.readinessItems} />
            <WeeklyPlannerCard
              tasks={tasks}
              togglingTaskId={isTogglingTask}
              onToggle={toggleTask}
            />
          </div>
        </div>

        <div className="space-y-6">
          {featured ? (
            <FeaturedRecommendation
              opportunity={featured}
              saved={featuredSaved}
              saving={isSavingFeatured}
              onSave={toggleFeaturedSave}
            />
          ) : null}
          <WeeklyInsightsCard insight={data.weeklyInsight} />
          <AIAdvisorCard
            firstName={data.user.firstName}
            prompts={data.aiPromptSuggestions}
          />
        </div>
      </div>
    </div>
  );
}

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
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5">
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
      <div className="mb-1 text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-semibold ${highlight ? "text-indigo-600" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function PipelineColumn({
  title,
  titleClass = "",
  count,
  opportunities,
  highlight,
}: {
  title: string;
  titleClass?: string;
  count: number;
  opportunities: ApiOpportunity[];
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className={`text-sm font-medium ${titleClass}`}>{title}</span>
        <span className="text-xs text-gray-500">{count}</span>
      </div>
      <div className="space-y-2">
        {opportunities.map((opportunity) => (
          <MiniOpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            highlight={highlight}
          />
        ))}
        <Link
          to="/pipeline"
          className="block py-2 text-center text-xs text-indigo-600 hover:underline"
        >
          View all ({count})
        </Link>
      </div>
    </div>
  );
}

function MiniOpportunityCard({
  opportunity,
  highlight,
}: {
  opportunity: ApiOpportunity;
  highlight?: boolean;
}) {
  return (
    <Link
      to={`/opportunities/${opportunity.id}`}
      className={`block rounded-lg border p-3 transition-shadow hover:shadow-md ${
        highlight ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-white"
      }`}
    >
      <div className="mb-2 text-xs font-medium line-clamp-2">{opportunity.title}</div>
      <div className="space-y-1">
        <MiniRow label="Deadline" value={opportunity.deadline} />
        <MiniRow label="Value" value={opportunity.estimatedValue} />
        <MiniRow label="Fit Score" value={`${opportunity.fitScore}%`} />
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Effort</span>
          <span
            className={`font-medium ${
              opportunity.effort === "High"
                ? "text-red-600"
                : opportunity.effort === "Medium"
                  ? "text-orange-600"
                  : "text-green-600"
            }`}
          >
            {opportunity.effort}
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

function ReadinessTrackerCard({
  items,
}: {
  items: DashboardResponse["readinessItems"];
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Opportunity Readiness Tracker</h3>
        <Link
          to="/readiness"
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          View Details
        </Link>
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const isGood = item.percentage >= 75;
          const Icon = isGood ? CheckCircle2 : AlertCircle;
          const iconColor =
            item.status === "complete"
              ? "text-green-500"
              : item.status === "warning"
                ? "text-yellow-500"
                : "text-red-500";

          return (
            <div key={item.id} className="flex items-center gap-3">
              <Icon className={`h-5 w-5 flex-shrink-0 ${iconColor}`} />
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
  togglingTaskId,
  onToggle,
}: {
  tasks: ApiPlannerTask[];
  togglingTaskId: string | null;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Weekly Priority Planner</h3>
        <Link
          to="/planner"
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          View Calendar
        </Link>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={task.completed}
              disabled={togglingTaskId === task.id}
              onChange={() => onToggle(task.id)}
              className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-indigo-600"
            />
            <div className="flex-1">
              <div
                className={`text-sm ${
                  task.completed ? "text-gray-400 line-through" : ""
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

function FeaturedRecommendation({
  opportunity,
  saved,
  saving,
  onSave,
}: {
  opportunity: ApiOpportunity;
  saved: boolean;
  saving: boolean;
  onSave: () => void;
}) {
  const explanationBullets =
    opportunity.whyTopMatchBullets && opportunity.whyTopMatchBullets.length > 0
      ? opportunity.whyTopMatchBullets
      : opportunity.aiExplanation?.reasoningBullets || [opportunity.recommendation];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 text-xs font-medium text-indigo-600">Top Pick for You</div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-teal-500">
          {opportunity.logo ? (
            <img
              src={opportunity.logo}
              alt={opportunity.company}
              className="h-8 w-8 object-contain"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="text-lg font-bold text-white">
              {opportunity.company[0]}
            </span>
          )}
        </div>
        <div>
          <div className="mb-1 text-sm font-semibold line-clamp-2">
            {opportunity.title}
          </div>
          <div className="mb-1 text-xs text-gray-600">
            {opportunity.category} • {opportunity.type ?? "On-site"}
          </div>
          <div className="text-xs font-medium text-gray-900">
            {opportunity.estimatedValue}
            {opportunity.location ? ` • ${opportunity.location}` : ""}
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-lg bg-indigo-50 p-3">
        <div className="mb-2 text-xs font-medium text-gray-900">
          Why this is a top match
        </div>
        <div className="space-y-1.5 text-xs text-gray-700">
          {explanationBullets.map((bullet) => (
            <div key={bullet} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-600" />
              <span>{bullet}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="flex-1 rounded-lg bg-gray-100 p-2 text-center">
          <div className="text-xs text-gray-500">Fit Score</div>
          <div className="text-lg font-semibold text-green-600">
            {opportunity.fitScore}%
          </div>
        </div>
        <div className="flex-1 rounded-lg bg-gray-100 p-2 text-center">
          <div className="text-xs text-gray-500">Effort</div>
          <div className="text-lg font-semibold">{opportunity.effort}</div>
        </div>
        <div className="flex-1 rounded-lg bg-gray-100 p-2 text-center">
          <div className="text-xs text-gray-500">ROI</div>
          <div className="text-lg font-semibold">{opportunity.roiScore}/100</div>
        </div>
      </div>

      <Link
        to={`/opportunities/${opportunity.id}`}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        View Opportunity
      </Link>
      <button
        onClick={onSave}
        disabled={saving}
        className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
          saved
            ? "border-indigo-300 bg-indigo-50 text-indigo-600"
            : "border-gray-200 hover:bg-gray-50"
        } ${saving ? "opacity-70" : ""}`}
      >
        {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        {saved ? "Saved" : "Save for Later"}
      </button>
    </div>
  );
}

function WeeklyInsightsCard({
  insight,
}: {
  insight: DashboardResponse["weeklyInsight"];
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">This Week&apos;s Insights</h3>
        <span className="text-xs text-gray-500">This Week</span>
      </div>
      <div className="space-y-4">
        <InsightRow
          icon={<Clock className="h-4 w-4 text-indigo-600" />}
          label="Time Saved"
          value={`${insight.timeSavedHours} hrs`}
          change={insight.timeSavedChange}
        />
        <InsightRow
          icon={<Target className="h-4 w-4 text-indigo-600" />}
          label="Matches Found"
          value={String(insight.matchesFound)}
          change={insight.matchesChange}
        />
        <InsightRow
          icon={<TrendingUp className="h-4 w-4 text-indigo-600" />}
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
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-2xl font-semibold">{value}</div>
        <div className="flex items-center gap-1 text-xs text-green-600">
          <TrendingUp className="h-3 w-3" />
          {change}%
        </div>
      </div>
    </div>
  );
}

function AIAdvisorCard({
  firstName,
  prompts,
}: {
  firstName: string;
  prompts: string[];
}) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold">Hi {firstName}! I&apos;m your AI copilot.</h3>
      </div>
      <p className="mb-4 text-sm text-gray-700">
        I can help you discover, evaluate and decide what&apos;s next.
      </p>
      <div className="mb-3 text-xs text-gray-600">Try asking me...</div>
      <div className="space-y-2">
        {prompts.map((prompt) => (
          <Link
            key={prompt}
            to={`/ai-advisor?q=${encodeURIComponent(prompt)}`}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-xs transition-colors hover:bg-gray-50"
          >
            <span>{prompt}</span>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}

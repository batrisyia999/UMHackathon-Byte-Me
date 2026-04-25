import { useMemo, useState } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router";
import {
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Grid3x3,
  List,
  CheckCircle2,
  Star,
  TrendingUp,
} from "lucide-react";

import { apiGet, apiPost } from "../lib/api";
import type { ApiOpportunity, OpportunitiesResponse } from "../types/api";

const SORT_OPTIONS = [
  { label: "Best Match", value: "best-match" },
  { label: "Highest ROI", value: "highest-roi" },
  { label: "Most Urgent", value: "most-urgent" },
  { label: "Low Effort", value: "low-effort" },
] as const;

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const sort = url.searchParams.get("sort") || "best-match";

  return apiGet<OpportunitiesResponse>("/api/opportunities", {
    category: category && category !== "All" ? category : undefined,
    sort,
  });
}

export default function Opportunities() {
  const data = useLoaderData() as OpportunitiesResponse;
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [savedState, setSavedState] = useState<Record<string, boolean>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const activeCategory = searchParams.get("category") || "All";
  const activeSort = searchParams.get("sort") || "best-match";

  const categories = useMemo(
    () => ["All", ...data.availableCategories.filter((category) => category !== "All")],
    [data.availableCategories],
  );

  function updateFilters(next: { category?: string; sort?: string }) {
    const params = new URLSearchParams(searchParams);

    if (next.category !== undefined) {
      if (!next.category || next.category === "All") {
        params.delete("category");
      } else {
        params.set("category", next.category);
      }
    }

    if (next.sort !== undefined) {
      if (!next.sort || next.sort === "best-match") {
        params.delete("sort");
      } else {
        params.set("sort", next.sort);
      }
    }

    setSearchParams(params);
  }

  async function toggleSave(opportunityId: string) {
    const nextSaved = !savedState[opportunityId];
    setSavingId(opportunityId);
    setSavedState((current) => ({ ...current, [opportunityId]: nextSaved }));

    try {
      await apiPost(`/api/opportunities/${opportunityId}/save`, {
        saved: nextSaved,
      });
    } catch {
      setSavedState((current) => ({ ...current, [opportunityId]: !nextSaved }));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1800px] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-semibold">Opportunities</h1>
          <p className="text-sm text-gray-600">
            Live recommendations ranked against your profile, urgency, and ROI.
          </p>
        </div>
        <Link
          to="/profile"
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Refine Preferences
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-6 border-b border-gray-200">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => updateFilters({ category })}
            className={`pb-3 text-sm ${
              activeCategory === category
                ? "border-b-2 border-indigo-600 font-medium text-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-medium">Profile Context</span>
          <span className="text-xs text-gray-500">
            These recommendations are grounded in your current profile.
          </span>
          <Link
            to="/profile"
            className="ml-auto rounded-lg bg-indigo-50 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700"
          >
            Edit Filters
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          <FilterChip label="Course" value={data.profileContext.course} />
          <FilterChip label="Year" value={`Year ${data.profileContext.year}`} />
          <FilterChip label="CGPA" value={data.profileContext.cgpaRange} />
          <FilterChip label="Goal" value={data.profileContext.goal} />
          <FilterChip
            label="Category"
            value={activeCategory === "All" ? "All opportunities" : activeCategory}
          />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {data.totalCount} opportunities found
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            {SORT_OPTIONS.map((sort) => (
              <button
                key={sort.value}
                onClick={() => updateFilters({ sort: sort.value })}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  activeSort === sort.value
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded p-1.5 ${
              viewMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded p-1.5 ${
              viewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4" : "space-y-4"}>
            {data.items.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                saved={Boolean(savedState[opportunity.id])}
                saving={savingId === opportunity.id}
                onToggleSave={() => toggleSave(opportunity.id)}
              />
            ))}
          </div>
        </div>

        <div className="w-80 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold">Why these are recommended</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              {data.whyRecommended.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold">AI Compare</h3>
              <span className="ml-auto rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-600">
                {data.comparison.label}
              </span>
            </div>
            <div className="mb-4 space-y-2">
              {data.comparison.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg bg-white p-3"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-indigo-600">
                    <span className="text-xs font-semibold text-white">
                      {item.name[0]}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium">{item.name}</div>
                    <div className="text-xs text-gray-600">{item.type}</div>
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    {item.score}%
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/ai-advisor?q=Compare+my+top+opportunities"
              className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              View full comparison
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5">
      <span className="text-xs text-gray-500">{label}:</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

function OpportunityCard({
  opportunity,
  saved,
  saving,
  onToggleSave,
}: {
  opportunity: ApiOpportunity;
  saved: boolean;
  saving: boolean;
  onToggleSave: () => void;
}) {
  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-lg">
      {opportunity.topPick ? (
        <div className="absolute -top-2 left-4 flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white">
          <Star className="h-3 w-3" /> Top Pick
        </div>
      ) : null}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex flex-1 items-start gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
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
              <span className="font-semibold">{opportunity.company[0]}</span>
            )}
          </div>
          <div className="flex-1">
            {opportunity.tag ? (
              <span
                className={`mb-1 inline-block rounded px-2 py-0.5 text-xs font-medium ${
                  opportunity.tag === "Highly Matched"
                    ? "bg-green-100 text-green-700"
                    : opportunity.tag === "Newly Added"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-orange-100 text-orange-700"
                }`}
              >
                {opportunity.tag}
              </span>
            ) : null}
            <Link
              to={`/opportunities/${opportunity.id}`}
              className="mb-1 block text-sm font-semibold line-clamp-2 hover:text-indigo-600"
              state={{ from: "opportunities" }}
            >
              {opportunity.title}
            </Link>
            <div className="text-xs text-gray-600">
              by {opportunity.company}
              {opportunity.verified ? (
                <span className="text-green-600"> • Verified</span>
              ) : null}
            </div>
            <span className="mt-1 inline-block rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
              {opportunity.category}
            </span>
          </div>
        </div>
        <button
          onClick={onToggleSave}
          disabled={saving}
          className="rounded p-1.5 hover:bg-gray-100"
          title={saved ? "Remove bookmark" : "Bookmark"}
        >
          {saved ? (
            <BookmarkCheck className="h-4 w-4 text-indigo-600" />
          ) : (
            <Bookmark className="h-4 w-4 text-gray-400" />
          )}
        </button>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1 text-xs text-gray-500">Deadline</div>
          <div className="text-sm font-medium">{opportunity.deadline}</div>
        </div>
        <div>
          <div className="mb-1 text-xs text-gray-500">Est. Value</div>
          <div className="text-sm font-medium">{opportunity.estimatedValue}</div>
        </div>
      </div>
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-green-50 p-2 text-center">
          <div className="mb-0.5 text-xs text-gray-600">Fit Score</div>
          <div className="text-lg font-semibold text-green-600">
            {opportunity.fitScore}%
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="mb-0.5 text-xs text-gray-600">Effort</div>
          <div
            className={`text-sm font-semibold ${
              opportunity.effort === "High"
                ? "text-red-600"
                : opportunity.effort === "Medium"
                  ? "text-orange-600"
                  : "text-green-600"
            }`}
          >
            {opportunity.effort}
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="mb-0.5 text-xs text-gray-600">Eligibility</div>
          <div
            className={`text-sm font-semibold ${
              opportunity.eligibility === "High"
                ? "text-green-600"
                : opportunity.eligibility === "Medium"
                  ? "text-orange-600"
                  : "text-red-600"
            }`}
          >
            {opportunity.eligibility}
          </div>
        </div>
      </div>
      <div className="mb-4 flex items-center gap-1 text-xs text-gray-600">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>ROI Score: {opportunity.roiScore}/100</span>
      </div>
      <div className="mb-4 rounded-lg bg-indigo-50 p-3">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600" />
          <div>
            <div className="mb-1 text-xs font-medium text-gray-900">
              Why recommended:
            </div>
            <div className="text-xs text-gray-700">{opportunity.recommendation}</div>
          </div>
        </div>
      </div>
      <Link
        to={`/opportunities/${opportunity.id}`}
        state={{ from: "opportunities" }}
        className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        View Opportunity
      </Link>
    </div>
  );
}

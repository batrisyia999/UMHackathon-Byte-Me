import { useMemo, useState } from "react";
import { TrendingUp, AlertCircle, ChevronRight } from "lucide-react";
import { Link, useLoaderData } from "react-router";

import { apiGet, apiPatch } from "../lib/api";
import type { ApiOpportunity, PipelineResponse } from "../types/api";

type Stage = "apply-now" | "prepare-soon" | "track-later" | "skip";

const STAGE_ORDER: Stage[] = ["apply-now", "prepare-soon", "track-later", "skip"];

export async function loader() {
  return apiGet<PipelineResponse>("/api/pipeline");
}

export default function Pipeline() {
  const data = useLoaderData() as PipelineResponse;
  const [stages, setStages] = useState(data.stages);
  const [movingId, setMovingId] = useState<string | null>(null);

  const allItems = useMemo(
    () => STAGE_ORDER.flatMap((stage) => stages[stage] ?? []),
    [stages],
  );

  const stageCounts = useMemo(
    () =>
      STAGE_ORDER.reduce(
        (result, stage) => ({
          ...result,
          [stage]: stages[stage]?.length ?? 0,
        }),
        {} as Record<Stage, number>,
      ),
    [stages],
  );

  async function moveStage(opportunityId: string, direction: "forward" | "back") {
    const currentStage = STAGE_ORDER.find((stage) =>
      (stages[stage] ?? []).some((item) => item.id === opportunityId),
    );

    if (!currentStage) {
      return;
    }

    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    const nextIndex =
      direction === "forward"
        ? Math.min(currentIndex + 1, STAGE_ORDER.length - 1)
        : Math.max(currentIndex - 1, 0);
    const nextStage = STAGE_ORDER[nextIndex];

    if (nextStage === currentStage) {
      return;
    }

    const previousStages = stages;
    const movingItem = stages[currentStage].find((item) => item.id === opportunityId);

    if (!movingItem) {
      return;
    }

    setMovingId(opportunityId);
    setStages({
      ...stages,
      [currentStage]: stages[currentStage].filter((item) => item.id !== opportunityId),
      [nextStage]: [
        { ...movingItem, pipelineStage: nextStage },
        ...(stages[nextStage] ?? []),
      ],
    });

    try {
      const updated = await apiPatch<ApiOpportunity>(`/api/pipeline/${opportunityId}`, {
        stage: nextStage,
      });

      setStages((current) => ({
        ...current,
        [currentStage]: current[currentStage].filter((item) => item.id !== opportunityId),
        [nextStage]: [
          updated,
          ...current[nextStage].filter((item) => item.id !== opportunityId),
        ],
      }));
    } catch {
      setStages(previousStages);
    } finally {
      setMovingId(null);
    }
  }

  const summary = {
    ...data.summary,
    totalOpportunities: allItems.length,
    highFitCount: allItems.filter((item) => item.fitScore >= 90).length,
    stageCounts,
  };

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-semibold">Opportunity Pipeline</h1>
        <p className="text-gray-600">
          Track and manage your opportunities through each stage.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-5 gap-4">
        {[
          {
            label: "Total Estimated Value",
            value: `RM ${summary.totalEstimatedValue.toLocaleString()}`,
          },
          { label: "Opportunities", value: String(summary.totalOpportunities) },
          { label: "High Fit", value: String(summary.highFitCount) },
          { label: "Applications", value: String(summary.applicationsCount) },
          { label: "Interviews", value: String(summary.interviewsCount) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-1 text-xs text-gray-500">{stat.label}</div>
            <div className="text-2xl font-semibold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-600" />
        <span className="flex-1 text-sm font-medium text-orange-900">
          RM {data.expiringValue.toLocaleString()} in value is expiring within 30 days
        </span>
        <Link
          to="/opportunities"
          className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
        >
          View at-risk <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { title: "Apply Now", slug: "apply-now" as Stage, color: "green" },
          { title: "Prepare Soon", slug: "prepare-soon" as Stage, color: "orange" },
          { title: "Track Later", slug: "track-later" as Stage, color: "blue" },
          { title: "Skip for Now", slug: "skip" as Stage, color: "gray" },
        ].map((stage) => {
          const stageItems = stages[stage.slug] ?? [];
          return (
            <div key={stage.title}>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">{stage.title}</span>
                <span className="text-xs text-gray-500">{stageItems.length}</span>
              </div>
              <div className="space-y-3">
                {stageItems.map((item) => (
                  <div
                    key={item.id}
                    className={`${backgroundClass(stage.color)} rounded-lg border p-4`}
                  >
                    <Link
                      to={`/opportunities/${item.id}`}
                      className="mb-2 block text-xs font-medium line-clamp-2 hover:text-indigo-700"
                    >
                      {item.title}
                    </Link>
                    <div className="space-y-1">
                      <MiniRow label="Deadline" value={item.deadline} />
                      <MiniRow label="Value" value={item.estimatedValue} />
                      <MiniRow label="Fit Score" value={`${item.fitScore}%`} />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Effort</span>
                        <span
                          className={`font-medium ${
                            item.effort === "High"
                              ? "text-red-600"
                              : item.effort === "Medium"
                                ? "text-orange-600"
                                : "text-green-600"
                          }`}
                        >
                          {item.effort}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-1">
                      {STAGE_ORDER.indexOf(stage.slug) > 0 ? (
                        <button
                          onClick={() => moveStage(item.id, "back")}
                          disabled={movingId === item.id}
                          className="flex-1 rounded border border-gray-300 py-1 text-xs hover:bg-white disabled:opacity-60"
                          title="Move back"
                        >
                          ← Back
                        </button>
                      ) : null}
                      {STAGE_ORDER.indexOf(stage.slug) < STAGE_ORDER.length - 1 ? (
                        <button
                          onClick={() => moveStage(item.id, "forward")}
                          disabled={movingId === item.id}
                          className="flex-1 rounded bg-indigo-600 py-1 text-xs text-white hover:bg-indigo-700 disabled:opacity-60"
                          title="Move forward"
                        >
                          Move →
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
                {stageItems.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
                    No items
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-600" />
          <h3 className="font-semibold">Most At-Risk Opportunities</h3>
        </div>
        <div className="space-y-3">
          {data.atRisk.map((item) => (
            <Link
              key={item.id}
              to={`/opportunities/${item.id}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 hover:border-orange-300 hover:bg-orange-50"
            >
              <div>
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-xs text-gray-600">
                  {item.deadline} • {item.estimatedValue}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-orange-600">
                  {item.urgencyScore}/100
                </div>
                <div className="text-xs text-gray-500">Urgency</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function backgroundClass(color: string): string {
  const map: Record<string, string> = {
    green: "bg-green-50 border-green-200",
    orange: "bg-orange-50 border-orange-200",
    blue: "bg-blue-50 border-blue-200",
    gray: "bg-gray-50 border-gray-200",
  };

  return map[color] || map.gray;
}

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

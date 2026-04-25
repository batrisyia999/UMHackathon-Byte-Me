import { Info, AlertCircle } from "lucide-react";
import { Link, useLoaderData } from "react-router";

import { apiGet } from "../lib/api";
import type { ReadinessResponse } from "../types/api";

export async function loader() {
  return apiGet<ReadinessResponse>("/api/readiness");
}

export default function Readiness() {
  const data = useLoaderData() as ReadinessResponse;

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Opportunity Readiness Tracker</h1>
            <Info className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-gray-600">
            Strengthen your profile and unlock more opportunities.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Overall Readiness Score</div>
            <div className="text-3xl font-semibold text-green-600">
              {data.overallReadiness}%
            </div>
            <div className="text-sm text-green-600">{data.label}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-2 text-lg font-semibold">Your Readiness Modules</h2>
            <p className="mb-6 text-sm text-gray-600">
              Complete and optimize the key assets that opportunities look for.
            </p>
            <div className="space-y-4">
              {data.modules.map((module) => {
                const isHigh = module.completion >= 70;
                const isMedium = module.completion >= 40 && module.completion < 70;
                const barColor =
                  module.completion === 100
                    ? "bg-green-500"
                    : isHigh
                      ? "bg-green-500"
                      : isMedium
                        ? "bg-orange-500"
                        : "bg-red-500";
                const valueColor =
                  module.completion === 100
                    ? "text-green-600"
                    : isHigh
                      ? "text-green-600"
                      : isMedium
                        ? "text-orange-600"
                        : "text-red-600";

                return (
                  <div key={module.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <div className="text-sm font-medium">{module.title}</div>
                          <span
                            className={`rounded px-2 py-0.5 text-xs ${
                              module.impact === "High"
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {module.impact} Impact
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">{module.description}</div>
                      </div>
                      <div className={`text-2xl font-semibold ${valueColor}`}>
                        {module.completion}%
                      </div>
                    </div>
                    <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${module.completion}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Impact on Opportunities:{" "}
                        <span
                          className={
                            module.impact === "High"
                              ? "font-medium text-green-600"
                              : "font-medium text-orange-600"
                          }
                        >
                          {module.impact}
                        </span>
                      </div>
                      <Link
                        to={module.href}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        {module.action}
                      </Link>
                    </div>
                    {module.suggestions && module.completion < 100 ? (
                      <div className="mt-3 flex items-start gap-2 border-t border-gray-100 pt-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                        <div className="text-xs text-gray-700">{module.suggestions}</div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-6">
            <div className="mb-2 text-sm font-medium text-gray-900">{data.tip}</div>
            <Link
              to="/ai-advisor?q=How+can+I+improve+my+readiness"
              className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              See How →
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-2 font-semibold">
              What is blocking your top opportunities
            </h3>
            <p className="mb-4 text-xs text-gray-600">{data.blockerNarrative}</p>
            <div className="space-y-3">
              {data.blockers.map((item) => (
                <div
                  key={item.name}
                  className={`border-l-4 pl-3 ${
                    item.impact >= 15 ? "border-red-500" : "border-orange-500"
                  }`}
                >
                  <div className="mb-1 flex items-start gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-gray-600">
                        Missing: {item.missingRequirements.join(", ")}
                      </div>
                    </div>
                    <div className="text-sm text-red-600">↓ {item.impact}%</div>
                  </div>
                  <div className="text-xs text-gray-500">{item.unlockImpact}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-2 font-semibold">AI Generated Checklist</h3>
            <p className="mb-4 text-xs text-gray-600">
              Complete these to unlock more opportunities.
            </p>
            <div className="space-y-2">
              {data.aiChecklist.map((item, index) => (
                <div key={item.label} className="flex items-start gap-2">
                  <div className="w-4 text-sm text-gray-500">{index + 1}</div>
                  <div className="flex-1">
                    <div className="text-sm">{item.label}</div>
                    <div
                      className={`text-xs ${
                        item.impact === "High Impact"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {item.impact} • {item.unlockImpact}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 font-semibold">Your next milestone</h3>
            <div className="mb-2 text-sm font-medium">{data.nextMilestone.message}</div>
            <div className="mb-1 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${data.nextMilestone.current}%` }}
              />
            </div>
            <div className="mb-4 flex justify-between text-xs text-gray-600">
              <span>{data.nextMilestone.current}%</span>
              <span>{data.nextMilestone.target}%</span>
            </div>
            <Link
              to="/planner"
              className="block w-full rounded-lg bg-indigo-600 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700"
            >
              View full plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

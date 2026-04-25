import { useState } from "react";
import { TrendingUp, Download, Sparkles } from "lucide-react";
import { Link, useLoaderData } from "react-router";

import { apiGet, apiPost } from "../lib/api";
import type { ExportResponse, InsightsResponse } from "../types/api";

export async function loader() {
  return apiGet<InsightsResponse>("/api/insights");
}

export default function Insights() {
  const data = useLoaderData() as InsightsResponse;
  const [activeTab, setActiveTab] = useState<"value" | "time" | "matches">("value");
  const [exportState, setExportState] = useState<string | null>(null);

  async function handleExport() {
    setExportState("working");

    try {
      const result = await apiPost<ExportResponse>("/api/insights/export");
      setExportState(result.message);
    } finally {
      window.setTimeout(() => setExportState(null), 3000);
    }
  }

  const maxGrowth = Math.max(...data.pipelineGrowth.map((item) => item.value), 1);

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-semibold">Insights & Economic Impact</h1>
          <p className="text-gray-600">
            Your economic empowerment story, measured, tracked, and growing.
          </p>
        </div>
        <button
          onClick={() => void handleExport()}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
            exportState
              ? "border-green-300 bg-green-50 text-green-600"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Download className="h-4 w-4" />
          {exportState === "working" ? "Exporting..." : exportState || "Export Report"}
        </button>
      </div>

      <div className="mb-6 grid grid-cols-5 gap-4">
        {data.metrics.map((metric) => (
          <div key={metric.id} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 text-xs text-gray-600">{metric.title}</div>
            <div className="mb-1 text-2xl font-semibold">{metric.value}</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              <span className="text-green-600">{metric.change}%</span>
              <span className="text-gray-500">vs last period</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-3 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-semibold">Missed Value Tracker</h3>
          <div className="mb-1 text-xs text-gray-600">Current Pipeline Value</div>
          <div className="mb-4 text-3xl font-semibold text-indigo-600">
            RM {data.missedValueTracker.pipelineValue.toLocaleString()}
          </div>
          <div className="mb-4 rounded-lg bg-orange-50 p-4">
            <div className="mb-1 text-sm text-gray-600">Expiring Within 30 Days</div>
            <div className="text-2xl font-semibold text-orange-600">
              RM {data.missedValueTracker.expiringSoon.toLocaleString()}
            </div>
          </div>
          <Link
            to="/opportunities"
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            View at-risk opportunities
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-semibold">Opportunity Categories (by Value)</h3>
          <div className="space-y-3">
            {data.categoriesByValue.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-medium">
                    RM {item.value.toLocaleString()} ({item.percent}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-indigo-600"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-semibold">Deadline Urgency</h3>
          <div className="space-y-2">
            {Object.entries(data.urgencyDistribution).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500" />
                  {label}
                </div>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-2 font-semibold">Readiness Bottlenecks</h3>
          <p className="mb-4 text-sm text-gray-600">
            Top areas impacting your ability to win opportunities.
          </p>
          <div className="space-y-3">
            {data.readinessBottlenecks.map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="mb-1 text-sm font-medium">{item.title}</div>
                  <div className="h-1.5 rounded-full bg-gray-200">
                    <div
                      className={`h-1.5 rounded-full ${
                        item.match >= 70
                          ? "bg-green-500"
                          : item.match >= 50
                            ? "bg-orange-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${item.match}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600">{item.match}%</div>
              </div>
            ))}
          </div>
          <Link to="/readiness" className="mt-4 block text-sm text-indigo-600 hover:underline">
            View full readiness tracker →
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Pipeline Growth Over Time</h3>
            <div className="flex gap-1">
              {(["value", "time", "matches"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded px-2 py-1 text-xs transition-colors ${
                    activeTab === tab
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab === "value" ? "Value" : tab === "time" ? "Time" : "Matches"}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4 flex h-48 items-end gap-2 pt-4">
            {data.pipelineGrowth.map((item) => (
              <div key={item.month} className="flex h-full flex-1 flex-col justify-end">
                <div className="flex flex-1 items-end">
                  <div
                    className="relative w-full rounded-t bg-indigo-100 transition-colors hover:bg-indigo-200"
                    style={{ height: `${(item.value / maxGrowth) * 100}%` }}
                    title={`${item.month}: ${item.value}`}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] text-gray-500">
                      {item.value}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-center text-xs text-gray-500">{item.month}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            {activeTab === "value"
              ? "Value growth shows how much opportunity value your current pipeline is carrying."
              : activeTab === "time"
                ? "Time mode highlights the effort saved by using the platform to prioritize."
                : "Matches mode reflects how your discovery quality improves over time."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-semibold">Economic Impact Summary</h3>
          <div className="space-y-4">
            {data.economicImpactSummary.map((item) => (
              <div key={item.label}>
                <div className="text-xs text-gray-500">{item.label}</div>
                <div className="text-lg font-semibold">{item.value}</div>
                <div className="text-xs text-gray-600">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold">AI Insights</h3>
          </div>
          <div className="space-y-3">
            {data.aiInsights.map((item) => (
              <div key={item.label} className="rounded-lg bg-gray-50 p-3">
                <div className={`mb-1 text-sm font-medium ${item.color}`}>{item.label}</div>
                <div className="text-sm text-gray-700">{item.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
          <h3 className="mb-3 font-semibold">Strategic Shift</h3>
          <div className="mb-2 text-sm text-gray-600">Current Focus</div>
          <div className="mb-4 text-lg font-semibold">{data.strategicShift.currentFocus}</div>
          <div className="mb-2 text-sm text-gray-600">Suggested Focus</div>
          <div className="mb-4 text-lg font-semibold text-indigo-700">
            {data.strategicShift.suggestedFocus}
          </div>
          <p className="text-sm text-gray-700">{data.strategicShift.impactText}</p>
          <div className="mt-4 rounded-lg bg-white/70 p-3 text-sm text-gray-700">
            {data.economicImpactNarrative}
          </div>
        </div>
      </div>
    </div>
  );
}

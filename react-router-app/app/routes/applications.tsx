import { useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router";

import { apiGet, apiPatch } from "../lib/api";
import type { ApplicationsResponse } from "../types/api";

export async function loader() {
  return apiGet<ApplicationsResponse>("/api/applications");
}

export default function Applications() {
  const data = useLoaderData() as ApplicationsResponse;
  const [activeFilter, setActiveFilter] = useState("All");
  const [applications, setApplications] = useState(data.items);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setApplications(data.items);
  }, [data.items]);

  const statusConfig: Record<
    string,
    { bg: string; border: string; text: string; label: string }
  > = {
    "in-progress": {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      label: "In Progress",
    },
    submitted: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      label: "Submitted",
    },
    "under-review": {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
      label: "Under Review",
    },
    accepted: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      label: "Accepted",
    },
    rejected: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      label: "Rejected",
    },
  };

  const filterMap: Record<string, string> = {
    "In Progress": "in-progress",
    Submitted: "submitted",
    "Under Review": "under-review",
    Accepted: "accepted",
    Rejected: "rejected",
  };

  const filtered =
    activeFilter === "All"
      ? applications
      : applications.filter((item) => item.status === filterMap[activeFilter]);

  async function continueApplication(applicationId: string) {
    const current = applications.find((item) => item.id === applicationId);

    if (!current) {
      return;
    }

    const nextProgress = Math.min(100, current.progress + 10);
    const nextStatus = nextProgress >= 100 ? "submitted" : current.status;
    const nextStage =
      nextProgress >= 100 ? "Application Submitted" : current.stage;
    const previous = applications;

    setUpdatingId(applicationId);
    setApplications((items) =>
      items.map((item) =>
        item.id === applicationId
          ? {
              ...item,
              progress: nextProgress,
              status: nextStatus,
              stage: nextStage,
            }
          : item,
      ),
    );

    try {
      const updated = await apiPatch<ApplicationsResponse["items"][number]>(
        `/api/applications/${applicationId}`,
        {
          progress: nextProgress,
          status: nextStatus,
          stage: nextStage,
        },
      );

      setApplications((items) =>
        items.map((item) => (item.id === applicationId ? updated : item)),
      );
    } catch {
      setApplications(previous);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-semibold">Applications</h1>
        <p className="text-gray-600">
          Track your submitted applications and their status.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { title: "Total Applications", value: String(data.stats.totalApplications) },
          { title: "In Progress", value: String(data.stats.inProgress) },
          { title: "Under Review", value: String(data.stats.underReview) },
          { title: "Accepted", value: String(data.stats.accepted) },
        ].map((stat) => (
          <div key={stat.title} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-2 text-xs text-gray-500">{stat.title}</div>
            <div className="text-2xl font-semibold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex items-center gap-3">
        {["All", "In Progress", "Submitted", "Under Review", "Accepted", "Rejected"].map(
          (filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                activeFilter === filter
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ),
        )}
      </div>

      <div className="space-y-4">
        {filtered.map((application) => {
          const config = statusConfig[application.status] || statusConfig["in-progress"];

          return (
            <div
              key={application.id}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="mb-1 text-lg font-semibold">{application.title}</h3>
                  <p className="text-sm text-gray-600">by {application.company}</p>
                </div>
                <div
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${config.bg} ${config.border} ${config.text}`}
                >
                  <span className="text-xs font-medium">{config.label}</span>
                </div>
              </div>
              <div className="mb-4 grid grid-cols-4 gap-4">
                <div>
                  <div className="mb-1 text-xs text-gray-500">Submitted</div>
                  <div className="text-sm font-medium">{application.submittedDate}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-gray-500">Deadline</div>
                  <div className="text-sm font-medium">{application.deadline}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-gray-500">Current Stage</div>
                  <div className="text-sm font-medium">{application.stage}</div>
                </div>
                {application.interviewDate ? (
                  <div>
                    <div className="mb-1 text-xs text-gray-500">Interview</div>
                    <div className="text-sm font-medium text-green-600">
                      {application.interviewDate}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-gray-600">Application Progress</span>
                  <span className="text-xs font-medium">{application.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      application.status === "rejected"
                        ? "bg-red-500"
                        : application.status === "accepted"
                          ? "bg-green-500"
                          : "bg-indigo-600"
                    }`}
                    style={{ width: `${application.progress}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/opportunities/${application.detailOpportunityId}`}
                  state={{ from: "applications" }}
                  className="rounded-lg px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50"
                >
                  View Details
                </Link>
                {application.status === "in-progress" ? (
                  <button
                    onClick={() => continueApplication(application.id)}
                    disabled={updatingId === application.id}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {updatingId === application.id
                      ? "Saving..."
                      : "Continue Application"}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-400">
            No applications in this category.
          </div>
        ) : null}
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Share2,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Award,
  TrendingUp,
  Sparkles,
  FileText,
} from "lucide-react";

import { apiGet, apiPost } from "../lib/api";
import type { OpportunityDetailResponse } from "../types/api";

export async function loader({ params }: { params: { id?: string } }) {
  if (!params.id) {
    throw new Response("Opportunity not found", { status: 404 });
  }

  return apiGet<OpportunityDetailResponse>(`/api/opportunities/${params.id}`);
}

function formatStage(stage: string): string {
  return stage
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export default function OpportunityDetail() {
  const data = useLoaderData() as OpportunityDetailResponse;
  const location = useLocation();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(
    Boolean(data.quickActions.find((action) => typeof action.saved === "boolean")?.saved),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [applicationStarted, setApplicationStarted] = useState(false);
  const [isCreatingApplication, setIsCreatingApplication] = useState(false);

  const fromApplications = location.state?.from === "applications";
  const backPath = fromApplications ? "/applications" : "/opportunities";
  const backLabel = fromApplications ? "Applications" : "Opportunities";

  const officialLink = useMemo(
    () => data.quickActions.find((action) => Boolean(action.href))?.href,
    [data.quickActions],
  );

  async function handleSave() {
    const nextSaved = !saved;
    setIsSaving(true);
    setSaved(nextSaved);

    try {
      await apiPost(`/api/opportunities/${data.id}/save`, { saved: nextSaved });
    } catch {
      setSaved(!nextSaved);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStartApplication() {
    if (isCreatingApplication) {
      return;
    }

    setIsCreatingApplication(true);

    try {
      await apiPost("/api/applications", { opportunityId: data.id });
      setApplicationStarted(true);
      window.setTimeout(() => navigate("/applications"), 700);
    } finally {
      setIsCreatingApplication(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <Link
        to={backPath}
        className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {backLabel}
      </Link>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-teal-500">
                {data.logo ? (
                  <img
                    src={data.logo}
                    alt={data.company}
                    className="h-12 w-12 object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-xl font-bold text-white">{data.company[0]}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  {data.topPick ? (
                    <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      Top Pick for You
                    </span>
                  ) : null}
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    Requested as {data.requestedId}
                  </span>
                </div>
                <h1 className="mb-2 text-2xl font-semibold">{data.title}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">
                      {data.verified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                  <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                    {data.category}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
                  title="Copy link"
                >
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`rounded-lg border p-2 transition-colors ${
                    saved
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  title={saved ? "Remove bookmark" : "Bookmark"}
                >
                  {saved ? (
                    <BookmarkCheck className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <Bookmark className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-4">
              <InfoTile
                icon={<Calendar className="mt-0.5 h-5 w-5 text-indigo-600" />}
                value={data.deadline}
                label="Deadline"
              />
              <InfoTile
                icon={<DollarSign className="mt-0.5 h-5 w-5 text-indigo-600" />}
                value={data.estimatedValue}
                label="Est. Value"
              />
              <InfoTile
                icon={<MapPin className="mt-0.5 h-5 w-5 text-indigo-600" />}
                value={data.location || "Flexible"}
                label="Location"
              />
            </div>

            <div className="mb-6 grid grid-cols-4 gap-4">
              <ScoreRing
                label="Fit Score"
                value={data.fitScore}
                accentClass="text-green-600"
                subtitle={data.fitLabel}
              />
              <ScoreRing
                label="Urgency Score"
                value={data.urgencyScore}
                accentClass={
                  data.urgencyScore >= 70 ? "text-red-600" : "text-orange-600"
                }
                subtitle={data.urgencyLabel}
              />
              <ScoreBlock
                label="Economic Value"
                value={`RM ${data.economicValue.toLocaleString()}`}
                subtitle={data.strategicValueNarrative}
              />
              <ScoreBlock
                label="Effort Level"
                value={data.effortLevel}
                subtitle={data.tradeoff}
                accentClass="text-orange-600"
              />
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <div className="flex-1">
                  <div className="mb-1 text-sm font-semibold">
                    Recommended Action: {formatStage(data.recommendedAction)}
                  </div>
                  <div className="mb-3 text-sm text-gray-700">{data.nextStep}</div>
                  {applicationStarted ? (
                    <div className="flex w-fit items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white">
                      <CheckCircle2 className="h-4 w-4" /> Application Started
                    </div>
                  ) : (
                    <button
                      onClick={handleStartApplication}
                      disabled={isCreatingApplication}
                      className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-70"
                    >
                      {isCreatingApplication ? "Starting..." : "Start Application"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-2 text-lg font-semibold">Reasoning Summary</h2>
            <p className="mb-4 text-sm text-gray-600">{data.summary}</p>
            <div className="space-y-3">
              {data.reasoningBullets.map((reason) => (
                <div key={reason} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div className="text-sm font-medium text-gray-900">{reason}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <div className="mb-1 font-medium">Trade-off</div>
              <p>{data.tradeoff}</p>
              <div className="mt-3 mb-1 font-medium">Why not now</div>
              <p>{data.whyNotNow}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Required Documents</h2>
            <div className="grid grid-cols-2 gap-4">
              {data.requiredDocuments.map((document) => (
                <div key={document.name} className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <div className="mb-1 text-sm font-medium">{document.name}</div>
                    <div
                      className={`mb-1 text-xs ${
                        document.status === "Required"
                          ? "text-green-600"
                          : document.status === "Recommended"
                            ? "text-orange-600"
                            : "text-gray-500"
                      }`}
                    >
                      {document.status}
                      {document.ready ? " • Ready" : " • Missing"}
                    </div>
                    {document.action ? (
                      <Link
                        to="/documents"
                        className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        {document.action}
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 font-semibold">Next Step Checklist</h3>
            <div className="space-y-2">
              {data.checklist.map((step, index) => (
                <div key={step.label} className="flex items-center gap-2">
                  {step.done ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-300 text-xs">
                      {index + 1}
                    </div>
                  )}
                  <span className="text-sm">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 font-semibold">Competition Info</h3>
            <div className="space-y-3">
              <MetaRow
                icon={<Users className="h-4 w-4 text-indigo-600" />}
                label="Estimated Applicants"
                value={data.competitionInfo.estimatedApplicants}
              />
              <MetaRow
                icon={<Award className="h-4 w-4 text-indigo-600" />}
                label="Selection Rate"
                value={data.competitionInfo.selectionRate}
              />
              <MetaRow
                icon={<TrendingUp className="h-4 w-4 text-indigo-600" />}
                label="Your Standing"
                value={data.competitionInfo.standing}
              />
            </div>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold">AI Copilot</h3>
            </div>
            <p className="mb-4 text-sm text-gray-700">{data.aiExplanation.summary}</p>
            <Link
              to={`/ai-advisor?q=${encodeURIComponent(
                `How should I approach ${data.title}?`,
              )}`}
              className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Show me how
            </Link>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              {officialLink ? (
                <a
                  href={officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-left text-sm text-white hover:bg-indigo-700"
                >
                  <ExternalLink className="h-4 w-4" /> Apply on Official Site
                </a>
              ) : null}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-left text-sm transition-colors ${
                  saved
                    ? "border border-indigo-300 bg-indigo-50 text-indigo-600"
                    : "border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {saved ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Calendar className="h-4 w-4" />
                )}
                {saved ? "Saved" : "Save for Later"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-start gap-2">
      {icon}
      <div>
        <div className="mb-1 text-xs text-gray-500">{value}</div>
        <div className="text-sm font-medium">{label}</div>
      </div>
    </div>
  );
}

function ScoreRing({
  label,
  value,
  accentClass,
  subtitle,
}: {
  label: string;
  value: number;
  accentClass: string;
  subtitle: string;
}) {
  const dashOffset = 251.2 - (251.2 * value) / 100;

  return (
    <div className="text-center">
      <div className="relative mx-auto mb-2 h-24 w-24">
        <svg className="h-full w-full -rotate-90 transform">
          <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray="251.2"
            strokeDashoffset={dashOffset}
            className={accentClass}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-2xl font-semibold ${accentClass}`}>{value}%</div>
        </div>
      </div>
      <div className="text-xs font-medium">{label}</div>
      <div className={`text-xs ${accentClass}`}>{subtitle}</div>
    </div>
  );
}

function ScoreBlock({
  label,
  value,
  subtitle,
  accentClass = "text-gray-900",
}: {
  label: string;
  value: string;
  subtitle: string;
  accentClass?: string;
}) {
  return (
    <div className="text-center">
      <div className="mb-2 rounded-lg bg-gray-100 p-4">
        <div className={`text-2xl font-semibold ${accentClass}`}>{value}</div>
      </div>
      <div className="text-xs font-medium">{label}</div>
      <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="flex-1">
        <div className="text-xs text-gray-600">{label}</div>
        <div className="text-sm font-medium text-green-600">{value}</div>
      </div>
    </div>
  );
}

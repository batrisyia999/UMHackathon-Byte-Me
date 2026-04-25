import { useEffect, useMemo, useState } from "react";
import { Sparkles, Plus, X } from "lucide-react";
import { Link, useLoaderData } from "react-router";

import { apiGet, apiPut } from "../lib/api";
import type { ProfileResponse } from "../types/api";

export async function loader() {
  return apiGet<ProfileResponse>("/api/profile");
}

export default function Profile() {
  const data = useLoaderData() as ProfileResponse;
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const [showAddInterest, setShowAddInterest] = useState(false);
  const [form, setForm] = useState({
    name: data.profile.name,
    email: data.profile.email,
    phone: data.profile.phone,
    university: data.profile.university,
    course: data.profile.course,
    faculty: data.profile.faculty,
    year: String(data.profile.year),
    cgpaMin: String(data.profile.cgpaMin),
    cgpaMax: String(data.profile.cgpaMax),
    goal: data.profile.goal,
    timeAvailability: data.profile.timeAvailability,
    readinessLevel: data.profile.readinessLevel,
    interests: data.profile.interests,
  });

  useEffect(() => {
    setForm({
      name: data.profile.name,
      email: data.profile.email,
      phone: data.profile.phone,
      university: data.profile.university,
      course: data.profile.course,
      faculty: data.profile.faculty,
      year: String(data.profile.year),
      cgpaMin: String(data.profile.cgpaMin),
      cgpaMax: String(data.profile.cgpaMax),
      goal: data.profile.goal,
      timeAvailability: data.profile.timeAvailability,
      readinessLevel: data.profile.readinessLevel,
      interests: data.profile.interests,
    });
  }, [data.profile]);

  const completenessCards = useMemo(
    () => [
      { label: "Completeness", value: data.profileStrength.completeness },
      { label: "Assets", value: data.profileStrength.assets },
      { label: "Relevance", value: data.profileStrength.relevance },
      { label: "Engagement", value: data.profileStrength.engagement },
    ],
    [data.profileStrength],
  );

  async function saveProfile() {
    setIsSaving(true);

    try {
      await apiPut("/api/profile", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        university: form.university,
        course: form.course,
        faculty: form.faculty,
        year: Number(form.year),
        cgpaMin: Number(form.cgpaMin),
        cgpaMax: Number(form.cgpaMax),
        goal: form.goal,
        timeAvailability: form.timeAvailability,
        readinessLevel: form.readinessLevel,
        interests: form.interests,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } finally {
      setIsSaving(false);
    }
  }

  function addInterest() {
    const nextInterest = newInterest.trim();

    if (!nextInterest || form.interests.includes(nextInterest)) {
      return;
    }

    setForm((current) => ({
      ...current,
      interests: [...current.interests, nextInterest],
    }));
    setNewInterest("");
    setShowAddInterest(false);
  }

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold">Student Profile</h1>
        <p className="text-gray-600">
          Update your background so recommendations stay relevant and actionable.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={data.profile.avatar}
                  alt={data.profile.name}
                  className="h-14 w-14 rounded-full border border-gray-200 bg-indigo-50"
                />
                <div>
                  <div className="font-semibold">{data.profile.name}</div>
                  <div className="text-sm text-gray-600">
                    {data.profile.course} • {data.profile.university}
                  </div>
                </div>
              </div>
              <button
                onClick={() => void saveProfile()}
                disabled={isSaving}
                className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                  saved
                    ? "border-green-300 bg-green-50 text-green-600"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {isSaving ? "Saving..." : saved ? "Saved" : "Save Changes"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Full Name"
                value={form.name}
                onChange={(value) => setForm((current) => ({ ...current, name: value }))}
              />
              <Field
                label="Email"
                value={form.email}
                onChange={(value) => setForm((current) => ({ ...current, email: value }))}
              />
              <Field
                label="Phone"
                value={form.phone}
                onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
              />
              <Field
                label="University"
                value={form.university}
                onChange={(value) =>
                  setForm((current) => ({ ...current, university: value }))
                }
              />
              <Field
                label="Course"
                value={form.course}
                onChange={(value) => setForm((current) => ({ ...current, course: value }))}
              />
              <Field
                label="Faculty"
                value={form.faculty}
                onChange={(value) => setForm((current) => ({ ...current, faculty: value }))}
              />
              <Field
                label="Year"
                value={form.year}
                onChange={(value) => setForm((current) => ({ ...current, year: value }))}
              />
              <Field
                label="Goal"
                value={form.goal}
                onChange={(value) => setForm((current) => ({ ...current, goal: value }))}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Field
                label="CGPA Min"
                value={form.cgpaMin}
                onChange={(value) =>
                  setForm((current) => ({ ...current, cgpaMin: value }))
                }
              />
              <Field
                label="CGPA Max"
                value={form.cgpaMax}
                onChange={(value) =>
                  setForm((current) => ({ ...current, cgpaMax: value }))
                }
              />
            </div>

            <div className="mt-6">
              <div className="mb-2 text-sm font-medium">Areas of Interest</div>
              <div className="flex flex-wrap gap-2">
                {form.interests.map((interest) => (
                  <span
                    key={interest}
                    className="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1.5 text-sm text-indigo-700"
                  >
                    {interest}
                    <button
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          interests: current.interests.filter((item) => item !== interest),
                        }))
                      }
                      className="text-indigo-400 hover:text-indigo-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                {showAddInterest ? (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      type="text"
                      value={newInterest}
                      onChange={(event) => setNewInterest(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          addInterest();
                        }

                        if (event.key === "Escape") {
                          setShowAddInterest(false);
                        }
                      }}
                      placeholder="Type interest..."
                      className="w-36 rounded-full border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={addInterest}
                      className="rounded-full bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddInterest(true)}
                    className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <SelectField
                label="Time Availability"
                value={form.timeAvailability}
                options={["< 5 hrs", "5 - 10 hrs", "10 - 15 hrs", "15+ hrs/week"]}
                onChange={(value) =>
                  setForm((current) => ({ ...current, timeAvailability: value }))
                }
              />
              <SelectField
                label="Readiness Level"
                value={form.readinessLevel}
                options={[
                  "Just Exploring",
                  "Actively Preparing",
                  "Ready to Apply",
                ]}
                onChange={(value) =>
                  setForm((current) => ({ ...current, readinessLevel: value }))
                }
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Assets & Readiness</h2>
            <div className="grid grid-cols-2 gap-4">
              {data.assets.map((asset) => (
                <div key={asset.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-sm font-medium">{asset.label}</div>
                    <div className="text-xs text-gray-500">{asset.completion}%</div>
                  </div>
                  <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full ${
                        asset.status === "complete"
                          ? "bg-green-500"
                          : asset.status === "warning"
                            ? "bg-orange-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${asset.completion}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600">
                    {asset.filename || asset.category || "Pending upload"}
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/documents"
              className="mt-4 inline-block text-sm text-indigo-600 hover:underline"
            >
              Manage documents →
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold">AI Profile Summary</h3>
            </div>
            <div className="mb-2 text-sm text-gray-600">Match Quality</div>
            <div className="mb-1 text-2xl font-semibold text-indigo-700">
              {data.aiProfileSummary.matchQuality}
            </div>
            <div className="mb-4 text-sm text-gray-600">
              Score: {data.aiProfileSummary.matchQualityScore}/100
            </div>
            <div className="space-y-2">
              {data.aiProfileSummary.bestSuited.map((item) => (
                <div key={item.label} className="rounded bg-indigo-50 px-3 py-2">
                  <div className="text-sm font-medium text-indigo-700">{item.label}</div>
                  <div className={`text-xs ${item.color}`}>{item.match}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 font-semibold">Strength Breakdown</h3>
            <div className="space-y-3">
              {completenessCards.map((card) => (
                <div key={card.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{card.label}</span>
                    <span className="font-medium">{card.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-indigo-600"
                      style={{ width: `${card.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 font-semibold">Improvement Tips</h3>
            <div className="space-y-3">
              {data.improvementTips.map((tip) => (
                <div key={tip.tip} className="rounded-lg bg-gray-50 p-3">
                  <div className="text-sm font-medium">{tip.tip}</div>
                  <div className="text-xs text-gray-600">{tip.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 font-semibold">Readiness Modules</h3>
            <div className="space-y-3">
              {data.readinessModules.slice(0, 4).map((module) => (
                <Link
                  key={module.id}
                  to={module.href}
                  className="block rounded-lg border border-gray-200 p-3 hover:border-indigo-300"
                >
                  <div className="text-sm font-medium">{module.title}</div>
                  <div className="text-xs text-gray-600">
                    {module.completion}% • {module.impact} impact
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

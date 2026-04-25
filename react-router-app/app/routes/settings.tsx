import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Lock,
  Globe,
  Sparkles,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut,
  Download,
  Trash2,
} from "lucide-react";
import { useLoaderData, useNavigate } from "react-router";

import { apiGet, apiPost, apiPut } from "../lib/api";
import type { ExportResponse, SettingsResponse } from "../types/api";

export async function loader() {
  return apiGet<SettingsResponse>("/api/settings");
}

export default function Settings() {
  const data = useLoaderData() as SettingsResponse;
  const navigate = useNavigate();
  const [account, setAccount] = useState(data.account);
  const [notifications, setNotifications] = useState(data.notifications);
  const [aiPreferences, setAiPreferences] = useState(data.aiPreferences);
  const [region, setRegion] = useState(data.region);
  const [privacy, setPrivacy] = useState(data.privacy);
  const [feedback, setFeedback] = useState("");
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    setAccount(data.account);
    setNotifications(data.notifications);
    setAiPreferences(data.aiPreferences);
    setRegion(data.region);
    setPrivacy(data.privacy);
  }, [data]);

  function flash(message: string) {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 2500);
  }

  async function saveAccount() {
    setSavingSection("account");
    try {
      await apiPut("/api/settings/account", account);
      flash("Account settings saved");
    } finally {
      setSavingSection(null);
    }
  }

  async function saveNotifications(nextNotifications = notifications) {
    setSavingSection("notifications");
    try {
      await apiPut("/api/settings/notifications", {
        preferences: nextNotifications.map((item) => ({
          title: item.title,
          enabled: item.enabled,
        })),
      });
      flash("Notification settings updated");
    } finally {
      setSavingSection(null);
    }
  }

  async function saveAiPreferences() {
    setSavingSection("ai");
    try {
      await apiPut("/api/settings/ai-preferences", aiPreferences);
      flash("AI preferences updated");
    } finally {
      setSavingSection(null);
    }
  }

  async function saveRegion() {
    setSavingSection("region");
    try {
      await apiPut("/api/settings/region", region);
      flash("Region settings updated");
    } finally {
      setSavingSection(null);
    }
  }

  async function savePrivacy() {
    setSavingSection("privacy");
    try {
      await apiPut("/api/settings/privacy", privacy);
      flash("Privacy settings updated");
    } finally {
      setSavingSection(null);
    }
  }

  async function exportData() {
    setSavingSection("export");
    try {
      const result = await apiPost<ExportResponse>("/api/settings/export");
      flash(result.message);
    } finally {
      setSavingSection(null);
    }
  }

  async function clearHistory() {
    setSavingSection("history");
    try {
      await apiPost("/api/settings/history/clear");
      flash("Advisor history cleared");
    } finally {
      setSavingSection(null);
    }
  }

  async function submitFeedback() {
    if (!feedback.trim()) {
      return;
    }

    setSavingSection("feedback");
    try {
      await apiPost("/api/settings/feedback", { message: feedback.trim() });
      setFeedback("");
      flash("Feedback sent");
    } finally {
      setSavingSection(null);
    }
  }

  async function deactivateAccount() {
    setSavingSection("deactivate");
    try {
      await apiPost("/api/settings/deactivate");
      flash("Account deactivation requested");
    } finally {
      setSavingSection(null);
    }
  }

  async function deleteAccount() {
    setSavingSection("delete");
    try {
      await apiPost("/api/settings/delete");
      flash("Account deletion requested");
    } finally {
      setSavingSection(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-semibold">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences.</p>
      </div>

      {actionMessage ? (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {actionMessage}
        </div>
      ) : null}

      <div className="space-y-6">
        <SectionCard icon={<User className="h-5 w-5" />} title="Account">
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Full Name"
              value={account.fullName}
              onChange={(value) =>
                setAccount((current) => ({ ...current, fullName: value, name: value }))
              }
            />
            <Field
              label="Email"
              value={account.email}
              onChange={(value) => setAccount((current) => ({ ...current, email: value }))}
            />
            <Field
              label="Phone"
              value={account.phone}
              onChange={(value) => setAccount((current) => ({ ...current, phone: value }))}
            />
            <Field
              label="University"
              value={account.university}
              onChange={(value) =>
                setAccount((current) => ({ ...current, university: value }))
              }
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => void saveAccount()}
              disabled={savingSection === "account"}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {savingSection === "account" ? "Saving..." : "Save Account"}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("isLoggedIn");
                navigate("/login");
              }}
              className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </SectionCard>

        <SectionCard icon={<Bell className="h-5 w-5" />} title="Notifications">
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <div>
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
                <button
                  onClick={() => {
                    const updated = notifications.map((entry) =>
                      entry.title === item.title
                        ? { ...entry, enabled: !entry.enabled }
                        : entry,
                    );
                    setNotifications(updated);
                    void saveNotifications(updated);
                  }}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    item.enabled ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      item.enabled ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="grid grid-cols-2 gap-6">
          <SectionCard icon={<Sparkles className="h-5 w-5" />} title="AI Preferences">
            <div className="space-y-4">
              <ToggleRow
                label="Proactive Suggestions"
                description="Let the assistant suggest actions before you ask."
                enabled={aiPreferences.proactiveSuggestions}
                onToggle={() =>
                  setAiPreferences((current) => ({
                    ...current,
                    proactiveSuggestions: !current.proactiveSuggestions,
                  }))
                }
              />
              <ToggleRow
                label="Use AI interactions for training"
                description="Allow anonymous usage of your AI interactions for training."
                enabled={aiPreferences.dataUsageForTraining}
                onToggle={() =>
                  setAiPreferences((current) => ({
                    ...current,
                    dataUsageForTraining: !current.dataUsageForTraining,
                  }))
                }
              />
              <SelectField
                label="Context Awareness"
                value={aiPreferences.contextAwareness}
                options={["Low", "Medium", "High"]}
                onChange={(value) =>
                  setAiPreferences((current) => ({ ...current, contextAwareness: value }))
                }
              />
              <SelectField
                label="Response Style"
                value={aiPreferences.responseStyle}
                options={["Concise", "Balanced", "Detailed"]}
                onChange={(value) =>
                  setAiPreferences((current) => ({ ...current, responseStyle: value }))
                }
              />
              <button
                onClick={() => void saveAiPreferences()}
                disabled={savingSection === "ai"}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {savingSection === "ai" ? "Saving..." : "Save AI Preferences"}
              </button>
            </div>
          </SectionCard>

          <SectionCard icon={<Globe className="h-5 w-5" />} title="Language & Region">
            <div className="space-y-4">
              <Field
                label="Language"
                value={region.language}
                onChange={(value) => setRegion((current) => ({ ...current, language: value }))}
              />
              <Field
                label="Timezone"
                value={region.timezone}
                onChange={(value) => setRegion((current) => ({ ...current, timezone: value }))}
              />
              <Field
                label="Date Format"
                value={region.dateFormat}
                onChange={(value) =>
                  setRegion((current) => ({ ...current, dateFormat: value }))
                }
              />
              <button
                onClick={() => void saveRegion()}
                disabled={savingSection === "region"}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {savingSection === "region" ? "Saving..." : "Save Region"}
              </button>
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <SectionCard icon={<Lock className="h-5 w-5" />} title="Privacy & Security">
            <div className="space-y-4">
              <SelectField
                label="Profile Visibility"
                value={privacy.profileVisibility}
                options={["Public", "Private", "Connections Only"]}
                onChange={(value) =>
                  setPrivacy((current) => ({ ...current, profileVisibility: value }))
                }
              />
              <ToggleRow
                label="Show University"
                description="Display your university on your public profile."
                enabled={privacy.showUniversity}
                onToggle={() =>
                  setPrivacy((current) => ({
                    ...current,
                    showUniversity: !current.showUniversity,
                  }))
                }
              />
              <ToggleRow
                label="Analytics Enabled"
                description="Allow usage analytics to improve the product."
                enabled={privacy.analyticsEnabled}
                onToggle={() =>
                  setPrivacy((current) => ({
                    ...current,
                    analyticsEnabled: !current.analyticsEnabled,
                  }))
                }
              />
              <ToggleRow
                label="Third-Party Sharing"
                description="Share selected profile data with partner platforms."
                enabled={privacy.thirdPartySharing}
                onToggle={() =>
                  setPrivacy((current) => ({
                    ...current,
                    thirdPartySharing: !current.thirdPartySharing,
                  }))
                }
              />
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm">
                <div className="font-medium">Password</div>
                <div className="text-gray-600">
                  Last changed {data.security.passwordLastChangedLabel}
                </div>
                <div className="mt-2 font-medium">
                  Two-factor authentication:{" "}
                  {data.security.twoFactorEnabled ? "Enabled" : "Disabled"}
                </div>
              </div>
              <button
                onClick={() => void savePrivacy()}
                disabled={savingSection === "privacy"}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {savingSection === "privacy" ? "Saving..." : "Save Privacy"}
              </button>
            </div>
          </SectionCard>

          <SectionCard icon={<CreditCard className="h-5 w-5" />} title="Subscription">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="text-sm font-medium">{data.subscription.currentPlan}</div>
              <div className="text-xs text-gray-500">
                {data.subscription.currency} {data.subscription.priceMonthly}/month •
                valid until {data.subscription.validUntil}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {data.subscription.benefits.map((benefit) => (
                <div key={benefit} className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  {benefit}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="mb-2 text-sm font-medium">Recent Transactions</div>
              <div className="space-y-2">
                {data.subscription.recentTransactions.map((transaction) => (
                  <div
                    key={`${transaction.label}-${transaction.date}`}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{transaction.label}</div>
                      <div className="text-xs text-gray-500">{transaction.date}</div>
                    </div>
                    <div className="text-sm font-semibold">{transaction.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <SectionCard icon={<Shield className="h-5 w-5" />} title="Data Controls">
            <div className="space-y-3">
              <button
                onClick={() => void exportData()}
                disabled={savingSection === "export"}
                className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                {savingSection === "export" ? "Exporting..." : "Export My Data"}
              </button>
              <button
                onClick={() => void clearHistory()}
                disabled={savingSection === "history"}
                className="w-full rounded-lg border border-orange-200 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 disabled:opacity-60"
              >
                {savingSection === "history" ? "Clearing..." : "Clear AI History"}
              </button>
              <button
                onClick={() => void deactivateAccount()}
                disabled={savingSection === "deactivate"}
                className="w-full rounded-lg border border-orange-200 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 disabled:opacity-60"
              >
                {savingSection === "deactivate"
                  ? "Requesting..."
                  : "Deactivate Account"}
              </button>
              <button
                onClick={() => void deleteAccount()}
                disabled={savingSection === "delete"}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {savingSection === "delete" ? "Requesting..." : "Delete Account"}
              </button>
            </div>
          </SectionCard>

          <SectionCard icon={<HelpCircle className="h-5 w-5" />} title="Help & Support">
            <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="text-sm font-medium">Support Email</div>
              <div className="text-sm text-indigo-600">{data.support.supportEmail}</div>
            </div>
            <div className="mb-4 space-y-3">
              {data.support.faq.map((item) => (
                <div key={item.question} className="rounded-lg border border-gray-100 p-4">
                  <div className="text-sm font-medium">{item.question}</div>
                  <div className="mt-1 text-xs text-gray-600">{item.answer}</div>
                </div>
              ))}
            </div>
            <textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="Share feedback or request help..."
              className="mb-3 min-h-28 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => void submitFeedback()}
              disabled={savingSection === "feedback" || !feedback.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {savingSection === "feedback" ? "Sending..." : "Send Feedback"}
            </button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="text-gray-600">{icon}</div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
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
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
      <button
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          enabled ? "bg-indigo-600" : "bg-gray-200"
        }`}
      >
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

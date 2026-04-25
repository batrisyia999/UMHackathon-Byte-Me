import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Video,
  FileText,
  Download,
  Search,
  Star,
  Check,
} from "lucide-react";
import { Link, useLoaderData } from "react-router";

import { apiGet, apiPost } from "../lib/api";
import type { ResourcesResponse } from "../types/api";

export async function loader() {
  return apiGet<ResourcesResponse>("/api/resources");
}

export default function ResourceHub() {
  const data = useLoaderData() as ResourcesResponse;
  const [activeCategory, setActiveCategory] = useState("All Resources");
  const [searchQuery, setSearchQuery] = useState("");
  const [resources, setResources] = useState(data.resources);
  const [webinars, setWebinars] = useState(data.webinars);
  const [workingId, setWorkingId] = useState<string | null>(null);

  useEffect(() => {
    setResources(data.resources);
    setWebinars(data.webinars);
  }, [data.resources, data.webinars]);

  const typeIcons: Record<string, React.ReactNode> = {
    guide: <BookOpen className="h-5 w-5 text-indigo-600" />,
    video: <Video className="h-5 w-5 text-purple-600" />,
    template: <FileText className="h-5 w-5 text-green-600" />,
  };

  const filtered = useMemo(() => {
    const normalizedCategory = activeCategory.toLowerCase();
    return resources.filter((resource) => {
      const matchesCategory =
        activeCategory === "All Resources" ||
        resource.type === normalizedCategory.replace(/s$/, "");
      const matchesSearch =
        !searchQuery ||
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, resources, searchQuery]);

  async function handleDownload(resourceId: string) {
    setWorkingId(resourceId);
    try {
      const updated = await apiPost<ResourcesResponse["resources"][number]>(
        `/api/resources/${resourceId}/download`,
      );
      setResources((current) =>
        current.map((resource) => (resource.id === resourceId ? updated : resource)),
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function handleRegister(webinarId: string) {
    setWorkingId(webinarId);
    try {
      const updated = await apiPost<ResourcesResponse["webinars"][number]>(
        `/api/resources/webinars/${webinarId}/register`,
      );
      setWebinars((current) =>
        current.map((webinar) => (webinar.id === webinarId ? updated : webinar)),
      );
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-semibold">Resource Hub</h1>
          <p className="text-gray-600">
            Access guides, templates, and resources to help you succeed.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search resources..."
            className="rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="mb-6 flex gap-3">
        {["All Resources", ...data.categories].map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${
              activeCategory === category
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-400">
              No resources found for "{searchQuery}"
            </div>
          ) : (
            filtered.map((resource) => (
              <div
                key={resource.id}
                className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-lg"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  {typeIcons[resource.type] || (
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold">{resource.title}</h3>
                  <p className="mb-2 text-sm text-gray-600">{resource.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      {resource.rating}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3.5 w-3.5" />
                      {resource.downloads.toLocaleString()}
                    </div>
                    <div>{resource.duration}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDownload(resource.id)}
                  disabled={workingId === resource.id}
                  className={`flex flex-shrink-0 items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
                    resource.downloaded
                      ? "border-green-200 bg-green-50 text-green-600"
                      : "border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-60"
                  }`}
                >
                  {resource.downloaded ? (
                    <>
                      <Check className="h-4 w-4" /> Downloaded
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" /> Download
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-5">
            <h3 className="mb-3 font-semibold">Need help?</h3>
            <p className="mb-4 text-sm text-gray-700">
              Can&apos;t find what you&apos;re looking for? Our AI Advisor can help.
            </p>
            <Link
              to="/ai-advisor?q=Help+me+find+resources+for+my+applications"
              className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Ask AI Advisor
            </Link>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 font-semibold">Upcoming Webinars</h3>
            <div className="space-y-3">
              {webinars.map((webinar) => (
                <div key={webinar.id} className="border-l-4 border-indigo-600 pl-3">
                  <div className="text-sm font-medium">{webinar.title}</div>
                  <div className="text-xs text-gray-600">
                    {webinar.date} • {webinar.time}
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleRegister(webinar.id)}
                    disabled={workingId === webinar.id}
                    className={`mt-1 text-xs transition-colors ${
                      webinar.registered
                        ? "font-medium text-green-600"
                        : "text-indigo-600 hover:underline disabled:cursor-wait disabled:opacity-60"
                    }`}
                  >
                    {webinar.registered ? "Registered" : "Register"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

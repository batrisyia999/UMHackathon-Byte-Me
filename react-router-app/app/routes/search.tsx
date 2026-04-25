import { Link, useLoaderData } from "react-router";
import {
  Search as SearchIcon,
  Briefcase,
  BookOpen,
  Users,
  ArrowRight,
} from "lucide-react";

import { apiGet } from "../lib/api";
import type { SearchResponse } from "../types/api";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";

  if (!query) {
    return { query: "", totalCount: 0, results: [] } satisfies SearchResponse;
  }

  return apiGet<SearchResponse>("/api/search", { q: query });
}

export default function Search() {
  const data = useLoaderData() as SearchResponse;

  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-semibold">Search Results</h1>
        <p className="text-gray-600">
          {data.query
            ? `Showing ${data.totalCount} results for "${data.query}"`
            : "Enter a search term in the top bar to find opportunities, resources, and people."}
        </p>
      </div>

      {data.query && data.results.length > 0 ? (
        <div className="space-y-4">
          {data.results.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              className="rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-indigo-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-lg bg-gray-50 p-3">
                  {result.type === "opportunity" ? (
                    <Briefcase className="h-5 w-5 text-indigo-600" />
                  ) : result.type === "resource" ? (
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Users className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      {result.type}
                    </span>
                    {typeof result.fitScore === "number" ? (
                      <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                        Fit {result.fitScore}%
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mb-1 text-lg font-medium text-gray-900">
                    {result.title}
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">{result.description}</p>

                  <Link
                    to={result.link}
                    className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View details <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : data.query ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
          <SearchIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="mb-1 text-lg font-medium text-gray-900">No results found</h3>
          <p className="text-sm text-gray-500">
            We couldn&apos;t find anything matching "{data.query}". Try different
            keywords.
          </p>
        </div>
      ) : null}
    </div>
  );
}

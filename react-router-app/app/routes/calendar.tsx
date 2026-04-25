import { CalendarDays } from "lucide-react";
import { useLoaderData } from "react-router";

import { apiGet } from "../lib/api";
import type { CalendarResponse } from "../types/api";

export async function loader() {
  return apiGet<CalendarResponse>("/api/calendar");
}

export default function Calendar() {
  const data = useLoaderData() as CalendarResponse;

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-semibold">Calendar</h1>
        <p className="text-gray-600">
          View deadlines, interviews, and important dates.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{data.monthLabel}</h2>
            <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-600">
              <CalendarDays className="h-4 w-4" />
              Synced from backend calendar feed
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-2">
            {data.dayHeaders.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-sm font-medium text-gray-600"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {data.grid.map((cell) => (
              <div
                key={`${cell.iso}-${cell.date}`}
                className={`aspect-square rounded-lg border p-2 text-left ${
                  cell.isCurrentMonth
                    ? cell.isToday
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-gray-200 bg-white"
                    : "border-gray-100 bg-gray-50 text-gray-400"
                }`}
              >
                <div className="text-sm font-medium">{cell.date}</div>
                <div className="mt-1 space-y-1">
                  {cell.events.slice(0, 2).map((event) => (
                    <div
                      key={`${cell.iso}-${event.title}`}
                      className={`truncate rounded px-1 py-0.5 text-[11px] ${
                        cell.isToday ? "bg-indigo-500 text-white" : event.color
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {cell.events.length > 2 ? (
                    <div className="text-[11px] text-gray-500">
                      +{cell.events.length - 2} more
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 font-semibold">Upcoming Events</h3>
            <div className="space-y-3">
              {data.upcoming.map((item) => (
                <div
                  key={`${item.date}-${item.title}`}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <div className="mb-1 text-sm font-medium">{item.title}</div>
                  <div className="mb-2 text-xs text-gray-600">{item.date}</div>
                  <span className={`rounded px-2 py-1 text-xs ${item.color}`}>
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

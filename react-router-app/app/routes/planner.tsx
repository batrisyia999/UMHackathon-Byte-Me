import { useEffect, useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Link, useLoaderData } from "react-router";

import { apiGet, apiPost } from "../lib/api";
import type { ApiPlannerTask, PlannerResponse } from "../types/api";

export async function loader() {
  return apiGet<PlannerResponse>("/api/planner");
}

export default function Planner() {
  const data = useLoaderData() as PlannerResponse;
  const [tasks, setTasks] = useState(data.tasks);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
  const [optimization, setOptimization] = useState(data.optimization);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    setTasks(data.tasks);
    setOptimization(data.optimization);
  }, [data.tasks, data.optimization]);

  const categories = useMemo(
    () =>
      data.categories.map((category) => ({
        ...category,
        count:
          category.title === "Apply Now"
            ? tasks.filter((task) => task.type === "apply-now").length
            : category.title === "Prepare Soon"
              ? tasks.filter((task) => task.type === "prepare-soon").length
              : category.title === "Track Later"
                ? tasks.filter((task) => task.type === "track-later").length
                : tasks.filter((task) => task.type === "skip").length,
      })),
    [data.categories, tasks],
  );

  const totalEstimatedTimeHours = useMemo(
    () =>
      Number(
        (
          tasks.reduce((sum, task) => sum + (task.durationMinutes ?? 30), 0) / 60
        ).toFixed(1),
      ),
    [tasks],
  );

  const focusScore = useMemo(() => {
    if (tasks.length === 0) {
      return data.focusScore;
    }

    const completed = tasks.filter((task) => task.completed).length;
    return Math.max(data.focusScore, Math.round((completed / tasks.length) * 100));
  }, [data.focusScore, tasks]);

  async function toggleTask(taskId: string) {
    const previous = tasks;
    setTogglingTaskId(taskId);
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              done: !task.done,
            }
          : task,
      ),
    );

    try {
      const updated = await apiPost<ApiPlannerTask>(`/api/planner/tasks/${taskId}/toggle`);
      setTasks((current) =>
        current.map((task) => (task.id === taskId ? updated : task)),
      );
    } catch {
      setTasks(previous);
    } finally {
      setTogglingTaskId(null);
    }
  }

  async function handleAddTask() {
    if (!newTask.trim() || isSavingTask) {
      return;
    }

    setIsSavingTask(true);

    try {
      const created = await apiPost<ApiPlannerTask>("/api/planner/tasks", {
        title: newTask.trim(),
        subtitle: "Manual focus item",
        type: "apply-now",
        duration: "30min",
      });

      setTasks((current) => [created, ...current]);
      setNewTask("");
      setShowAddTask(false);
    } finally {
      setIsSavingTask(false);
    }
  }

  async function optimizePlan() {
    if (isOptimizing) {
      return;
    }

    setIsOptimizing(true);

    try {
      const optimized = await apiPost<
        PlannerResponse & { optimizedTasks?: ApiPlannerTask[] }
      >("/api/planner/optimize");
      setOptimization(optimized.optimization);
      setTasks(optimized.optimizedTasks ?? optimized.tasks);
    } finally {
      setIsOptimizing(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-semibold">Weekly Priority Planner</h1>
        <p className="text-gray-600">
          Your AI-generated action plan to maximize outcomes this week.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{data.weekLabel}</div>
                <div className="text-sm text-gray-600">
                  Total Estimated Time: {totalEstimatedTimeHours} hrs
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddTask((value) => !value)}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" /> Add Task
                </button>
                <button
                  onClick={optimizePlan}
                  disabled={isOptimizing}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-60"
                >
                  {isOptimizing ? "Optimizing..." : "Optimize Plan"}
                </button>
              </div>
            </div>

            {showAddTask ? (
              <div className="mb-4 flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newTask}
                  onChange={(event) => setNewTask(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleAddTask();
                    }

                    if (event.key === "Escape") {
                      setShowAddTask(false);
                    }
                  }}
                  placeholder="Task title..."
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAddTask}
                  disabled={isSavingTask}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddTask(false)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            ) : null}

            <div className="mb-6 grid grid-cols-4 gap-4">
              {categories.map((category) => (
                <div
                  key={category.title}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="mb-1 text-sm font-medium">{category.title}</div>
                  <div className="mb-2 text-2xl font-semibold">{category.count} tasks</div>
                  <div className="text-xs text-gray-600">{category.effort}</div>
                  <div className="text-xs">{category.roi}</div>
                </div>
              ))}
            </div>

            <div className="mb-6 flex items-center gap-2 rounded-lg bg-indigo-50 p-3 text-sm">
              <span>Total Estimated Time: {totalEstimatedTimeHours} hrs</span>
              <span className="ml-auto text-green-600">Focus Score: {focusScore}%</span>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  disabled={togglingTaskId === task.id}
                  className={`flex w-full gap-3 rounded-lg border p-4 text-left transition-opacity ${
                    task.completed
                      ? "border-green-200 bg-green-50 opacity-70"
                      : task.type === "apply-now"
                        ? "border-green-200 bg-green-50"
                        : task.type === "prepare-soon"
                          ? "border-orange-200 bg-orange-50"
                          : task.type === "track-later"
                            ? "border-blue-200 bg-blue-50"
                            : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="w-12 text-sm text-gray-600">{task.time || "--:--"}</div>
                  <div className="flex-1">
                    <div
                      className={`text-sm font-medium ${
                        task.completed ? "text-gray-400 line-through" : ""
                      }`}
                    >
                      {task.title}
                    </div>
                    {task.subtitle ? (
                      <div className="text-xs text-gray-600">{task.subtitle}</div>
                    ) : null}
                    {task.opportunityId ? (
                      <Link
                        to={`/opportunities/${task.opportunityId}`}
                        onClick={(event) => event.stopPropagation()}
                        className="mt-2 inline-block text-xs text-indigo-600 hover:underline"
                      >
                        View related opportunity
                      </Link>
                    ) : null}
                  </div>
                  <div className="text-xs text-gray-500">{task.duration}</div>
                  {task.completed ? (
                    <div className="text-xs font-medium text-green-600">Done</div>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 font-semibold">Why this plan?</h3>
            <div className="space-y-3 text-sm text-gray-700">
              {data.rationale.map((reason) => (
                <div key={reason} className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <div className="h-2 w-2 rounded-full bg-green-600" />
                  </div>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-red-50 p-5">
            <h3 className="mb-3 font-semibold">{optimization.title}</h3>
            <div className="rounded-lg bg-white p-3 text-sm text-gray-700">
              {optimization.text}
            </div>
            <button
              onClick={optimizePlan}
              disabled={isOptimizing}
              className="mt-3 w-full rounded-lg bg-orange-600 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
            >
              {isOptimizing ? "Applying..." : "Apply Optimization"}
            </button>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold">AI Planning Tip</h3>
            </div>
            <p className="mb-4 text-sm text-gray-700">{data.focusTip}</p>
            <Link
              to="/ai-advisor?q=Help+me+optimize+my+weekly+plan"
              className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Ask AI Advisor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

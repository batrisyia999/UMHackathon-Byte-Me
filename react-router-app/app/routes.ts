import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
    index("routes/home.tsx"),
    route("ai-advisor", "routes/ai-advisor.tsx"),
    route("profile", "routes/profile.tsx"),
    route("opportunities", "routes/opportunities.tsx"),
    route("opportunity-detail", "routes/opportunity-detail.tsx"),
    route("pipeline", "routes/pipeline.tsx"),
    route("applications", "routes/applications.tsx"),
    route("calendar", "routes/calendar.tsx"),
    route("documents", "routes/documents.tsx"),
    route("network", "routes/network.tsx"),
    route("resource-hub", "routes/resource-hub.tsx"),
    route("settings", "routes/settings.tsx"),
    route("readiness", "routes/readiness.tsx"),
    route("planner", "routes/planner.tsx"),
    route("insights", "routes/insights.tsx"),
    route("search", "routes/search.tsx"),
    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx"),
] satisfies RouteConfig
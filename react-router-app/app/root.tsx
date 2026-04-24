import { useState, useRef, useEffect } from "react"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  NavLink,
  useNavigate,
  useLocation,
  Link,
} from "react-router"
import {
  Home,
  Briefcase,
  KanbanSquare,
  FileText,
  Calendar,
  FolderOpen,
  Users,
  Sparkles,
  BookOpen,
  Settings,
  CheckSquare,
  CalendarDays,
  LineChart,
  User,
  Search,
  Bell,
} from "lucide-react"

import type { Route } from "./+types/root"
import "./app.css"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Opportunities", href: "/opportunities", icon: Briefcase },
  { name: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  { name: "Applications", href: "/applications", icon: FileText },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Documents", href: "/documents", icon: FolderOpen },
  { name: "Network", href: "/network", icon: Users },
  { name: "AI Advisor", href: "/ai-advisor", icon: Sparkles },
  { name: "Resource Hub", href: "/resource-hub", icon: BookOpen },
  { name: "Readiness", href: "/readiness", icon: CheckSquare },
  { name: "Planner", href: "/planner", icon: CalendarDays },
  { name: "Insights", href: "/insights", icon: LineChart },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  if (isAuthPage) {
    return (
      <div className="flex h-screen bg-gray-50 font-sans">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Sparkles className="w-6 h-6 text-indigo-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">OpportunIQ</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "text-indigo-600 bg-indigo-50 font-medium"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive ? "text-indigo-600" : "text-gray-400"
                    }`}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex-1 flex items-center">
            <div className="relative w-96 hidden md:block">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search opportunities (press Enter)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full bg-gray-100 border-transparent rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-gray-900"
              />
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-gray-500 hover:text-indigo-600 transition-colors p-1"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white box-content"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <span className="text-xs text-indigo-600 cursor-pointer">Mark all as read</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                      <div className="text-sm font-medium text-gray-900">Application Update</div>
                      <div className="text-xs text-gray-600 mt-1">Your application for Google STEP Internship is under review.</div>
                      <div className="text-xs text-gray-400 mt-1">2 hours ago</div>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                      <div className="text-sm font-medium text-gray-900">New Match Found!</div>
                      <div className="text-xs text-gray-600 mt-1">We found a 96% match for PETRONAS Digital Innovation Internship.</div>
                      <div className="text-xs text-gray-400 mt-1">5 hours ago</div>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <div className="text-sm font-medium text-gray-900">Deadline Approaching</div>
                      <div className="text-xs text-gray-600 mt-1">ADB-Japan Scholarship Program deadline is in 3 days.</div>
                      <div className="text-xs text-gray-400 mt-1">1 day ago</div>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 text-center">
                    <span className="text-xs font-medium text-indigo-600 cursor-pointer">View all notifications</span>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-gray-200"></div>
            
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha" 
                  alt="Aisha Rahman" 
                  className="w-9 h-9 rounded-full bg-indigo-50 border border-gray-200"
                />
                <span className="text-sm font-medium text-gray-900">Aisha Rahman</span>
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <div className="text-sm font-semibold text-gray-900">Aisha Rahman</div>
                    <div className="text-xs text-gray-500">aisha.rahman@student.um.edu.my</div>
                  </div>
                  <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" /> My Profile
                  </Link>
                  <Link to="/opportunities" onClick={() => setShowProfileMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-500" /> Opportunities
                  </Link>
                  <Link to="/settings" onClick={() => setShowProfileMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-500" /> Settings
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button onClick={() => navigate('/login')} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}

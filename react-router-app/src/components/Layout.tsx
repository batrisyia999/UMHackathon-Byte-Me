import React from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Briefcase, 
  CheckSquare, 
  CalendarDays, 
  Sparkles, 
  Bell,
  Search
} from 'lucide-react';
import { MOCK_USER } from '../../app/lib/mockData';

const NAVIGATION = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pipeline', href: '/pipeline', icon: KanbanSquare },
  { name: 'Opportunities', href: '/opportunities', icon: Briefcase },
  { name: 'Readiness Tracker', href: '/readiness', icon: CheckSquare },
  { name: 'Planner', href: '/planner', icon: CalendarDays },
  { name: 'AI Advisor', href: '/ai-advisor', icon: Sparkles },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shadow-sm relative z-20">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2.5 text-indigo-600 hover:text-indigo-700 transition-colors">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Opportun<span className="text-indigo-600">IQ</span>
            </span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Menu</div>
          {NAVIGATION.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-600 rounded-r-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                )}
                <Icon className={`w-5 h-5 transition-colors z-10 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="text-sm z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Profile */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-4 rounded-2xl">
          <Link 
            to="/profile"
            className="flex items-center gap-3 p-1 rounded-xl hover:opacity-80 transition-opacity"
          >
            <img 
              src={MOCK_USER.avatar} 
              alt={MOCK_USER.name} 
              className="w-10 h-10 rounded-full bg-indigo-100 object-cover shadow-sm ring-2 ring-white"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {MOCK_USER.name}
              </p>
              <p className="text-xs text-slate-500 truncate font-medium">
                View Profile
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex-1 flex items-center">
            {/* Optional Global Search Bar */}
            <div className="relative w-96 hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search opportunities, tasks..." 
                className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700"
              />
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button className="relative text-slate-400 hover:text-indigo-600 transition-colors p-1">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
               <img 
                src={MOCK_USER.avatar} 
                alt="Profile" 
                className="w-8 h-8 rounded-full shadow-sm ring-2 ring-indigo-50"
              />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

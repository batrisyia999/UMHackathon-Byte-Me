import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Link } from 'react-router';

export function loader() {
    return {};
}

type CalEvent = { label: string; color: string; type: string };

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function daysInMonth(month: number, year: number) {
    if (month === 1 && year % 4 === 0) return 29;
    return DAYS_IN_MONTH[month];
}

// Day of week of first day (0=Sun) — simple calculation
function firstDayOf(month: number, year: number) {
    return new Date(year, month, 1).getDay();
}

export default function Calendar() {
    const today = new Date();
    const [viewMonth, setViewMonth] = useState(4); // May = 4 (0-indexed)
    const [viewYear, setViewYear] = useState(2025);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [newEventLabel, setNewEventLabel] = useState('');
    const [newEventType, setNewEventType] = useState('Deadline');

    const [events, setEvents] = useState<Record<string, CalEvent[]>>({
        '2025-4-15': [{ label: 'ADB Deadline', color: 'bg-green-100 text-green-700', type: 'Application Deadline' }],
        '2025-4-20': [{ label: 'PETRONAS Interview', color: 'bg-orange-100 text-orange-700', type: 'Interview' }],
        '2025-4-24': [{ label: 'Google STEP', color: 'bg-red-100 text-red-700', type: 'Application Deadline' }],
        '2025-4-28': [{ label: 'Maybank YTP', color: 'bg-blue-100 text-blue-700', type: 'Application Deadline' }],
        '2025-4-31': [{ label: 'Shell Assessment', color: 'bg-purple-100 text-purple-700', type: 'Assessment' }],
    });

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
        setSelectedDay(null);
    };

    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
        setSelectedDay(null);
    };

    const goToToday = () => {
        setViewMonth(today.getMonth());
        setViewYear(today.getFullYear());
        setSelectedDay(today.getDate());
    };

    const eventKey = (day: number) => `${viewYear}-${viewMonth}-${day}`;

    const addEvent = () => {
        if (!newEventLabel.trim() || !selectedDay) return;
        const key = eventKey(selectedDay);
        const colors: Record<string, string> = {
            Deadline: 'bg-red-100 text-red-700',
            Interview: 'bg-purple-100 text-purple-700',
            Assessment: 'bg-orange-100 text-orange-700',
            Reminder: 'bg-blue-100 text-blue-700',
        };
        setEvents(prev => ({
            ...prev,
            [key]: [...(prev[key] ?? []), { label: newEventLabel.trim(), color: colors[newEventType] ?? 'bg-gray-100 text-gray-700', type: newEventType }],
        }));
        setNewEventLabel('');
        setShowAddEvent(false);
    };

    const removeEvent = (day: number, idx: number) => {
        const key = eventKey(day);
        setEvents(prev => {
            const updated = [...(prev[key] ?? [])];
            updated.splice(idx, 1);
            return { ...prev, [key]: updated };
        });
    };

    const totalDays = daysInMonth(viewMonth, viewYear);
    const firstDay = firstDayOf(viewMonth, viewYear);
    const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear();

    // All upcoming events across the current month
    const upcomingEvents = Object.entries(events)
        .filter(([key]) => {
            const [y, m] = key.split('-').map(Number);
            return y === viewYear && m === viewMonth;
        })
        .flatMap(([key, evts]) => {
            const day = Number(key.split('-')[2]);
            return evts.map(e => ({ day, ...e }));
        })
        .sort((a, b) => a.day - b.day);

    const selectedEvents = selectedDay ? (events[eventKey(selectedDay)] ?? []) : [];

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-1">Calendar</h1>
                <p className="text-gray-600">View deadlines, interviews, and important dates.</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Main Calendar */}
                <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">{MONTHS[viewMonth]} {viewYear}</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={goToToday} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                                Today
                            </button>
                            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center text-sm font-medium text-gray-600 py-2">{d}</div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* Leading empty cells */}
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}

                        {/* Day cells */}
                        {Array.from({ length: totalDays }, (_, i) => {
                            const date = i + 1;
                            const isToday = isCurrentMonth && date === today.getDate();
                            const isPast = isCurrentMonth && date < today.getDate();
                            const isSelected = selectedDay === date;
                            const dayEvents = events[eventKey(date)] ?? [];

                            return (
                                <button
                                    key={date}
                                    onClick={() => setSelectedDay(date)}
                                    className={`aspect-square border rounded-lg p-2 text-left transition-colors ${
                                        isSelected
                                            ? 'ring-2 ring-indigo-500 border-indigo-300 bg-indigo-50'
                                            : isToday
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : isPast
                                                    ? 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                                                    : 'bg-white hover:bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <div className="text-sm font-medium">{date}</div>
                                    {dayEvents.slice(0, 1).map((ev, idx) => (
                                        <div
                                            key={idx}
                                            className={`text-xs mt-1 px-1 py-0.5 rounded truncate ${isToday ? 'bg-indigo-500 text-white' : ev.color}`}
                                        >
                                            {ev.label}
                                        </div>
                                    ))}
                                    {dayEvents.length > 1 && (
                                        <div className="text-xs text-gray-400 mt-0.5">+{dayEvents.length - 1}</div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Selected day detail */}
                    {selectedDay && (
                        <div className="mt-6 border-t border-gray-100 pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-sm">
                                    {MONTHS[viewMonth]} {selectedDay}, {viewYear}
                                </h3>
                                <button
                                    onClick={() => setShowAddEvent(s => !s)}
                                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 px-2 py-1 bg-indigo-50 rounded-lg"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Event
                                </button>
                            </div>

                            {showAddEvent && (
                                <div className="flex gap-2 mb-3">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newEventLabel}
                                        onChange={e => setNewEventLabel(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') addEvent(); if (e.key === 'Escape') setShowAddEvent(false); }}
                                        placeholder="Event name..."
                                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <select
                                        value={newEventType}
                                        onChange={e => setNewEventType(e.target.value)}
                                        className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option>Deadline</option>
                                        <option>Interview</option>
                                        <option>Assessment</option>
                                        <option>Reminder</option>
                                    </select>
                                    <button onClick={addEvent} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Add</button>
                                </div>
                            )}

                            {selectedEvents.length === 0 ? (
                                <p className="text-sm text-gray-400">No events. Click "Add Event" to create one.</p>
                            ) : (
                                <div className="space-y-2">
                                    {selectedEvents.map((ev, idx) => (
                                        <div key={idx} className={`flex items-center justify-between px-3 py-2 rounded-lg ${ev.color}`}>
                                            <div>
                                                <div className="text-sm font-medium">{ev.label}</div>
                                                <div className="text-xs opacity-70">{ev.type}</div>
                                            </div>
                                            <button onClick={() => removeEvent(selectedDay, idx)} className="opacity-60 hover:opacity-100 ml-3">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-4">
                            {upcomingEvents.length > 0 ? 'Events This Month' : 'No Events This Month'}
                        </h3>
                        {upcomingEvents.length === 0 ? (
                            <p className="text-sm text-gray-400">Click a day on the calendar to add events.</p>
                        ) : (
                            <div className="space-y-3">
                                {upcomingEvents.map((event, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="text-sm font-medium w-8 flex-shrink-0 text-gray-500">{event.day}</div>
                                        <div className="flex-1">
                                            <div className="font-medium text-sm mb-1">{event.label}</div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-0.5 rounded ${event.color}`}>{event.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-3">Quick Links</h3>
                        <div className="space-y-2">
                            <Link to="/planner" className="flex items-center justify-between text-sm text-indigo-600 hover:underline py-1">
                                View Weekly Planner <ChevronRight className="w-4 h-4" />
                            </Link>
                            <Link to="/applications" className="flex items-center justify-between text-sm text-indigo-600 hover:underline py-1">
                                View Applications <ChevronRight className="w-4 h-4" />
                            </Link>
                            <Link to="/opportunities" className="flex items-center justify-between text-sm text-indigo-600 hover:underline py-1">
                                Browse Opportunities <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function loader() {
    return {};
}

export default function Calendar() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const events: Record<number, { label: string; color: string }> = {
        15: { label: 'ADB Deadline', color: 'bg-green-100 text-green-700' },
        20: { label: 'PETRONAS', color: 'bg-orange-100 text-orange-700' },
        24: { label: 'Google STEP', color: 'bg-red-100 text-red-700' },
        28: { label: 'Maybank', color: 'bg-blue-100 text-blue-700' },
        31: { label: 'Interview', color: 'bg-purple-100 text-purple-700' },
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-1">Calendar</h1>
                <p className="text-gray-600">View deadlines, interviews, and important dates.</p>
            </div>
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">May 2025</h2>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                            <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Today</button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {days.map((d) => <div key={d} className="text-center text-sm font-medium text-gray-600 py-2">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 35 }, (_, i) => {
                            const date = i - 1;
                            const isToday = date === 19;
                            const isPast = date < 19;
                            const event = events[date];
                            if (date < 1 || date > 31) return <div key={i} />;
                            return (
                                <div key={i} className={`aspect-square border rounded-lg p-2 ${isToday ? 'bg-indigo-600 text-white border-indigo-600' : isPast ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-gray-50'}`}>
                                    <div className="text-sm font-medium">{date}</div>
                                    {event && <div className={`text-xs mt-1 px-1 py-0.5 rounded truncate ${isToday ? 'bg-indigo-500 text-white' : event.color}`}>{event.label}</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-4">Upcoming Deadlines</h3>
                        <div className="space-y-3">
                            {[
                                { date: '15 May', title: 'ADB-Japan Scholarship', type: 'Application Deadline', color: 'bg-green-100 text-green-700', urgent: true },
                                { date: '20 May', title: 'PETRONAS Internship', type: 'Interview', color: 'bg-orange-100 text-orange-700' },
                                { date: '24 May', title: 'Google STEP', type: 'Application Deadline', color: 'bg-red-100 text-red-700', urgent: true },
                                { date: '28 May', title: 'Maybank YTP', type: 'Application Deadline', color: 'bg-blue-100 text-blue-700' },
                                { date: '31 May', title: 'Shell Graduate Programme', type: 'Assessment Test', color: 'bg-purple-100 text-purple-700' },
                            ].map((event) => (
                                <div key={event.title} className="flex items-start gap-3">
                                    <div className="text-sm font-medium w-16 flex-shrink-0">{event.date}</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm mb-1">{event.title}</div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded ${event.color}`}>{event.type}</span>
                                            {event.urgent && <span className="text-xs text-red-600 font-medium">Urgent</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
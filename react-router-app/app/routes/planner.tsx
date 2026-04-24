import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export function loader() {
    return {};
}

export default function Planner() {
    const tasks = [
        { time: '09:00', duration: '90min', title: 'Write Essay', subtitle: 'Petronas Digital Innovation Internship', type: 'apply-now' },
        { time: '10:30', duration: '45min', title: 'Upload CV & Documents', subtitle: 'UNDP Young Talent Programme', type: 'apply-now' },
        { time: '12:00', duration: '60min', title: 'Take Online Assessment', subtitle: 'Shell Graduate Programme', type: 'prepare-soon' },
        { time: '14:00', duration: '35min', title: 'Break', subtitle: '', type: 'break' },
        { time: '15:00', duration: '45min', title: 'Research & Shortlist', subtitle: 'Track Later opportunities', type: 'track-later' },
        { time: '16:00', duration: '75min', title: 'Write Motivation Letter', subtitle: 'Maybank Young Talent Programme', type: 'apply-now' },
        { time: '17:00', duration: '60min', title: 'Skill Prep (Python Basics)', subtitle: 'Skill building', type: 'prepare-soon' },
    ];

    const taskBg: Record<string, string> = {
        'apply-now': 'bg-green-50 border-green-200',
        'prepare-soon': 'bg-orange-50 border-orange-200',
        'track-later': 'bg-blue-50 border-blue-200',
        'break': 'bg-gray-50 border-gray-200',
    };

    const categories = [
        { title: 'Apply Now', count: 4, color: 'bg-green-50 border-green-200', effort: '6.5 hrs', roi: 'High ROI' },
        { title: 'Prepare Soon', count: 3, color: 'bg-orange-50 border-orange-200', effort: '4.0 hrs', roi: 'Medium ROI' },
        { title: 'Track Later', count: 2, color: 'bg-blue-50 border-blue-200', effort: '2.0 hrs', roi: 'Low effort' },
        { title: 'Skip for Now', count: 1, color: 'bg-gray-50 border-gray-200', effort: '0.5 hr', roi: 'Low ROI' },
    ];

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-1">Weekly Priority Planner</h1>
                <p className="text-gray-600">Your AI-generated action plan to maximize outcomes this week.</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <button className="p-1.5 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5" /></button>
                                <div className="text-lg font-semibold">19 - 25 May 2025 📅</div>
                                <button className="p-1.5 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5" /></button>
                                <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Today</button>
                            </div>
                            <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center gap-1">
                                <Sparkles className="w-4 h-4" /> Optimize My Plan
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-3 mb-6">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                <div key={day} className={`text-center border rounded-lg p-3 ${i === 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50'}`}>
                                    <div className="text-xs text-gray-600 mb-1">{day}</div>
                                    <div className={`text-lg font-semibold ${i === 0 ? 'text-indigo-600' : ''}`}>{19 + i}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-6">
                            {categories.map((cat) => (
                                <div key={cat.title} className={`${cat.color} border rounded-lg p-4`}>
                                    <div className="text-sm font-medium mb-1">{cat.title}</div>
                                    <div className="text-2xl font-semibold mb-2">{cat.count} tasks</div>
                                    <div className="text-xs text-gray-600">{cat.effort}</div>
                                    <div className="text-xs">{cat.roi}</div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-indigo-50 rounded-lg p-3 mb-6 flex items-center gap-2 text-sm">
                            <span>Total Estimated Time: 13.0 hrs</span>
                            <span className="text-green-600 ml-auto">Focus Score: 82%</span>
                        </div>

                        <div className="font-medium text-sm mb-3">Monday, 19 May</div>
                        <div className="space-y-3">
                            {tasks.map((task) => (
                                <div key={task.time} className={`${taskBg[task.type]} border rounded-lg p-4 flex gap-3`}>
                                    <div className="text-sm text-gray-600 w-12">{task.time}</div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{task.title}</div>
                                        {task.subtitle && <div className="text-xs text-gray-600">{task.subtitle}</div>}
                                    </div>
                                    <div className="text-xs text-gray-500">{task.duration}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-4">Why this plan?</h3>
                        <div className="space-y-3 text-sm text-gray-700">
                            {['Focus on high-ROI opportunities with strong fit and deadlines within your focus window.', 'Essay and assignments scheduled when your focus is highest.', 'Time set aside for skill-building and research to increase long-term success.'].map((reason) => (
                                <div key={reason} className="flex items-start gap-2">
                                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-green-600 rounded-full"></div></div>
                                    <span>{reason}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100 p-5">
                        <h3 className="font-semibold mb-3">Reallocate for better ROI</h3>
                        <div className="bg-white rounded-lg p-3 mb-3">
                            <div className="text-sm mb-2">Move "Skill Prep (Python Basics)" to Track Later</div>
                            <div className="text-xs text-gray-600">You have 3 higher-priority deadlines. This protects your peak hours today.</div>
                        </div>
                        <button className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700">Apply Change</button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-3">Focus Tip 💡</h3>
                        <div className="text-sm text-gray-700">Complete the essay early. Submitting 3-5 days before the deadline increases your chances by 18%.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
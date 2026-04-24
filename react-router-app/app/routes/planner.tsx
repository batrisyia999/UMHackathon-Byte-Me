import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Plus } from 'lucide-react';

export function loader() {
    return {};
}

export default function Planner() {
    const [weekOffset, setWeekOffset] = useState(0);
    const [activeDay, setActiveDay] = useState(0);
    const [tasks, setTasks] = useState([
        { time: '09:00', duration: '90min', title: 'Write Essay', subtitle: 'Petronas Digital Innovation Internship', type: 'apply-now', done: false },
        { time: '10:30', duration: '45min', title: 'Upload CV & Documents', subtitle: 'UNDP Young Talent Programme', type: 'apply-now', done: false },
        { time: '12:00', duration: '60min', title: 'Take Online Assessment', subtitle: 'Shell Graduate Programme', type: 'prepare-soon', done: false },
        { time: '14:00', duration: '35min', title: 'Break', subtitle: '', type: 'break', done: false },
        { time: '15:00', duration: '45min', title: 'Research & Shortlist', subtitle: 'Track Later opportunities', type: 'track-later', done: false },
        { time: '16:00', duration: '75min', title: 'Write Motivation Letter', subtitle: 'Maybank Young Talent Programme', type: 'apply-now', done: false },
        { time: '17:00', duration: '60min', title: 'Skill Prep (Python Basics)', subtitle: 'Skill building', type: 'prepare-soon', done: false },
    ]);
    const [applied, setApplied] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTask, setNewTask] = useState('');

    const baseDate = 19 + weekOffset * 7;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const month = weekOffset === 0 ? 'May 2025' : weekOffset === 1 ? 'Jun 2025' : 'Apr 2025';

    const taskBg: Record<string, string> = {
        'apply-now': 'bg-green-50 border-green-200',
        'prepare-soon': 'bg-orange-50 border-orange-200',
        'track-later': 'bg-blue-50 border-blue-200',
        'break': 'bg-gray-50 border-gray-200',
    };

    const categories = [
        { title: 'Apply Now', count: tasks.filter(t => t.type === 'apply-now').length, color: 'bg-green-50 border-green-200', effort: '6.5 hrs', roi: 'High ROI' },
        { title: 'Prepare Soon', count: tasks.filter(t => t.type === 'prepare-soon').length, color: 'bg-orange-50 border-orange-200', effort: '4.0 hrs', roi: 'Medium ROI' },
        { title: 'Track Later', count: tasks.filter(t => t.type === 'track-later').length, color: 'bg-blue-50 border-blue-200', effort: '2.0 hrs', roi: 'Low effort' },
        { title: 'Skip for Now', count: 1, color: 'bg-gray-50 border-gray-200', effort: '0.5 hr', roi: 'Low ROI' },
    ];

    const handleAddTask = () => {
        if (newTask.trim()) {
            setTasks(prev => [...prev, {
                time: '18:00',
                duration: '30min',
                title: newTask.trim(),
                subtitle: '',
                type: 'apply-now',
                done: false,
            }]);
            setNewTask('');
            setShowAddTask(false);
        }
    };

    const toggleTask = (idx: number) => {
        setTasks(prev => prev.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
    };

    const applyChange = () => {
        setTasks(prev => prev.filter(t => t.title !== 'Skill Prep (Python Basics)'));
        setApplied(true);
    };

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
                                <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 hover:bg-gray-100 rounded">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="text-lg font-semibold">{baseDate} - {baseDate + 6} {month} 📅</div>
                                <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 hover:bg-gray-100 rounded">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Today</button>
                            </div>
                            <button
                                onClick={() => setShowAddTask(s => !s)}
                                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add Task
                            </button>
                        </div>

                        {showAddTask && (
                            <div className="flex gap-2 mb-4">
                                <input
                                    autoFocus
                                    type="text"
                                    value={newTask}
                                    onChange={e => setNewTask(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); if (e.key === 'Escape') setShowAddTask(false); }}
                                    placeholder="Task title..."
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button onClick={handleAddTask} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Add</button>
                                <button onClick={() => setShowAddTask(false)} className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
                            </div>
                        )}

                        <div className="grid grid-cols-7 gap-3 mb-6">
                            {days.map((day, i) => (
                                <button
                                    key={day}
                                    onClick={() => setActiveDay(i)}
                                    className={`text-center border rounded-lg p-3 transition-colors ${activeDay === i ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 hover:bg-gray-100'}`}
                                >
                                    <div className="text-xs text-gray-600 mb-1">{day}</div>
                                    <div className={`text-lg font-semibold ${activeDay === i ? 'text-indigo-600' : ''}`}>{baseDate + i}</div>
                                </button>
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
                            <span>Total Estimated Time: {tasks.length * 1.5} hrs</span>
                            <span className="text-green-600 ml-auto">Focus Score: {tasks.filter(t => t.done).length > 0 ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) : 82}%</span>
                        </div>

                        <div className="font-medium text-sm mb-3">{days[activeDay]}, {baseDate + activeDay} {month}</div>
                        <div className="space-y-3">
                            {tasks.map((task, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => toggleTask(idx)}
                                    className={`${taskBg[task.type]} border rounded-lg p-4 flex gap-3 w-full text-left transition-opacity ${task.done ? 'opacity-50' : ''}`}
                                >
                                    <div className="text-sm text-gray-600 w-12">{task.time}</div>
                                    <div className="flex-1">
                                        <div className={`text-sm font-medium ${task.done ? 'line-through text-gray-400' : ''}`}>{task.title}</div>
                                        {task.subtitle && <div className="text-xs text-gray-600">{task.subtitle}</div>}
                                    </div>
                                    <div className="text-xs text-gray-500">{task.duration}</div>
                                    {task.done && <div className="text-xs text-green-600 font-medium">✓ Done</div>}
                                </button>
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
                        {applied ? (
                            <div className="w-full bg-green-600 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2">
                                ✓ Change Applied!
                            </div>
                        ) : (
                            <button onClick={applyChange} className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700">
                                Apply Change
                            </button>
                        )}
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
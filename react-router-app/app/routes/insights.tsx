import { useState } from 'react';
import { TrendingUp, Download, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

export function loader() {
    return {};
}

export default function Insights() {
    const [exported, setExported] = useState(false);
    const [activeTab, setActiveTab] = useState<'value' | 'time' | 'matches'>('value');

    const metrics = [
        { icon: '💰', title: 'Total Accessible Opportunity Value', value: 'RM 315,680', change: 28 },
        { icon: '⚠️', title: 'Value at Risk (Expiring Soon)', value: 'RM 47,260', change: 12, warning: true },
        { icon: '🎯', title: 'High-Priority Opportunities Identified', value: '48', change: 33 },
        { icon: '⏱️', title: 'Time Saved in Manual Searching', value: '68.4 hrs', change: 43 },
        { icon: '✅', title: 'Match to Student Goals %', value: '92%', change: 9 },
    ];

    const bottlenecks = [
        { title: 'Research Experience', match: 42 },
        { title: 'Technical Skills (Python)', match: 58 },
        { title: 'Leadership Experience', match: 61 },
        { title: 'Academic Publications', match: 82 },
    ];

    const bars = [120, 140, 165, 190, 210, 240, 280, 315];
    const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];

    const handleExport = () => {
        setExported(true);
        // Simulate file download via blob
        const content = `Insights Report\n\nTotal Value: RM 315,680\nTime Saved: 68.4 hrs\nMatches: 48\nGenerated: ${new Date().toLocaleDateString()}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'insights-report.txt';
        a.click();
        URL.revokeObjectURL(url);
        setTimeout(() => setExported(false), 3000);
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold mb-1">Insights & Economic Impact</h1>
                    <p className="text-gray-600">Your economic empowerment story — measured, tracked, and growing.</p>
                </div>
                <button
                    onClick={handleExport}
                    className={`px-4 py-2 border rounded-lg text-sm flex items-center gap-2 transition-colors ${exported ? 'border-green-300 bg-green-50 text-green-600' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                    <Download className="w-4 h-4" />
                    {exported ? '✓ Exported!' : 'Export Report'}
                </button>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-6">
                {metrics.map((m) => (
                    <div key={m.title} className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">{m.icon}</span>
                            <div className="text-xs text-gray-600 flex-1">{m.title}</div>
                        </div>
                        <div className={`text-2xl font-semibold mb-1 ${m.warning ? 'text-orange-600' : ''}`}>{m.value}</div>
                        <div className="flex items-center gap-1 text-xs">
                            <TrendingUp className={`w-3.5 h-3.5 ${m.warning ? 'text-orange-600' : 'text-green-600'}`} />
                            <span className={m.warning ? 'text-orange-600' : 'text-green-600'}>{m.change}%</span>
                            <span className="text-gray-500">vs last year</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold mb-4">Missed Value Tracker</h3>
                    <div className="text-xs text-gray-600 mb-1">Current Pipeline Value</div>
                    <div className="text-3xl font-semibold text-indigo-600 mb-4">RM 86,450</div>
                    <div className="bg-orange-50 rounded-lg p-4 mb-4">
                        <div className="text-sm text-gray-600 mb-1">Expiring Within 30 Days</div>
                        <div className="text-2xl font-semibold text-orange-600">RM 21,840</div>
                    </div>
                    <Link
                        to="/opportunities"
                        className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-indigo-700 flex items-center justify-center"
                    >
                        View at-risk opportunities
                    </Link>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold mb-4">Opportunity Categories (by Value)</h3>
                    <div className="relative w-48 h-48 mx-auto mb-4">
                        {(() => {
                            const categories = [
                                { color: '#6366f1', bgClass: 'bg-indigo-600', label: 'Scholarships', amount: 142560, percent: 45 },
                                { color: '#22c55e', bgClass: 'bg-green-500', label: 'Grants', amount: 104760, percent: 31 },
                                { color: '#f97316', bgClass: 'bg-orange-500', label: 'Internships', amount: 54120, percent: 17 },
                                { color: '#eab308', bgClass: 'bg-yellow-500', label: 'Competitions', amount: 22480, percent: 7 },
                            ];
                            const radius = 70;
                            const circumference = 2 * Math.PI * radius;
                            let accumulatedPercent = 0;

                            return (
                                <>
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                                        {categories.map((cat, i) => {
                                            const dashArray = `${(cat.percent / 100) * circumference} ${circumference}`;
                                            const dashOffset = -(accumulatedPercent / 100) * circumference;
                                            accumulatedPercent += cat.percent;
                                            return (
                                                <circle
                                                    key={i}
                                                    cx="96"
                                                    cy="96"
                                                    r={radius}
                                                    fill="none"
                                                    stroke={cat.color}
                                                    strokeWidth="32"
                                                    strokeDasharray={dashArray}
                                                    strokeDashoffset={dashOffset}
                                                    strokeLinecap="round"
                                                />
                                            );
                                        })}
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="text-l font-semibold">RM 315,680</div>
                                        <div className="text-xs text-gray-600">Total</div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                    <div className="space-y-2">
                        {[
                            { color: 'bg-indigo-600', label: 'Scholarships', value: 'RM 142,560 (45%)' },
                            { color: 'bg-green-500', label: 'Grants', value: 'RM 104,760 (31%)' },
                            { color: 'bg-orange-500', label: 'Internships', value: 'RM 54,120 (17%)' },
                            { color: 'bg-yellow-500', label: 'Competitions', value: 'RM 22,480 (7%)' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2"><div className={`w-3 h-3 ${item.color} rounded`}></div>{item.label}</div>
                                <span className="font-medium">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold mb-4">Deadline Urgency</h3>
                    <div className="space-y-2">
                        {[
                            { color: 'bg-red-500', label: 'Expiring in 0-7 days', value: '9 (19%)' },
                            { color: 'bg-orange-500', label: 'Expiring in 8-30 days', value: '15 (31%)' },
                            { color: 'bg-yellow-500', label: 'Expiring in 31-60 days', value: '12 (25%)' },
                            { color: 'bg-green-500', label: 'Expiring in 60+ days', value: '12 (25%)' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2"><div className={`w-3 h-3 ${item.color} rounded-full`}></div>{item.label}</div>
                                <span className="font-medium">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold mb-2">Readiness Bottlenecks</h3>
                    <p className="text-sm text-gray-600 mb-4">Top areas impacting your ability to win opportunities.</p>
                    <div className="space-y-3">
                        {bottlenecks.map((b) => (
                            <div key={b.title} className="flex items-center gap-3">
                                <div className="flex-1">
                                    <div className="text-sm font-medium mb-1">{b.title}</div>
                                    <div className="bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full ${b.match >= 70 ? 'bg-green-500' : b.match >= 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                                            style={{ width: `${b.match}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">{b.match}%</div>
                            </div>
                        ))}
                    </div>
                    <Link to="/readiness" className="mt-4 text-sm text-indigo-600 hover:underline block">
                        View full readiness tracker →
                    </Link>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Pipeline Growth Over Time</h3>
                        <div className="flex gap-1">
                            {(['value', 'time', 'matches'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-2 py-1 text-xs rounded transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {tab === 'value' ? 'Value' : tab === 'time' ? 'Time' : 'Matches'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-48 flex items-end gap-2 mb-4 pt-4">
                        {bars.map((value, i) => (
                            <div key={i} className="flex-1 h-full flex flex-col justify-end">
                                <div className="flex-1 flex items-end">
                                    <div
                                        className="w-full bg-indigo-100 rounded-t cursor-pointer hover:bg-indigo-200 transition-colors relative"
                                        style={{ height: `${(value / 320) * 100}%` }}
                                        title={`${months[i]}: RM ${value}k`}
                                    >
                                        <div className="absolute bottom-0 w-full bg-indigo-600 rounded-t" style={{ height: '70%' }}></div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-2 text-center h-4 flex-shrink-0">{months[i]}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold mb-4">Economic Impact Summary</h3>
                    <div className="space-y-4">
                        {[
                            { icon: '💰', label: 'Potential Funding Impact', value: 'RM 315,680', sub: 'Total accessible value', color: 'text-green-600' },
                            { icon: '⏱️', label: 'Time Efficiency Gain', value: '68.4 hrs', sub: 'Equivalent to 8.6 working days', color: 'text-blue-600' },
                            { icon: '📈', label: 'Future Earning Potential', value: 'High', sub: 'Based on skills & opportunities', color: 'text-purple-600' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-xl">{item.icon}</span></div>
                                <div>
                                    <div className="text-sm font-medium mb-1">{item.label}</div>
                                    <div className={`text-lg font-semibold ${item.color}`}>{item.value}</div>
                                    <div className="text-xs text-gray-600">{item.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-semibold">AI Insights</h3>
                    </div>
                    <div className="space-y-3">
                        {[
                            { label: 'Strong progress!', color: 'text-green-600', text: "You're building real momentum. Here's what the data reveals." },
                            { label: 'Expiring Value Alert', color: 'text-orange-600', text: 'RM 21,840 is expiring within 30 days. Take action on 14 opportunities.' },
                            { label: 'Category Insight', color: 'text-blue-600', text: 'Scholarships make up 45% of your pipeline. Consider diversifying.' },
                        ].map((item) => (
                            <div key={item.label} className="bg-white rounded-lg p-4">
                                <div className={`text-xs font-medium ${item.color} mb-1`}>{item.label}</div>
                                <div className="text-sm text-gray-900">{item.text}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold mb-4">Strategic Shift Recommendation</h3>
                    <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-2">Your current focus:</div>
                        <div className="bg-indigo-50 rounded-lg p-3 mb-3">
                            <div className="text-sm font-medium">60% on scholarships</div>
                            <div className="text-xs text-gray-600">High value, long deadlines</div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-2">AI suggests shifting to:</div>
                        <div className="bg-green-50 rounded-lg p-3">
                            <div className="text-sm font-medium">40% on high-impact industry internships</div>
                            <div className="text-xs text-gray-600">Build work experience faster.</div>
                        </div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 mb-4">
                        <div className="text-xs text-gray-700">This could unlock RM 194,000+ in additional opportunities.</div>
                    </div>
                    <Link
                        to="/opportunities?sort=internships"
                        className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-indigo-700 flex items-center justify-center"
                    >
                        Find top matches →
                    </Link>
                </div>
            </div>
        </div>
    );
}
import { TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';

export function loader() {
    return {};
}

export default function Pipeline() {
    const stages = [
        {
            title: 'Apply Now', count: 4, color: 'green',
            opportunities: [
                { name: 'Maybank Young Talent Programme 2025', deadline: '28 May 2025', value: 'RM 12,000/mo', fit: '87%', effort: 'Medium' },
                { name: 'Google STEP Internship (GAPAC) 2025', deadline: '24 May 2025', value: 'RM 9,500/mo', fit: '96%', effort: 'Medium' },
            ],
        },
        {
            title: 'Prepare Soon', count: 5, color: 'orange',
            opportunities: [
                { name: 'Shell Graduate Programme 1 2026', deadline: '30 Jun 2025', value: 'RM 10,000/mo', fit: '87%', effort: 'High' },
                { name: 'Microsoft Learn Student Ambassadors 2025', deadline: '15 Jun 2025', value: 'RM 3,500/mo', fit: '87%', effort: 'Medium' },
            ],
        },
        {
            title: 'Track Later', count: 6, color: 'blue',
            opportunities: [
                { name: 'Khazanah Global Scholarship 2026', deadline: '1 Sep 2026', value: 'Full Scholarship', fit: '87%', effort: 'High' },
                { name: 'ACM ICPC Asia Pacific Regional 2025', deadline: '15 Jun 2025', value: 'RM 2,000', fit: '87%', effort: 'Medium' },
            ],
        },
        {
            title: 'Skip for Now', count: 3, color: 'gray',
            opportunities: [
                { name: 'Random Hackathon Series 2025', deadline: '31 May 2025', value: 'RM 500', fit: '87%', effort: 'Low' },
            ],
        },
    ];

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-1">Opportunity Pipeline</h1>
                <p className="text-gray-600">Track and manage your opportunities through each stage.</p>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-6">
                {[
                    { label: 'Total Estimated Value', value: 'RM 86,450' },
                    { label: 'Opportunities', value: '24' },
                    { label: 'High Fit', value: '12' },
                    { label: 'Applications', value: '3' },
                    { label: 'Interviews', value: '2' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
                        <div className="text-2xl font-semibold">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span className="text-sm font-medium text-orange-900 flex-1">RM 19,450 in value is expiring within 30 days</span>
                <button className="text-sm text-orange-600 flex items-center gap-1">View at-risk <ChevronRight className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-4 gap-6">
                {stages.map((stage) => {
                    const bg = stage.color === 'green' ? 'bg-green-50 border-green-200' : stage.color === 'orange' ? 'bg-orange-50 border-orange-200' : stage.color === 'blue' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200';
                    return (
                        <div key={stage.title}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium">{stage.title}</span>
                                <span className="text-xs text-gray-500">{stage.count}</span>
                            </div>
                            <div className="space-y-3">
                                {stage.opportunities.map((opp) => (
                                    <div key={opp.name} className={`${bg} border rounded-lg p-4`}>
                                        <div className="text-xs font-medium mb-2 line-clamp-2">{opp.name}</div>
                                        <div className="space-y-1">
                                            {[['Deadline', opp.deadline], ['Value', opp.value], ['Fit Score', opp.fit]].map(([label, value]) => (
                                                <div key={label} className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-500">{label}</span>
                                                    <span className="font-medium">{value}</span>
                                                </div>
                                            ))}
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">Effort</span>
                                                <span className={`font-medium ${opp.effort === 'High' ? 'text-red-600' : opp.effort === 'Medium' ? 'text-orange-600' : 'text-green-600'}`}>{opp.effort}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="text-xs text-center text-indigo-600 py-2 hover:underline cursor-pointer">View all ({stage.count})</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
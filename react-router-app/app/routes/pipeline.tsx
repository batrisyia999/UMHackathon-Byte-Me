import { useState } from 'react';
import { TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

export function loader() {
    return {};
}

type Stage = 'apply-now' | 'prepare-soon' | 'track-later' | 'skip';

interface Opportunity {
    name: string;
    deadline: string;
    value: string;
    fit: string;
    effort: string;
    stage: Stage;
}

export default function Pipeline() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([
        { name: 'Maybank Young Talent Programme 2025', deadline: '28 May 2025', value: 'RM 12,000/mo', fit: '87%', effort: 'Medium', stage: 'apply-now' },
        { name: 'Google STEP Internship (GAPAC) 2025', deadline: '24 May 2025', value: 'RM 9,500/mo', fit: '96%', effort: 'Medium', stage: 'apply-now' },
        { name: 'Shell Graduate Programme 1 2026', deadline: '30 Jun 2025', value: 'RM 10,000/mo', fit: '87%', effort: 'High', stage: 'prepare-soon' },
        { name: 'Microsoft Learn Student Ambassadors 2025', deadline: '15 Jun 2025', value: 'RM 3,500/mo', fit: '87%', effort: 'Medium', stage: 'prepare-soon' },
        { name: 'Khazanah Global Scholarship 2026', deadline: '1 Sep 2026', value: 'Full Scholarship', fit: '87%', effort: 'High', stage: 'track-later' },
        { name: 'ACM ICPC Asia Pacific Regional 2025', deadline: '15 Jun 2025', value: 'RM 2,000', fit: '87%', effort: 'Medium', stage: 'track-later' },
        { name: 'Random Hackathon Series 2025', deadline: '31 May 2025', value: 'RM 500', fit: '87%', effort: 'Low', stage: 'skip' },
    ]);

    const stageOrder: Stage[] = ['apply-now', 'prepare-soon', 'track-later', 'skip'];

    const moveStage = (name: string, direction: 'forward' | 'back') => {
        setOpportunities(prev => prev.map(o => {
            if (o.name !== name) return o;
            const idx = stageOrder.indexOf(o.stage);
            const newIdx = direction === 'forward' ? Math.min(idx + 1, stageOrder.length - 1) : Math.max(idx - 1, 0);
            return { ...o, stage: stageOrder[newIdx] };
        }));
    };

    const stages = [
        { title: 'Apply Now', slug: 'apply-now' as Stage, color: 'green' },
        { title: 'Prepare Soon', slug: 'prepare-soon' as Stage, color: 'orange' },
        { title: 'Track Later', slug: 'track-later' as Stage, color: 'blue' },
        { title: 'Skip for Now', slug: 'skip' as Stage, color: 'gray' },
    ];

    const bgMap: Record<string, string> = {
        green: 'bg-green-50 border-green-200',
        orange: 'bg-orange-50 border-orange-200',
        blue: 'bg-blue-50 border-blue-200',
        gray: 'bg-gray-50 border-gray-200',
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-1">Opportunity Pipeline</h1>
                <p className="text-gray-600">Track and manage your opportunities through each stage.</p>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-6">
                {[
                    { label: 'Total Estimated Value', value: 'RM 86,450' },
                    { label: 'Opportunities', value: String(opportunities.length) },
                    { label: 'High Fit', value: String(opportunities.filter(o => parseInt(o.fit) >= 90).length) },
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
                <Link to="/opportunities" className="text-sm text-orange-600 flex items-center gap-1 hover:text-orange-700">
                    View at-risk <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-4 gap-6">
                {stages.map((stage) => {
                    const stageOpps = opportunities.filter(o => o.stage === stage.slug);
                    const bg = bgMap[stage.color];
                    return (
                        <div key={stage.title}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium">{stage.title}</span>
                                <span className="text-xs text-gray-500">{stageOpps.length}</span>
                            </div>
                            <div className="space-y-3">
                                {stageOpps.map((opp) => (
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
                                        <div className="flex gap-1 mt-3">
                                            {stageOrder.indexOf(opp.stage) > 0 && (
                                                <button
                                                    onClick={() => moveStage(opp.name, 'back')}
                                                    className="flex-1 text-xs py-1 border border-gray-300 rounded hover:bg-white"
                                                    title="Move back"
                                                >← Back</button>
                                            )}
                                            {stageOrder.indexOf(opp.stage) < stageOrder.length - 1 && (
                                                <button
                                                    onClick={() => moveStage(opp.name, 'forward')}
                                                    className="flex-1 text-xs py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                                    title="Move forward"
                                                >Move →</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {stageOpps.length === 0 && (
                                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-xs text-center text-gray-400">
                                        No items
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
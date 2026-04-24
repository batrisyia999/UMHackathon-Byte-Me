import { useState } from 'react';
import { Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router';

export function loader() {
    return {};
}

export default function Readiness() {
    const [modules, setModules] = useState([
        { title: 'CV / Resume', description: 'Showcase your skills and experience', completion: 80, impact: 'High', suggestions: 'Add 2 quantified achievements to boost impact', action: 'Improve Now', href: '/documents' },
        { title: 'Transcript', description: 'Academic performance & courses', completion: 100, impact: 'High', action: 'View', href: '/documents' },
        { title: 'Portfolio', description: 'Projects that demonstrate your skills', completion: 40, impact: 'High', suggestions: 'Add 2 more projects with outcomes', action: 'Upload Project', href: '/documents' },
        { title: 'LinkedIn', description: 'Professional presence & networking', completion: 60, impact: 'Medium', suggestions: 'Add a headline and 3 skills', action: 'Improve Now', href: '/network' },
        { title: 'Essay / Personal Statement', description: 'Your story, goals and motivation', completion: 30, impact: 'High', suggestions: 'Clarify your goals and motivation', action: 'Improve Now', href: '/documents' },
        { title: 'Referee', description: 'Recommendations from mentors', completion: 25, impact: 'Medium', suggestions: 'Add at least 1 academic or professional referee', action: 'Add Referee', href: '/network' },
        { title: 'Certificates', description: 'Certifications & achievements', completion: 50, impact: 'Medium', suggestions: 'Add relevant certifications to stand out', action: 'Upload Certificate', href: '/documents' },
        { title: 'Profile Completeness', description: 'Personal details & preferences', completion: 85, impact: 'High', suggestions: 'Add your location preference and career interests', action: 'Complete Now', href: '/profile' },
    ]);

    const [showFullPlan, setShowFullPlan] = useState(false);

    const overallScore = Math.round(modules.reduce((sum, m) => sum + m.completion, 0) / modules.length);

    return (
        <div className="p-6 max-w-[1400px] mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-semibold">Opportunity Readiness Tracker</h1>
                        <Info className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-gray-600">Strengthen your profile and unlock more opportunities.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm text-gray-600">Overall Readiness Score</div>
                        <div className="text-3xl font-semibold text-green-600">{overallScore}%</div>
                        <div className="text-sm text-green-600">{overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Work'}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-2">Your Readiness Modules</h2>
                        <p className="text-sm text-gray-600 mb-6">Complete and optimize the key assets that opportunities look for.</p>
                        <div className="space-y-4">
                            {modules.map((mod, idx) => {
                                const isHigh = mod.completion >= 70;
                                const isMedium = mod.completion >= 40 && mod.completion < 70;
                                const barColor = mod.completion === 100 ? 'bg-green-500' : isHigh ? 'bg-green-500' : isMedium ? 'bg-orange-500' : 'bg-red-500';
                                const valueColor = mod.completion === 100 ? 'text-green-600' : isHigh ? 'text-green-600' : isMedium ? 'text-orange-600' : 'text-red-600';
                                return (
                                    <div key={mod.title} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="text-sm font-medium">{mod.title}</div>
                                                    <span className={`text-xs px-2 py-0.5 rounded ${mod.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{mod.impact} Impact</span>
                                                </div>
                                                <div className="text-xs text-gray-600">{mod.description}</div>
                                            </div>
                                            <div className={`text-2xl font-semibold ${valueColor}`}>{mod.completion}%</div>
                                        </div>
                                        <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden mb-3">
                                            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${mod.completion}%` }}></div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-gray-500">Impact on Opportunities: <span className={mod.impact === 'High' ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>{mod.impact}</span></div>
                                            <Link to={mod.href} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline">{mod.action}</Link>
                                        </div>
                                        {mod.suggestions && mod.completion < 100 && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                                <div className="text-xs text-gray-700">{mod.suggestions}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6">
                        <div className="text-sm font-medium text-gray-900 mb-2">💡 Tip from AI: Completing your top 3 missing assets can increase your chance of shortlist by up to 2.4x</div>
                        <Link to="/ai-advisor?q=How+can+I+improve+my+readiness" className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline">See How →</Link>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-2">What is blocking your top opportunities</h3>
                        <p className="text-xs text-gray-600 mb-4">Missing assets reducing your match score.</p>
                        <div className="space-y-3">
                            {[
                                { name: 'PETRONAS Digital Innovation Internship 2025', color: 'border-red-500', impact: '18%', bg: 'bg-teal-500' },
                                { name: 'Maybank Young Talent Programme', color: 'border-orange-500', impact: '14%', bg: 'bg-yellow-500' },
                                { name: 'Shell Graduate Programme 2025', color: 'border-orange-500', impact: '11%', bg: 'bg-orange-500' },
                            ].map((item) => (
                                <div key={item.name} className={`border-l-4 ${item.color} pl-3`}>
                                    <div className="flex items-start gap-2 mb-1">
                                        <div className={`w-8 h-8 ${item.bg} rounded flex-shrink-0`}></div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{item.name}</div>
                                            <div className="text-xs text-gray-600">Missing Assets</div>
                                        </div>
                                        <div className="text-sm text-red-600">↓ {item.impact}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-2">AI Generated Checklist</h3>
                        <p className="text-xs text-gray-600 mb-4">Complete these to unlock more opportunities.</p>
                        <div className="space-y-2">
                            {['Improve your CV with quantified achievements', 'Add 2 projects to your portfolio', 'Complete your essay / personal statement', 'Add at least 1 referee', 'Add certifications relevant to your field'].map((item, i) => (
                                <div key={item} className="flex items-start gap-2">
                                    <div className="text-sm text-gray-500 w-4">{i + 1}</div>
                                    <div className="flex-1">
                                        <div className="text-sm">{item}</div>
                                        <div className={`text-xs ${i < 3 ? 'text-green-600' : 'text-orange-600'}`}>{i < 3 ? 'High Impact' : 'Medium Impact'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-3">Your next milestone</h3>
                        <div className="text-sm font-medium mb-2">Reach 80% readiness and get 3x more interviews</div>
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden mb-1">
                            <div className="bg-indigo-600 h-full transition-all" style={{ width: `${overallScore}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 mb-4"><span>{overallScore}%</span><span>80%</span></div>
                        <button
                            onClick={() => setShowFullPlan(p => !p)}
                            className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700"
                        >
                            {showFullPlan ? 'Hide Plan ↑' : 'View full plan'}
                        </button>
                        {showFullPlan && (
                            <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-xs text-gray-700 space-y-2">
                                <p className="font-medium text-indigo-700">Your 3-step plan to 80%:</p>
                                <p>1. Improve CV with quantified results (+5%)</p>
                                <p>2. Add 2 portfolio projects (+7%)</p>
                                <p>3. Complete your personal statement (+6%)</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
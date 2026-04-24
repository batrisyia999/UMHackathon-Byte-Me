import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, CheckCircle2, ExternalLink, Bookmark, BookmarkCheck, Share2, Calendar, MapPin, DollarSign, Users, Award, TrendingUp, Sparkles, FileText } from 'lucide-react';

export function loader() {
    return {};
}

export default function OpportunityDetail() {
    const [bookmarked, setBookmarked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [applied, setApplied] = useState(false);

    return (
        <div className="p-6 max-w-[1400px] mx-auto">
            <Link to="/opportunities" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to Opportunities
            </Link>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <img src="https://logo.clearbit.com/petronas.com" alt="PETRONAS" className="w-12 h-12 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">Top Pick for You</span>
                                </div>
                                <h1 className="text-2xl font-semibold mb-2">PETRONAS Digital Innovation Internship 2025</h1>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <span className="text-green-600">Verified</span>
                                    </div>
                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">Internship</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        navigator.clipboard?.writeText(window.location.href);
                                    }}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    title="Copy link"
                                >
                                    <Share2 className="w-5 h-5 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => setBookmarked(b => !b)}
                                    className={`p-2 border rounded-lg transition-colors ${bookmarked ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                    title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                                >
                                    {bookmarked
                                        ? <BookmarkCheck className="w-5 h-5 text-indigo-600" />
                                        : <Bookmark className="w-5 h-5 text-gray-600" />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="flex items-start gap-2">
                                <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
                                <div><div className="text-xs text-gray-500 mb-1">31 May 2025</div><div className="text-sm font-medium">Deadline</div></div>
                            </div>
                            <div className="flex items-start gap-2">
                                <DollarSign className="w-5 h-5 text-indigo-600 mt-0.5" />
                                <div><div className="text-xs text-gray-500 mb-1">RM 7,000 / month</div><div className="text-sm font-medium">Est. Value</div></div>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
                                <div><div className="text-xs text-gray-500 mb-1">Kuala Lumpur</div><div className="text-sm font-medium">Location</div></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-2">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                        <circle cx="48" cy="48" r="40" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="25.12" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-2xl font-semibold text-green-600">96%</div>
                                    </div>
                                </div>
                                <div className="text-xs font-medium">Fit Score</div>
                                <div className="text-xs text-green-600">Excellent</div>
                            </div>
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-2">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                        <circle cx="48" cy="48" r="40" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="50.24" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-2xl font-semibold text-green-600">82%</div>
                                    </div>
                                </div>
                                <div className="text-xs font-medium">Urgency Score</div>
                                <div className="text-xs text-green-600">High</div>
                            </div>
                            <div className="text-center">
                                <div className="bg-gray-100 rounded-lg p-4 mb-2">
                                    <div className="text-2xl font-semibold">RM 23,450</div>
                                </div>
                                <div className="text-xs font-medium">Economic Value</div>
                                <div className="text-xs text-green-600">High</div>
                            </div>
                            <div className="text-center">
                                <div className="bg-gray-100 rounded-lg p-4 mb-2">
                                    <div className="text-2xl font-semibold text-orange-600">Medium</div>
                                </div>
                                <div className="text-xs font-medium">Effort Level</div>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="font-semibold text-sm mb-1">Recommended Action: Apply Now</div>
                                    <div className="text-sm text-gray-700 mb-3">High fit and strong alignment. Deadline in 20 days — apply early to increase your chances.</div>
                                    {applied ? (
                                        <div className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium w-fit">
                                            <CheckCircle2 className="w-4 h-4" /> Application Started!
                                        </div>
                                    ) : (
                                        <button onClick={() => setApplied(true)} className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700">Start Application</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Reasoning Summary</h2>
                        <div className="space-y-3">
                            {[
                                'Strong match with your skills in Python, Data Analysis and Problem Solving.',
                                'High application success rate for your profile (Top 16%).',
                                'Aligns with your goal to gain industry experience.',
                                'You meet 81% of core requirements.',
                            ].map((reason) => (
                                <div key={reason} className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm font-medium text-gray-900">{reason}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Required Documents</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { name: 'Resume / CV', status: 'Required', action: 'Improve Now' },
                                { name: 'Academic Transcript', status: 'Required' },
                                { name: 'Portfolio / Project Links', status: 'Recommended', action: 'Upload Project' },
                                { name: 'Cover Letter', status: 'Recommended' },
                                { name: 'IC / Passport Copy', status: 'Optional' },
                                { name: 'English Proficiency', status: 'Optional' },
                            ].map((doc) => (
                                <div key={doc.name} className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-medium mb-1">{doc.name}</div>
                                        <div className={`text-xs mb-1 ${doc.status === 'Required' ? 'text-green-600' : doc.status === 'Recommended' ? 'text-orange-600' : 'text-gray-500'}`}>{doc.status}</div>
                                        {doc.action && (
                                            <Link to="/documents" className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline">{doc.action}</Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-4">Next Step Checklist</h3>
                        <div className="space-y-2 mb-4">
                            {[
                                { label: 'Review role and requirements', done: true },
                                { label: 'Prepare and tailor your resume', done: true },
                                { label: 'Complete application form', done: applied },
                                { label: 'Take online assessments', done: false },
                                { label: 'Attend virtual interview', done: false },
                                { label: 'Final interview', done: false },
                                { label: 'Offer & onboarding', done: false },
                            ].map((step, i) => (
                                <div key={step.label} className="flex items-center gap-2">
                                    {step.done
                                        ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        : <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex items-center justify-center text-xs">{i + 1}</div>
                                    }
                                    <span className="text-sm">{step.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-4">Competition Info</h3>
                        <div className="space-y-3 mb-4">
                            {[
                                { icon: <Users className="w-4 h-4 text-indigo-600" />, label: 'Estimated Applicants', value: '1,800+' },
                                { icon: <Award className="w-4 h-4 text-indigo-600" />, label: 'Selection Rate', value: '~6-8%' },
                                { icon: <TrendingUp className="w-4 h-4 text-indigo-600" />, label: 'Your Standing', value: 'Top 16%' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-2">
                                    {item.icon}
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-600">{item.label}</div>
                                        <div className="text-sm font-medium text-green-600">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-semibold">AI Copilot</h3>
                        </div>
                        <p className="text-sm text-gray-700 mb-4">Your readiness is Good (72%). Let's unlock more value together.</p>
                        <Link to="/ai-advisor" className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center">
                            Show me how
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <a
                                href="https://www.petronas.com/careers"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full text-left bg-indigo-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" /> Apply on Official Site
                            </a>
                            <button
                                onClick={() => setSaved(s => !s)}
                                className={`w-full text-left text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors ${saved ? 'border border-indigo-300 bg-indigo-50 text-indigo-600' : 'border border-gray-200 hover:bg-gray-50'}`}
                            >
                                {saved ? <BookmarkCheck className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                                {saved ? 'Saved!' : 'Save for Later'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
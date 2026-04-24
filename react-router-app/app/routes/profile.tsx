import { useState } from 'react';
import { Sparkles, CheckCircle2, Plus } from 'lucide-react';
import { MOCK_USER } from '../lib/mockData';

export function loader() {
    return {};
}

export default function Profile() {
    const user = MOCK_USER;
    const [saved, setSaved] = useState(false);
    const [timeAvailability, setTimeAvailability] = useState<string>(user.timeAvailability);
    const [readinessLevel, setReadinessLevel] = useState<string>(user.readinessLevel);
    const [interests, setInterests] = useState(user.interests);
    const [newInterest, setNewInterest] = useState('');
    const [showAddInterest, setShowAddInterest] = useState(false);

    const handleSaveDraft = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleAddInterest = () => {
        if (newInterest.trim() && !interests.includes(newInterest.trim())) {
            setInterests(prev => [...prev, newInterest.trim()]);
        }
        setNewInterest('');
        setShowAddInterest(false);
    };

    const removeInterest = (interest: string) => {
        setInterests(prev => prev.filter(i => i !== interest));
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-2">
                    Student Profile & Onboarding 👋
                </h1>
                <p className="text-gray-600">
                    Tell us about yourself so we can personalize your opportunities and
                    recommendations.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl">
                                    1
                                </div>
                                <div>
                                    <div className="font-semibold">Profile</div>
                                    <div className="text-sm text-gray-600">Tell us all about you</div>
                                </div>
                            </div>
                            <button
                                onClick={handleSaveDraft}
                                className={`px-4 py-2 text-sm border rounded-lg transition-colors ${saved ? 'border-green-300 bg-green-50 text-green-600' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                {saved ? '✓ Draft Saved' : 'Save Draft'}
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Course / Faculty
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option>{user.course}</option>
                                        <option>Computer Engineering</option>
                                        <option>Information Systems</option>
                                    </select>
                                    <div className="text-xs text-gray-600 mt-1">{user.faculty}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Current Year
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option>Year {user.year}</option>
                                        <option>Year 1</option>
                                        <option>Year 2</option>
                                        <option>Year 4</option>
                                    </select>
                                    <div className="text-xs text-gray-600 mt-1">{user.studyLevel}</div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">CGPA Range</label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        defaultValue={user.cgpaMin}
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="self-center">-</span>
                                    <input
                                        type="text"
                                        defaultValue={user.cgpaMax}
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Areas of Interest
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {interests.map((interest) => (
                                        <span
                                            key={interest}
                                            className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 group"
                                        >
                                            {interest}
                                            <button
                                                onClick={() => removeInterest(interest)}
                                                className="opacity-0 group-hover:opacity-100 ml-1 text-indigo-400 hover:text-indigo-700 text-xs leading-none"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                    {showAddInterest ? (
                                        <div className="flex items-center gap-1">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={newInterest}
                                                onChange={e => setNewInterest(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') handleAddInterest(); if (e.key === 'Escape') setShowAddInterest(false); }}
                                                placeholder="Type interest..."
                                                className="border border-gray-300 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36"
                                            />
                                            <button onClick={handleAddInterest} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full hover:bg-indigo-700">Add</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowAddInterest(true)}
                                            className="border border-gray-200 px-3 py-1.5 rounded-full text-sm hover:bg-gray-50 flex items-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Primary Goal (Select up to 2)
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Internship', 'Full-time Job', 'Scholarship', 'Research'].map(goal => (
                                        <label key={goal} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${goal === 'Internship' ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <input type="checkbox" className="w-4 h-4 accent-indigo-600" defaultChecked={goal === 'Internship'} />
                                            <span className="text-sm">{goal}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Time Availability (per week)
                                </label>
                                <div className="flex gap-3 flex-wrap">
                                    {['< 5 hrs', '5 - 10 hrs', '10 - 15 hrs', '15+ hrs'].map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => setTimeAvailability(option)}
                                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${option === timeAvailability
                                                ? 'bg-indigo-50 border border-indigo-200 text-indigo-600 font-medium'
                                                : 'border border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Readiness Level
                                </label>
                                <div className="flex gap-3 flex-wrap">
                                    {['Just Exploring', 'Actively Preparing', 'Ready to Apply'].map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => setReadinessLevel(option)}
                                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${option === readinessLevel
                                                ? 'bg-indigo-50 border border-indigo-200 text-indigo-600 font-medium'
                                                : 'border border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assets Section */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xl">
                                2
                            </div>
                            <div>
                                <div className="font-semibold">Assets</div>
                                <div className="text-sm text-gray-600">Upload & connect</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <AssetCard title="CV / Resume" status="Uploaded" filename="Aisha_Rahman_CV.pdf" />
                            <AssetCard title="Transcript" status="Uploaded" filename="UM_Transcript.pdf" />
                            <AssetCard title="Portfolio" status="Added" link="View Portfolio" />
                            <AssetCard title="LinkedIn" status="Connected" link="linkedin.com/in/aisharahman" />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-semibold">AI Profile Summary</h3>
                            <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded">
                                Beta
                            </span>
                        </div>
                        <div className="bg-white rounded-lg p-4 mb-4">
                            <div className="text-sm font-medium text-gray-900 mb-2">Match Quality</div>
                            <div className="text-3xl font-semibold text-green-600 mb-2">Good</div>
                            <div className="bg-green-50 rounded p-2">
                                <div className="text-xs text-green-700">72%</div>
                                <div className="text-xs text-gray-600 mt-1">
                                    Complete a few more steps to reach Excellent match quality.
                                </div>
                            </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-2">
                            You're best suited for
                        </div>
                        <div className="space-y-2">
                            {[
                                { label: 'Data Science Internships', match: 'High Match', color: 'text-green-600' },
                                { label: 'AI/ML Research Assistantships', match: 'High Match', color: 'text-green-600' },
                                { label: 'Software Engineering Internships', match: 'Medium Match', color: 'text-orange-600' },
                            ].map((item) => (
                                <div key={item.label} className="bg-white rounded-lg p-3">
                                    <div className="text-sm">{item.label}</div>
                                    <div className={`text-xs ${item.color}`}>{item.match}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-4">Improve your match quality</h3>
                        <div className="space-y-3">
                            {[
                                { tip: 'Add a portfolio link', sub: 'Profiles with portfolios get 2.5x more matches' },
                                { tip: 'Add more skills', sub: 'Adding skills improves matching' },
                                { tip: 'Upload certifications', sub: 'Show your achievements' },
                                { tip: 'Complete your interests', sub: 'Add more interests for better recommendations' },
                            ].map((item) => (
                                <div key={item.tip} className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm">{item.tip}</div>
                                        <div className="text-xs text-gray-600">{item.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-3">Profile Strength</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Completeness', value: 72, color: 'bg-green-500' },
                                { label: 'Assets', value: 80, color: 'bg-green-500' },
                                { label: 'Relevance', value: 65, color: 'bg-orange-500' },
                                { label: 'Engagement', value: 60, color: 'bg-orange-500' },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm">{item.label}</span>
                                        <span className="text-sm font-medium">{item.value}%</span>
                                    </div>
                                    <div className="bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`${item.color} h-2 rounded-full`}
                                            style={{ width: `${item.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSaveDraft}
                        className={`w-full text-sm font-medium py-2.5 rounded-lg transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                        {saved ? '✓ Profile Saved!' : 'Generate my opportunity strategy'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function AssetCard({
    title,
    status,
    filename,
    link,
}: {
    title: string;
    status: string;
    filename?: string;
    link?: string;
}) {
    const [isUpdating, setIsUpdating] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">{title}</div>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-xs text-green-600 mb-1">{status}</div>
            {filename && <div className="text-xs text-gray-600">{filename}</div>}
            {link && (
                <div className="text-xs text-indigo-600 hover:text-indigo-700 cursor-pointer hover:underline">
                    {link}
                </div>
            )}
            <div className="mt-3 flex gap-2">
                <label className="text-xs text-indigo-600 hover:text-indigo-700 cursor-pointer">
                    {isUpdating ? 'Uploading...' : 'Update'}
                    <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setIsUpdating(true);
                                setTimeout(() => setIsUpdating(false), 1500);
                            }
                        }}
                    />
                </label>
                {!link && (
                    <button
                        onClick={() => { if (confirm(`Disconnect ${title}?`)) {} }}
                        className="text-xs text-gray-600 hover:text-gray-900"
                    >
                        Disconnect
                    </button>
                )}
            </div>
        </div>
    );
}
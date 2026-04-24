import { Users, MessageCircle, UserPlus, TrendingUp, Award } from 'lucide-react';

export function loader() {
    return {};
}

export default function Network() {
    const connections = [
        { name: 'Dr. Sarah Ahmad', role: 'Senior Data Scientist', company: 'PETRONAS', type: 'Mentor', date: '3 months ago', mutual: 5, expertise: ['Data Science', 'Machine Learning', 'Career Guidance'] },
        { name: 'Ahmad Zaki', role: 'Software Engineer', company: 'Google Singapore', type: 'Alumni', date: '6 months ago', mutual: 12, expertise: ['Software Engineering', 'Interview Prep', 'Internships'] },
        { name: 'Nurul Huda', role: 'ML Research Assistant', company: 'University of Malaya', type: 'Peer', date: '1 month ago', mutual: 8, expertise: ['Research', 'AI/ML', 'Scholarships'] },
        { name: 'David Tan', role: 'Graduate Programme Manager', company: 'Shell Malaysia', type: 'Mentor', date: '2 weeks ago', mutual: 3, expertise: ['Oil & Gas', 'Graduate Programmes', 'Career Development'] },
    ];

    const typeColors: Record<string, string> = {
        Mentor: 'bg-purple-100 text-purple-700',
        Alumni: 'bg-green-100 text-green-700',
        Peer: 'bg-blue-100 text-blue-700',
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold mb-1">Network</h1>
                    <p className="text-gray-600">Connect with mentors, alumni, and peers.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Find Connections
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[{ label: 'Total Connections', value: '47', icon: <Users className="w-5 h-5 text-indigo-600" /> }, { label: 'Mentors', value: '5', icon: <Award className="w-5 h-5 text-purple-600" /> }, { label: 'Alumni', value: '18', icon: <TrendingUp className="w-5 h-5 text-green-600" /> }, { label: 'Active Chats', value: '8', icon: <MessageCircle className="w-5 h-5 text-blue-600" /> }].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center gap-3 mb-2">{s.icon}<div className="text-xs text-gray-500">{s.label}</div></div>
                        <div className="text-2xl font-semibold">{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="flex gap-3 mb-6">
                {['All Connections', 'Mentors', 'Alumni', 'Peers', 'Suggested'].map((tab, i) => (
                    <button key={tab} className={`px-4 py-2 text-sm rounded-lg ${i === 0 ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{tab}</button>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                    {connections.map((c) => (
                        <div key={c.name} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4 mb-4">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} alt={c.name} className="w-16 h-16 rounded-full" />
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold text-lg">{c.name}</h3>
                                            <p className="text-sm text-gray-600">{c.role} • {c.company}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded ${typeColors[c.type]}`}>{c.type}</span>
                                    </div>
                                    <div className="text-xs text-gray-500">Connected {c.date} • {c.mutual} mutual connections</div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {c.expertise.map((skill) => <span key={skill} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{skill}</span>)}
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> Message</button>
                                <button className="px-4 py-2 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50">View Profile</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-4">Suggested Connections</h3>
                        <div className="space-y-4">
                            {[{ name: 'Prof. Lim Wei', role: 'CS Faculty', company: 'University of Malaya', mutual: 15 }, { name: 'Jennifer Lee', role: 'HR Manager', company: 'Maybank', mutual: 4 }, { name: 'Rajesh Kumar', role: 'Data Analyst', company: 'ADB', mutual: 9 }].map((s) => (
                                <div key={s.name} className="flex items-start gap-3">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} alt={s.name} className="w-12 h-12 rounded-full" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm">{s.name}</div>
                                        <div className="text-xs text-gray-600">{s.role} • {s.company}</div>
                                        <div className="text-xs text-gray-500 mt-1">{s.mutual} mutual</div>
                                        <button className="mt-2 px-3 py-1 text-xs text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50">Connect</button>
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
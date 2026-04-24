import { useState } from 'react';
import { Users, MessageCircle, UserPlus, TrendingUp, Award } from 'lucide-react';

export function loader() {
    return {};
}

export default function Network() {
    const [activeTab, setActiveTab] = useState('All Connections');
    const [connections, setConnections] = useState([
        { name: 'Dr. Sarah Ahmad', role: 'Senior Data Scientist', company: 'PETRONAS', type: 'Mentor', date: '3 months ago', mutual: 5, expertise: ['Data Science', 'Machine Learning', 'Career Guidance'], messaging: false, message: '' },
        { name: 'Ahmad Zaki', role: 'Software Engineer', company: 'Google Singapore', type: 'Alumni', date: '6 months ago', mutual: 12, expertise: ['Software Engineering', 'Interview Prep', 'Internships'], messaging: false, message: '' },
        { name: 'Nurul Huda', role: 'ML Research Assistant', company: 'University of Malaya', type: 'Peer', date: '1 month ago', mutual: 8, expertise: ['Research', 'AI/ML', 'Scholarships'], messaging: false, message: '' },
        { name: 'David Tan', role: 'Graduate Programme Manager', company: 'Shell Malaysia', type: 'Mentor', date: '2 weeks ago', mutual: 3, expertise: ['Oil & Gas', 'Graduate Programmes', 'Career Development'], messaging: false, message: '' },
    ]);

    const [suggested, setSuggested] = useState([
        { name: 'Prof. Lim Wei', role: 'CS Faculty', company: 'University of Malaya', mutual: 15, connected: false },
        { name: 'Jennifer Lee', role: 'HR Manager', company: 'Maybank', mutual: 4, connected: false },
        { name: 'Rajesh Kumar', role: 'Data Analyst', company: 'ADB', mutual: 9, connected: false },
    ]);

    const typeColors: Record<string, string> = {
        Mentor: 'bg-purple-100 text-purple-700',
        Alumni: 'bg-green-100 text-green-700',
        Peer: 'bg-blue-100 text-blue-700',
    };

    const toggleMessaging = (name: string) => {
        setConnections(prev => prev.map(c => c.name === name ? { ...c, messaging: !c.messaging } : c));
    };

    const sendMessage = (name: string) => {
        setConnections(prev => prev.map(c => c.name === name ? { ...c, messaging: false, message: '' } : c));
    };

    const handleConnect = (name: string) => {
        setSuggested(prev => prev.map(s => s.name === name ? { ...s, connected: true } : s));
    };

    const filteredConnections = activeTab === 'All Connections'
        ? connections
        : connections.filter(c => c.type === activeTab.replace(/s$/, ''));

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold mb-1">Network</h1>
                    <p className="text-gray-600">Connect with mentors, alumni, and peers.</p>
                </div>
                <button
                    onClick={() => setActiveTab('Suggested')}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" /> Find Connections
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Connections', value: String(connections.length + suggested.filter(s => s.connected).length + 43), icon: <Users className="w-5 h-5 text-indigo-600" /> },
                    { label: 'Mentors', value: '5', icon: <Award className="w-5 h-5 text-purple-600" /> },
                    { label: 'Alumni', value: '18', icon: <TrendingUp className="w-5 h-5 text-green-600" /> },
                    { label: 'Active Chats', value: String(connections.filter(c => c.messaging).length), icon: <MessageCircle className="w-5 h-5 text-blue-600" /> },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center gap-3 mb-2">{s.icon}<div className="text-xs text-gray-500">{s.label}</div></div>
                        <div className="text-2xl font-semibold">{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="flex gap-3 mb-6">
                {['All Connections', 'Mentors', 'Alumni', 'Peers', 'Suggested'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                    {activeTab === 'Suggested' ? (
                        suggested.map((s) => (
                            <div key={s.name} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} alt={s.name} className="w-14 h-14 rounded-full" />
                                <div className="flex-1">
                                    <div className="font-semibold">{s.name}</div>
                                    <div className="text-sm text-gray-600">{s.role} • {s.company}</div>
                                    <div className="text-xs text-gray-500 mt-1">{s.mutual} mutual connections</div>
                                </div>
                                <button
                                    onClick={() => handleConnect(s.name)}
                                    disabled={s.connected}
                                    className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors ${s.connected ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                >
                                    <UserPlus className="w-4 h-4" />
                                    {s.connected ? 'Connected!' : 'Connect'}
                                </button>
                            </div>
                        ))
                    ) : (
                        filteredConnections.map((c) => (
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
                                {c.messaging ? (
                                    <div className="flex gap-2">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={c.message}
                                            onChange={e => setConnections(prev => prev.map(conn => conn.name === c.name ? { ...conn, message: e.target.value } : conn))}
                                            onKeyDown={e => { if (e.key === 'Enter') sendMessage(c.name); if (e.key === 'Escape') toggleMessaging(c.name); }}
                                            placeholder={`Message ${c.name.split(' ')[0]}...`}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <button onClick={() => sendMessage(c.name)} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Send</button>
                                        <button onClick={() => toggleMessaging(c.name)} className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={() => toggleMessaging(c.name)} className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
                                            <MessageCircle className="w-4 h-4" /> Message
                                        </button>
                                        <button className="px-4 py-2 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50">View Profile</button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-4">Suggested Connections</h3>
                        <div className="space-y-4">
                            {suggested.map((s) => (
                                <div key={s.name} className="flex items-start gap-3">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} alt={s.name} className="w-12 h-12 rounded-full" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm">{s.name}</div>
                                        <div className="text-xs text-gray-600">{s.role} • {s.company}</div>
                                        <div className="text-xs text-gray-500 mt-1">{s.mutual} mutual</div>
                                        <button
                                            onClick={() => handleConnect(s.name)}
                                            disabled={s.connected}
                                            className={`mt-2 px-3 py-1 text-xs border rounded transition-colors ${s.connected ? 'bg-green-50 text-green-600 border-green-200' : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}
                                        >
                                            {s.connected ? 'Connected!' : 'Connect'}
                                        </button>
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
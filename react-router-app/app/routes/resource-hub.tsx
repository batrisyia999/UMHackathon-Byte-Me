import { useState } from 'react';
import { BookOpen, Video, FileText, Download, Search, Star, Check } from 'lucide-react';
import { Link } from 'react-router';

export function loader() {
    return {};
}

export default function ResourceHub() {
    const [activeCategory, setActiveCategory] = useState('All Resources');
    const [searchQuery, setSearchQuery] = useState('');
    const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
    const [registered, setRegistered] = useState<Set<string>>(new Set());

    const resources = [
        { title: 'Complete CV Writing Guide', type: 'guide', description: 'Learn how to write a compelling CV', duration: '15 min read', rating: 4.8, downloads: 1234 },
        { title: 'Scholarship Application Masterclass', type: 'video', description: 'Step-by-step video guide on winning scholarships', duration: '45 min', rating: 4.9, downloads: 892 },
        { title: 'Interview Preparation Checklist', type: 'template', description: 'Comprehensive checklist for any interview', duration: '5 min read', rating: 4.7, downloads: 567 },
        { title: 'How to Build a Data Science Portfolio', type: 'guide', description: 'Learn what to include to stand out', duration: '20 min read', rating: 4.6, downloads: 423 },
        { title: 'Personal Statement Template', type: 'template', description: 'Proven template for personal statements', duration: '10 min read', rating: 4.9, downloads: 789 },
        { title: 'Resume Templates (ATS-Friendly)', type: 'template', description: '5 professional resume templates', duration: '5 min read', rating: 4.9, downloads: 2341 },
    ];

    const typeIcons: Record<string, React.ReactNode> = {
        guide: <BookOpen className="w-5 h-5 text-indigo-600" />,
        video: <Video className="w-5 h-5 text-purple-600" />,
        template: <FileText className="w-5 h-5 text-green-600" />,
    };

    const categoryMap: Record<string, string | null> = {
        'All Resources': null,
        'Guides': 'guide',
        'Templates': 'template',
        'Videos': 'video',
        'Webinars': 'webinar',
    };

    const filtered = resources.filter(r => {
        const matchCat = !categoryMap[activeCategory] || r.type === categoryMap[activeCategory];
        const matchSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    const handleDownload = (title: string) => {
        setDownloaded(prev => {
            const next = new Set(prev);
            next.add(title);
            return next;
        });
    };

    const handleRegister = (title: string) => {
        setRegistered(prev => {
            const next = new Set(prev);
            next.add(title);
            return next;
        });
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold mb-1">Resource Hub</h1>
                    <p className="text-gray-600">Access guides, templates, and resources to help you succeed.</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search resources..."
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="flex gap-3 mb-6">
                {['All Resources', 'Guides', 'Templates', 'Videos', 'Webinars'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                    {filtered.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
                            No resources found for "{searchQuery}"
                        </div>
                    ) : filtered.map((r) => (
                        <div key={r.title} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                {typeIcons[r.type]}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-1">{r.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">{r.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />{r.rating}</div>
                                    <div className="flex items-center gap-1"><Download className="w-3.5 h-3.5" />{(downloaded.has(r.title) ? r.downloads + 1 : r.downloads).toLocaleString()}</div>
                                    <div>{r.duration}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDownload(r.title)}
                                className={`px-4 py-2 text-sm border rounded-lg flex items-center gap-2 flex-shrink-0 transition-colors ${downloaded.has(r.title) ? 'border-green-200 bg-green-50 text-green-600' : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}
                            >
                                {downloaded.has(r.title) ? <><Check className="w-4 h-4" /> Downloaded</> : <><Download className="w-4 h-4" /> Download</>}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5">
                        <h3 className="font-semibold mb-3">Need help? 🤔</h3>
                        <p className="text-sm text-gray-700 mb-4">Can't find what you're looking for? Our AI Advisor can help.</p>
                        <Link to="/ai-advisor?q=Help+me+find+resources+for+my+applications" className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center">
                            Ask AI Advisor
                        </Link>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-4">Upcoming Webinars</h3>
                        <div className="space-y-3">
                            {[
                                { title: 'Mastering Technical Interviews', date: '25 May 2025', time: '2:00 PM' },
                                { title: 'Scholarship Application Tips', date: '28 May 2025', time: '3:00 PM' },
                                { title: 'Building Your Personal Brand', date: '2 Jun 2025', time: '4:00 PM' },
                            ].map((w) => (
                                <div key={w.title} className="border-l-4 border-indigo-600 pl-3">
                                    <div className="font-medium text-sm">{w.title}</div>
                                    <div className="text-xs text-gray-600">{w.date} • {w.time}</div>
                                    <button
                                        onClick={() => handleRegister(w.title)}
                                        className={`mt-1 text-xs transition-colors ${registered.has(w.title) ? 'text-green-600 font-medium' : 'text-indigo-600 hover:underline'}`}
                                    >
                                        {registered.has(w.title) ? '✓ Registered!' : 'Register'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
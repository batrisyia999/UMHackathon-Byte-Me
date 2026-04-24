import { Upload, FileText, CheckCircle2, AlertCircle, Download, Eye, Trash2, Edit3 } from 'lucide-react';

export function loader() {
    return {};
}

export default function Documents() {
    const docs = [
        { title: 'Aisha_Rahman_CV.pdf', category: 'CV / Resume', size: '245 KB', uploadDate: '10 May 2025', status: 'ready', usedIn: 3 },
        { title: 'Academic_Transcript.pdf', category: 'Academic', size: '1.2 MB', uploadDate: '5 May 2025', status: 'ready', usedIn: 5 },
        { title: 'Cover_Letter_PETRONAS.pdf', category: 'CV / Resume', size: '156 KB', uploadDate: '8 May 2025', status: 'ready', usedIn: 1 },
        { title: 'Portfolio_Projects.pdf', category: 'Personal', size: '3.4 MB', uploadDate: '1 May 2025', status: 'needs-update', usedIn: 2 },
        { title: 'Recommendation_Letter_1.pdf', category: 'Academic', size: '890 KB', uploadDate: '15 Apr 2025', status: 'ready', usedIn: 1 },
        { title: 'English_Proficiency_Certificate.pdf', category: 'Certifications', size: '567 KB', uploadDate: '20 Apr 2025', status: 'needs-update', usedIn: 3 },
        { title: 'Personal_Statement.pdf', category: 'Personal', size: '234 KB', uploadDate: '12 May 2025', status: 'ready', usedIn: 2 },
        { title: 'IC_Passport_Copy.pdf', category: 'Personal', size: '1.1 MB', uploadDate: '3 May 2025', status: 'ready', usedIn: 4 },
        { title: 'Python_Certification.pdf', category: 'Certifications', size: '445 KB', uploadDate: 'Not uploaded', status: 'missing', usedIn: 0 },
    ];

    const statusConfig: Record<string, { bg: string; border: string; text: string; label: string }> = {
        ready: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'Ready' },
        'needs-update': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: 'Needs Update' },
        missing: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Missing' },
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold mb-1">Documents</h1>
                    <p className="text-gray-600">Manage and organize your application documents.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Upload Document
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[{ label: 'Total Documents', value: '12' }, { label: 'Ready to Use', value: '8' }, { label: 'Needs Update', value: '3' }, { label: 'Missing', value: '1' }].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="text-xs text-gray-500 mb-2">{s.label}</div>
                        <div className="text-2xl font-semibold">{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="flex gap-3 mb-6">
                {['All Documents', 'CV / Resume', 'Academic', 'Certifications', 'Personal', 'Others'].map((cat, i) => (
                    <button key={cat} className={`px-4 py-2 text-sm rounded-lg ${i === 0 ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{cat}</button>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
                {docs.map((doc) => {
                    const config = statusConfig[doc.status];
                    return (
                        <div key={doc.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm mb-1 truncate">{doc.title}</h3>
                                    <p className="text-xs text-gray-600">{doc.category}</p>
                                </div>
                            </div>
                            <div className="space-y-2 mb-4">
                                {[['Size', doc.size], ['Uploaded', doc.uploadDate], ['Used in', `${doc.usedIn} applications`]].map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">{label}</span>
                                        <span className="font-medium">{value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className={`flex items-center gap-2 mb-4 ${config.bg} ${config.border} border px-3 py-2 rounded-lg ${config.text}`}>
                                {doc.status === 'ready' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                <span className="text-xs font-medium">{config.label}</span>
                            </div>
                            {doc.status !== 'missing' ? (
                                <div className="flex gap-2">
                                    <button className="flex-1 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-1"><Eye className="w-4 h-4" /> View</button>
                                    <button className="flex-1 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-1"><Download className="w-4 h-4" /> Download</button>
                                    <button className="p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                                    <button className="p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <button className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
                                    <Upload className="w-4 h-4" /> Upload Document
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
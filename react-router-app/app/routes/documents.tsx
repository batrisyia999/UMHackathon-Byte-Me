import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Download, Eye, Trash2, Edit3, X, Check } from 'lucide-react';

export function loader() {
    return {};
}

interface Doc {
    title: string;
    category: string;
    size: string;
    uploadDate: string;
    status: 'ready' | 'needs-update' | 'missing';
    usedIn: number;
}

export default function Documents() {
    const [activeCategory, setActiveCategory] = useState('All Documents');
    const [docs, setDocs] = useState<Doc[]>([
        { title: 'Aisha_Rahman_CV.pdf', category: 'CV / Resume', size: '245 KB', uploadDate: '10 May 2025', status: 'ready', usedIn: 3 },
        { title: 'Academic_Transcript.pdf', category: 'Academic', size: '1.2 MB', uploadDate: '5 May 2025', status: 'ready', usedIn: 5 },
        { title: 'Cover_Letter_PETRONAS.pdf', category: 'CV / Resume', size: '156 KB', uploadDate: '8 May 2025', status: 'ready', usedIn: 1 },
        { title: 'Portfolio_Projects.pdf', category: 'Personal', size: '3.4 MB', uploadDate: '1 May 2025', status: 'needs-update', usedIn: 2 },
        { title: 'Recommendation_Letter_1.pdf', category: 'Academic', size: '890 KB', uploadDate: '15 Apr 2025', status: 'ready', usedIn: 1 },
        { title: 'English_Proficiency_Certificate.pdf', category: 'Certifications', size: '567 KB', uploadDate: '20 Apr 2025', status: 'needs-update', usedIn: 3 },
        { title: 'Personal_Statement.pdf', category: 'Personal', size: '234 KB', uploadDate: '12 May 2025', status: 'ready', usedIn: 2 },
        { title: 'IC_Passport_Copy.pdf', category: 'Personal', size: '1.1 MB', uploadDate: '3 May 2025', status: 'ready', usedIn: 4 },
        { title: 'Python_Certification.pdf', category: 'Certifications', size: '445 KB', uploadDate: 'Not uploaded', status: 'missing', usedIn: 0 },
    ]);

    const [editingTitle, setEditingTitle] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
    const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadForMissingRef = useRef<{ title: string } | null>(null);

    const statusConfig: Record<string, { bg: string; border: string; text: string; label: string }> = {
        ready: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'Ready' },
        'needs-update': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: 'Needs Update' },
        missing: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Missing' },
    };

    const categories = ['All Documents', 'CV / Resume', 'Academic', 'Certifications', 'Personal', 'Others'];
    const filtered = activeCategory === 'All Documents'
        ? docs
        : activeCategory === 'Others'
            ? docs.filter(d => !['CV / Resume', 'Academic', 'Certifications', 'Personal'].includes(d.category))
            : docs.filter(d => d.category === activeCategory);

    const handleDelete = (title: string) => {
        if (confirm(`Delete "${title}"?`)) {
            setDocs(prev => prev.filter(d => d.title !== title));
        }
    };

    const handleDownload = (title: string) => {
        setDownloaded(prev => new Set([...prev, title]));
        // Simulate file download
        const blob = new Blob([`Simulated content of ${title}`], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = title;
        a.click();
        URL.revokeObjectURL(url);
    };

    const startEdit = (doc: Doc) => {
        setEditingTitle(doc.title);
        setEditValue(doc.title);
    };

    const saveEdit = () => {
        if (!editingTitle || !editValue.trim()) return;
        setDocs(prev => prev.map(d => d.title === editingTitle ? { ...d, title: editValue.trim() } : d));
        setEditingTitle(null);
    };

    const handleFileUpload = (files: FileList | null, targetTitle?: string) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        const sizeMB = file.size / (1024 * 1024);
        const sizeStr = sizeMB >= 1 ? `${sizeMB.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
        const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        if (targetTitle) {
            // Replace/upload for existing doc
            setDocs(prev => prev.map(d =>
                d.title === targetTitle
                    ? { ...d, title: file.name, size: sizeStr, uploadDate: today, status: 'ready' }
                    : d
            ));
        } else {
            // New upload
            const newDoc: Doc = {
                title: file.name,
                category: 'Personal',
                size: sizeStr,
                uploadDate: today,
                status: 'ready',
                usedIn: 0,
            };
            setDocs(prev => [...prev, newDoc]);
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            {/* Preview modal */}
            {previewDoc && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8" onClick={() => setPreviewDoc(null)}>
                    <div className="bg-white rounded-xl p-8 max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">{previewDoc.title}</h3>
                            <button onClick={() => setPreviewDoc(null)}><X className="w-5 h-5 text-gray-500 hover:text-gray-900" /></button>
                        </div>
                        <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center border border-gray-200 mb-4">
                            <div className="text-center text-gray-400">
                                <FileText className="w-16 h-16 mx-auto mb-2 text-indigo-200" />
                                <p className="text-sm">Preview not available in demo mode</p>
                                <p className="text-xs mt-1">{previewDoc.size} • {previewDoc.uploadDate}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDownload(previewDoc.title)}
                                className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" /> Download
                            </button>
                            <button onClick={() => setPreviewDoc(null)} className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold mb-1">Documents</h1>
                    <p className="text-gray-600">Manage and organize your application documents.</p>
                </div>
                <label className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" /> Upload Document
                    <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.png,.jpg"
                        onChange={e => handleFileUpload(e.target.files)}
                    />
                </label>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Documents', value: docs.length },
                    { label: 'Ready to Use', value: docs.filter(d => d.status === 'ready').length },
                    { label: 'Needs Update', value: docs.filter(d => d.status === 'needs-update').length },
                    { label: 'Missing', value: docs.filter(d => d.status === 'missing').length },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="text-xs text-gray-500 mb-2">{s.label}</div>
                        <div className="text-2xl font-semibold">{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="flex gap-3 mb-6">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                    No documents in this category.
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {filtered.map((doc) => {
                        const config = statusConfig[doc.status];
                        const isEditing = editingTitle === doc.title;
                        const isDownloaded = downloaded.has(doc.title);

                        return (
                            <div key={doc.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {isEditing ? (
                                            <div className="flex gap-1">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={editValue}
                                                    onChange={e => setEditValue(e.target.value)}
                                                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingTitle(null); }}
                                                    className="flex-1 text-sm px-2 py-1 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <button onClick={saveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setEditingTitle(null)} className="p-1 text-gray-400 hover:bg-gray-50 rounded">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <h3 className="font-medium text-sm mb-1 truncate">{doc.title}</h3>
                                        )}
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
                                    {doc.status === 'ready'
                                        ? <CheckCircle2 className="w-4 h-4" />
                                        : <AlertCircle className="w-4 h-4" />}
                                    <span className="text-xs font-medium">{config.label}</span>
                                </div>

                                {doc.status !== 'missing' ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPreviewDoc(doc)}
                                            className="flex-1 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-1"
                                        >
                                            <Eye className="w-4 h-4" /> View
                                        </button>
                                        <button
                                            onClick={() => handleDownload(doc.title)}
                                            className={`flex-1 p-2 text-sm rounded-lg flex items-center justify-center gap-1 transition-colors ${isDownloaded ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {isDownloaded ? <><Check className="w-4 h-4" /> Done</> : <><Download className="w-4 h-4" /> Download</>}
                                        </button>
                                        <button
                                            onClick={() => startEdit(doc)}
                                            className="p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                                            title="Rename"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.title)}
                                            className="p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 cursor-pointer">
                                        <Upload className="w-4 h-4" /> Upload Document
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                            onChange={e => handleFileUpload(e.target.files, doc.title)}
                                        />
                                    </label>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
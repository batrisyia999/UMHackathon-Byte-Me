import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export function loader() {
    return {};
}

export default function Applications() {
    const applications = [
        { title: 'PETRONAS Digital Innovation Internship 2025', company: 'PETRONAS', status: 'submitted', submittedDate: '10 May 2025', deadline: '31 May 2025', stage: 'Application Review', progress: 60 },
        { title: 'Google STEP Internship (GAPAC) 2025', company: 'Google', status: 'in-progress', submittedDate: 'Not submitted', deadline: '24 May 2025', stage: 'Completing Application', progress: 75 },
        { title: 'ADB-Japan Scholarship Program 2025', company: 'Asian Development Bank', status: 'under-review', submittedDate: '5 May 2025', deadline: '15 May 2025', stage: 'Document Verification', progress: 100 },
        { title: 'Maybank Young Talent Programme 2025', company: 'Maybank', status: 'accepted', submittedDate: '1 May 2025', deadline: '28 May 2025', stage: 'Interview Scheduled', progress: 100, interviewDate: '20 May 2025' },
        { title: 'Shell Graduate Programme 2026', company: 'Shell', status: 'in-progress', submittedDate: 'Not submitted', deadline: '30 Jun 2025', stage: 'Preparing Documents', progress: 40 },
        { title: 'Khazanah Global Scholarship 2026', company: 'Khazanah', status: 'rejected', submittedDate: '15 Apr 2025', deadline: '1 Sep 2026', stage: 'Application Rejected', progress: 100 },
    ];

    const statusConfig: Record<string, { bg: string; border: string; text: string; label: string }> = {
        'in-progress': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: 'In Progress' },
        'submitted': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', label: 'Submitted' },
        'under-review': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', label: 'Under Review' },
        'accepted': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'Accepted' },
        'rejected': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Rejected' },
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-1">Applications</h1>
                <p className="text-gray-600">Track your submitted applications and their status.</p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { title: 'Total Applications', value: '8' },
                    { title: 'In Progress', value: '3' },
                    { title: 'Under Review', value: '2' },
                    { title: 'Accepted', value: '1' },
                ].map((stat) => (
                    <div key={stat.title} className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="text-xs text-gray-500 mb-2">{stat.title}</div>
                        <div className="text-2xl font-semibold">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3 mb-6">
                {['All', 'In Progress', 'Submitted', 'Under Review', 'Accepted', 'Rejected'].map((filter, i) => (
                    <button key={filter} className={`px-4 py-2 text-sm rounded-lg ${i === 0 ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{filter}</button>
                ))}
            </div>

            <div className="space-y-4">
                {applications.map((app) => {
                    const config = statusConfig[app.status];
                    return (
                        <div key={app.title} className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">{app.title}</h3>
                                    <p className="text-sm text-gray-600">by {app.company}</p>
                                </div>
                                <div className={`flex items-center gap-2 ${config.bg} ${config.border} border px-3 py-1.5 rounded-full ${config.text}`}>
                                    <span className="text-xs font-medium">{config.label}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                <div><div className="text-xs text-gray-500 mb-1">Submitted</div><div className="text-sm font-medium">{app.submittedDate}</div></div>
                                <div><div className="text-xs text-gray-500 mb-1">Deadline</div><div className="text-sm font-medium">{app.deadline}</div></div>
                                <div><div className="text-xs text-gray-500 mb-1">Current Stage</div><div className="text-sm font-medium">{app.stage}</div></div>
                                {app.interviewDate && <div><div className="text-xs text-gray-500 mb-1">Interview</div><div className="text-sm font-medium text-green-600">{app.interviewDate}</div></div>}
                            </div>
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-600">Application Progress</span>
                                    <span className="text-xs font-medium">{app.progress}%</span>
                                </div>
                                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div className={`h-full rounded-full ${app.status === 'rejected' ? 'bg-red-500' : app.status === 'accepted' ? 'bg-green-500' : 'bg-indigo-600'}`} style={{ width: `${app.progress}%` }}></div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg">View Details</button>
                                {app.status === 'in-progress' && <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Continue Application</button>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
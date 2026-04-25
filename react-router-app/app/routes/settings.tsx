import { useState } from 'react';
import { User, Bell, Lock, Globe, Sparkles, CreditCard, Shield, HelpCircle, LogOut, ChevronRight, Mail, ExternalLink, Download, Trash2 } from 'lucide-react';

export function loader() {
    return {};
}

export default function Settings() {
    const [activeNav, setActiveNav] = useState('Account');

    const navItems = [
        { icon: <User className="w-5 h-5" />, label: 'Account' },
        { icon: <Bell className="w-5 h-5" />, label: 'Notifications' },
        { icon: <Lock className="w-5 h-5" />, label: 'Privacy & Security' },
        { icon: <Sparkles className="w-5 h-5" />, label: 'AI Preferences' },
        { icon: <Globe className="w-5 h-5" />, label: 'Language & Region' },
        { icon: <CreditCard className="w-5 h-5" />, label: 'Subscription' },
        { icon: <Shield className="w-5 h-5" />, label: 'Data & Privacy' },
        { icon: <HelpCircle className="w-5 h-5" />, label: 'Help & Support' },
    ];

    const [toggles, setToggles] = useState([
        { title: 'Email Notifications', description: 'Receive email updates about new opportunities', enabled: true },
        { title: 'Push Notifications', description: 'Get push notifications for important updates', enabled: true },
        { title: 'Weekly Digest', description: 'Receive a weekly summary of your opportunities', enabled: true },
        { title: 'AI Recommendations', description: 'Get AI-powered opportunity recommendations', enabled: true },
        { title: 'Marketing Emails', description: 'Receive updates about new features and tips', enabled: false },
    ]);

    const [aiSettings, setAiSettings] = useState({
        proactiveSuggestions: true,
        contextAwareness: 'High',
        responseStyle: 'Detailed',
        dataUsageForTraining: false
    });

    const [regionSettings, setRegionSettings] = useState({
        language: 'English (US)',
        timezone: '(GMT+08:00) Kuala Lumpur',
        dateFormat: 'DD/MM/YYYY'
    });

    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'Public',
        showUniversity: true,
        analyticsEnabled: true,
        thirdPartySharing: false
    });

    const [formValues, setFormValues] = useState({
        fullName: 'Aisha Rahman',
        email: 'aisha.rahman@um.edu.my',
        phone: '+60 12-345 6789',
        university: 'University of Malaya',
    });

    const [saved, setSaved] = useState(false);

    const handleToggle = (index: number) => {
        const newToggles = [...toggles];
        newToggles[index] = { ...newToggles[index], enabled: !newToggles[index].enabled };
        setToggles(newToggles);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-1">Settings</h1>
                <p className="text-gray-600">Manage your account settings and preferences.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setActiveNav(item.label)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeNav === item.label ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {item.icon}<span>{item.label}</span>
                        </button>
                    ))}
                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <button
                            onClick={() => { if (confirm('Are you sure you want to sign out?')) window.location.href = '/login'; }}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium px-4 py-3 bg-red-50/50 rounded-lg hover:bg-red-50 transition-colors w-full"
                        >
                            <LogOut className="w-5 h-5" /><span>Sign Out</span>
                        </button>
                    </div>
                </div>

                <div className="md:col-span-3 space-y-6">
                    {/* Account Section */}
                    {activeNav === 'Account' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4">Account Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { label: 'Full Name', key: 'fullName', type: 'text' },
                                        { label: 'Email Address', key: 'email', type: 'email' },
                                        { label: 'Phone Number', key: 'phone', type: 'tel' },
                                        { label: 'University', key: 'university', type: 'text' },
                                    ].map((field) => (
                                        <div key={field.label}>
                                            <label className="block text-sm font-medium mb-1.5 text-gray-700">{field.label}</label>
                                            <input
                                                type={field.type}
                                                value={formValues[field.key as keyof typeof formValues]}
                                                onChange={(e) => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleSave}
                                        className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-indigo-200'}`}
                                    >
                                        {saved ? '✓ Saved!' : 'Save Changes'}
                                    </button>
                                    <button
                                        onClick={() => setFormValues({ fullName: 'Aisha Rahman', email: 'aisha.rahman@um.edu.my', phone: '+60 12-345 6789', university: 'University of Malaya' })}
                                        className="px-6 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha" alt="Profile" className="w-24 h-24 rounded-full border-2 border-indigo-50 shadow-inner" />
                                        <div className="absolute bottom-0 right-0 p-1 bg-white rounded-full border border-gray-200 shadow-sm">
                                            <User className="w-4 h-4 text-indigo-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 mb-2 cursor-pointer transition-colors">
                                            Upload New Photo
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) alert(`Selected: ${e.target.files[0].name}`); }} />
                                        </label>
                                        <p className="text-xs text-gray-500">JPG, PNG or GIF. Recommended size 400x400px. Max size 2MB.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Section */}
                    {activeNav === 'Notifications' && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
                            <div className="space-y-1">
                                {toggles.map((t, index) => (
                                    <div key={t.title} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 -mx-2 rounded-lg transition-colors">
                                        <div>
                                            <div className="font-medium text-sm text-gray-900">{t.title}</div>
                                            <div className="text-xs text-gray-500">{t.description}</div>
                                        </div>
                                        <button
                                            onClick={() => handleToggle(index)}
                                            className={`relative w-11 h-6 rounded-full transition-all duration-200 ${t.enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                        >
                                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${t.enabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Privacy & Security Section */}
                    {activeNav === 'Privacy & Security' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div>
                                            <div className="text-sm font-medium">Password</div>
                                            <div className="text-xs text-gray-500">Last changed 3 months ago</div>
                                        </div>
                                        <button className="px-4 py-2 text-sm bg-white border border-gray-200 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 shadow-sm transition-colors">
                                            Change Password
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div>
                                            <div className="text-sm font-medium">Two-Factor Authentication</div>
                                            <div className="text-xs text-gray-500">Add an extra layer of security to your account</div>
                                        </div>
                                        <button className="px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                                            Enable 2FA
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-red-100 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                        <div>
                                            <div className="font-medium text-sm">Deactivate Account</div>
                                            <div className="text-xs text-gray-500">Temporarily hide your profile and data</div>
                                        </div>
                                        <button onClick={() => { if (confirm('Are you sure you want to deactivate your account?')) alert('Account deactivated.'); }} className="px-4 py-2 text-sm border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 font-medium">Deactivate</button>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <div>
                                            <div className="font-medium text-sm">Delete Account</div>
                                            <div className="text-xs text-gray-500 text-red-400">Permanently remove all your data</div>
                                        </div>
                                        <button onClick={() => { if (confirm('This action is permanent. Delete your account?')) alert('Account deletion requested.'); }} className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium">Delete Permanently</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Preferences Section */}
                    {activeNav === 'AI Preferences' && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-600" /> AI Personalization
                            </h2>
                            <p className="text-sm text-gray-500 mb-6">Customize how the AI Advisor interacts with you and uses your data.</p>
                            
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-sm">Proactive Suggestions</div>
                                        <div className="text-xs text-gray-500">Allow AI to suggest opportunities based on your activity</div>
                                    </div>
                                    <button 
                                        onClick={() => setAiSettings(s => ({...s, proactiveSuggestions: !s.proactiveSuggestions}))}
                                        className={`relative w-11 h-6 rounded-full transition-all ${aiSettings.proactiveSuggestions ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${aiSettings.proactiveSuggestions ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Context Awareness</label>
                                        <select 
                                            value={aiSettings.contextAwareness}
                                            onChange={(e) => setAiSettings(s => ({...s, contextAwareness: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        >
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                        </select>
                                        <p className="text-[10px] text-gray-400 mt-1">Controls how much of your profile data the AI accesses for responses.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Response Style</label>
                                        <select 
                                            value={aiSettings.responseStyle}
                                            onChange={(e) => setAiSettings(s => ({...s, responseStyle: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        >
                                            <option>Concise</option>
                                            <option>Detailed</option>
                                            <option>Technical</option>
                                            <option>Conversational</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                                    <div className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-indigo-600 mt-0.5" />
                                        <div>
                                            <div className="text-sm font-medium text-indigo-900">AI Training Data</div>
                                            <p className="text-xs text-indigo-700/80 mb-3">Help us improve by allowing anonymous usage of your AI interactions for model training.</p>
                                            <button 
                                                onClick={() => setAiSettings(s => ({...s, dataUsageForTraining: !s.dataUsageForTraining}))}
                                                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${aiSettings.dataUsageForTraining ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-200'}`}
                                            >
                                                {aiSettings.dataUsageForTraining ? 'Enabled' : 'Disabled'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Language & Region Section */}
                    {activeNav === 'Language & Region' && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-lg font-semibold mb-6">Language & Region</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Display Language</label>
                                    <select 
                                        value={regionSettings.language}
                                        onChange={(e) => setRegionSettings(s => ({...s, language: e.target.value}))}
                                        className="w-full md:w-1/2 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option>English (US)</option>
                                        <option>English (UK)</option>
                                        <option>Bahasa Melayu</option>
                                        <option>Mandarin (Simplified)</option>
                                        <option>Tamil</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Time Zone</label>
                                    <select 
                                        value={regionSettings.timezone}
                                        onChange={(e) => setRegionSettings(s => ({...s, timezone: e.target.value}))}
                                        className="w-full md:w-2/3 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option>(GMT+08:00) Kuala Lumpur, Singapore</option>
                                        <option>(GMT+00:00) London</option>
                                        <option>(GMT-05:00) New York</option>
                                        <option>(GMT+09:00) Tokyo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Date Format</label>
                                    <div className="flex gap-4">
                                        {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map(format => (
                                            <button 
                                                key={format}
                                                onClick={() => setRegionSettings(s => ({...s, dateFormat: format}))}
                                                className={`px-4 py-2 text-sm rounded-lg border transition-all ${regionSettings.dateFormat === format ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                            >
                                                {format}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Subscription Section */}
                    {activeNav === 'Subscription' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-100 overflow-hidden relative">
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <span className="px-2 py-1 bg-white/20 rounded text-[10px] uppercase font-bold tracking-wider mb-2 inline-block">Current Plan</span>
                                            <h2 className="text-2xl font-bold">Pro Scholar Plan</h2>
                                            <p className="text-indigo-100 text-sm">Valid until May 25, 2026</p>
                                        </div>
                                        <Sparkles className="w-10 h-10 text-white/20" />
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div className="text-3xl font-bold">RM 19.90<span className="text-sm font-normal text-indigo-100">/mo</span></div>
                                        <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors shadow-sm">Manage Billing</button>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="font-semibold">Plan Benefits</h3>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        'Unlimited AI Advisor queries',
                                        'Priority opportunity matching',
                                        'Custom application templates',
                                        'Document analysis & optimization',
                                        'Early access to scholarship news',
                                        'Advanced analytics dashboard'
                                    ].map(benefit => (
                                        <div key={benefit} className="flex items-center gap-3 text-sm text-gray-600">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                            {benefit}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="font-semibold">Recent Transactions</h3>
                                </div>
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                                        <tr>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Invoice</th>
                                            <th className="px-6 py-3">Amount</th>
                                            <th className="px-6 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {[
                                            { date: 'Apr 25, 2026', id: '#INV-2026-004', amount: 'RM 19.90', status: 'Paid' },
                                            { date: 'Mar 25, 2026', id: '#INV-2026-003', amount: 'RM 19.90', status: 'Paid' },
                                            { date: 'Feb 25, 2026', id: '#INV-2026-002', amount: 'RM 19.90', status: 'Paid' },
                                        ].map(invoice => (
                                            <tr key={invoice.id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4">{invoice.date}</td>
                                                <td className="px-6 py-4 font-medium text-indigo-600">{invoice.id}</td>
                                                <td className="px-6 py-4">{invoice.amount}</td>
                                                <td className="px-6 py-4"><span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase">Paid</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Data & Privacy Section */}
                    {activeNav === 'Data & Privacy' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold mb-6">Privacy Controls</h2>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-sm">Profile Visibility</div>
                                            <div className="text-xs text-gray-500">Who can see your profile and applications</div>
                                        </div>
                                        <select 
                                            value={privacySettings.profileVisibility}
                                            onChange={(e) => setPrivacySettings(s => ({...s, profileVisibility: e.target.value}))}
                                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50"
                                        >
                                            <option>Public</option>
                                            <option>Only Recruiters</option>
                                            <option>Private</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-sm">Show University Affiliation</div>
                                            <div className="text-xs text-gray-500">Display your current university on your profile</div>
                                        </div>
                                        <button 
                                            onClick={() => setPrivacySettings(s => ({...s, showUniversity: !s.showUniversity}))}
                                            className={`relative w-11 h-6 rounded-full transition-all ${privacySettings.showUniversity ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                        >
                                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${privacySettings.showUniversity ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-sm">Third-party Data Sharing</div>
                                            <div className="text-xs text-gray-500">Allow sharing of anonymous data with partner organizations</div>
                                        </div>
                                        <button 
                                            onClick={() => setPrivacySettings(s => ({...s, thirdPartySharing: !s.thirdPartySharing}))}
                                            className={`relative w-11 h-6 rounded-full transition-all ${privacySettings.thirdPartySharing ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                        >
                                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${privacySettings.thirdPartySharing ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4">Your Data</h2>
                                <p className="text-sm text-gray-500 mb-6">Manage how your data is handled and stored in our systems.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => alert('Your data export will be emailed to you shortly.')}
                                        className="flex items-center justify-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all group"
                                    >
                                        <Download className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                                        <div className="text-left">
                                            <div className="text-sm font-semibold">Export All Data</div>
                                            <div className="text-[10px] text-gray-400">Download a JSON copy of your data</div>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => confirm('Clear your search and AI history?')}
                                        className="flex items-center justify-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-100 transition-all group"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                                        <div className="text-left">
                                            <div className="text-sm font-semibold text-red-600">Clear History</div>
                                            <div className="text-[10px] text-red-400">Remove searches and chat history</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Help & Support Section */}
                    {activeNav === 'Help & Support' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold text-sm mb-1">Email Us</h3>
                                    <p className="text-xs text-gray-500 mb-4">Response within 24h</p>
                                    <a href="mailto:support@byte-me.ai" className="text-indigo-600 text-sm font-medium hover:underline">support@byte-me.ai</a>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                        <ExternalLink className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold text-sm mb-1">Knowledge Base</h3>
                                    <p className="text-xs text-gray-500 mb-4">Guides and tutorials</p>
                                    <button className="text-indigo-600 text-sm font-medium hover:underline">Visit Help Center</button>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold text-sm mb-1">Community</h3>
                                    <p className="text-xs text-gray-500 mb-4">Join the discussion</p>
                                    <button className="text-indigo-600 text-sm font-medium hover:underline">Join Discord</button>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold mb-6">Send Feedback</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700">What's on your mind?</label>
                                        <textarea 
                                            rows={4}
                                            placeholder="Tell us about your experience or report a bug..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                                        ></textarea>
                                    </div>
                                    <button 
                                        onClick={() => { alert('Thank you for your feedback!'); }}
                                        className="w-full md:w-auto px-8 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-md"
                                    >
                                        Submit Feedback
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Frequently Asked Questions</h3>
                                <div className="space-y-3">
                                    {[
                                        'How do I cancel my subscription?',
                                        'Can I export my application history?',
                                        'How does the AI Advisor match me to opportunities?',
                                        'Is my data safe with Byte Me?'
                                    ].map(q => (
                                        <button key={q} className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors group">
                                            <span className="text-sm text-gray-700 font-medium">{q}</span>
                                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
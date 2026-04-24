import { useState } from 'react';
import { User, Bell, Lock, Globe, Sparkles, CreditCard, Shield, HelpCircle, LogOut } from 'lucide-react';

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
        <div className="p-6 max-w-[1400px] mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-1">Settings</h1>
                <p className="text-gray-600">Manage your account settings and preferences.</p>
            </div>
            <div className="grid grid-cols-4 gap-6">
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setActiveNav(item.label)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${activeNav === item.label ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {item.icon}<span>{item.label}</span>
                        </button>
                    ))}
                </div>
                <div className="col-span-3 space-y-6">
                    {activeNav === 'Account' && (
                        <>
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold mb-4">Account Information</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Full Name', key: 'fullName', type: 'text' },
                                        { label: 'Email Address', key: 'email', type: 'email' },
                                        { label: 'Phone Number', key: 'phone', type: 'tel' },
                                        { label: 'University', key: 'university', type: 'text' },
                                    ].map((field) => (
                                        <div key={field.label}>
                                            <label className="block text-sm font-medium mb-2">{field.label}</label>
                                            <input
                                                type={field.type}
                                                value={formValues[field.key as keyof typeof formValues]}
                                                onChange={(e) => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleSave}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                    >
                                        {saved ? '✓ Saved!' : 'Save Changes'}
                                    </button>
                                    <button
                                        onClick={() => setFormValues({ fullName: 'Aisha Rahman', email: 'aisha.rahman@um.edu.my', phone: '+60 12-345 6789', university: 'University of Malaya' })}
                                        className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
                                <div className="flex items-center gap-6">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha" alt="Profile" className="w-24 h-24 rounded-full" />
                                    <div>
                                        <label className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 mb-2 block cursor-pointer text-center">
                                            Upload New Photo
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) alert(`Selected: ${e.target.files[0].name}`); }} />
                                        </label>
                                        <p className="text-xs text-gray-600">JPG, PNG or GIF. Max size 2MB.</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeNav === 'Notifications' && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
                            <div className="space-y-4">
                                {toggles.map((t, index) => (
                                    <div key={t.title} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                        <div>
                                            <div className="font-medium text-sm mb-1">{t.title}</div>
                                            <div className="text-sm text-gray-600">{t.description}</div>
                                        </div>
                                        <button
                                            onClick={() => handleToggle(index)}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${t.enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                        >
                                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${t.enabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeNav === 'Privacy & Security' && (
                        <>
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
                                <p className="text-sm text-gray-600 mb-4">Manage your password and security preferences.</p>
                                <button className="px-4 py-2 text-sm bg-indigo-50 text-indigo-600 font-medium rounded-lg hover:bg-indigo-100">
                                    Change Password
                                </button>
                            </div>
                            <div className="bg-white rounded-xl border border-red-200 p-6">
                                <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Deactivate Account', action: 'Deactivate', style: 'text-orange-600 border-orange-200', onClick: () => { if (confirm('Are you sure you want to deactivate your account?')) alert('Account deactivated.'); } },
                                        { label: 'Delete Account', action: 'Delete Account', style: 'text-red-600 border-red-200', onClick: () => { if (confirm('This action is permanent. Delete your account?')) alert('Account deletion requested.'); } },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                                            <div className="font-medium text-sm">{item.label}</div>
                                            <button onClick={item.onClick} className={`px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 ${item.style}`}>{item.action}</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {['AI Preferences', 'Language & Region', 'Subscription', 'Data & Privacy', 'Help & Support'].includes(activeNav) && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center py-12">
                            <h2 className="text-lg font-semibold mb-2">{activeNav}</h2>
                            <p className="text-gray-500">Settings for {activeNav.toLowerCase()} are coming soon.</p>
                        </div>
                    )}

                    {activeNav === 'Data & Privacy' && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                            <h2 className="text-lg font-semibold mb-4">Data Management</h2>
                            <div className="flex items-center justify-between pb-4">
                                <div className="font-medium text-sm">Export Your Data</div>
                                <button onClick={() => alert('Your data export will be emailed to you shortly.')} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">Export Data</button>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <button
                            onClick={() => { if (confirm('Are you sure you want to sign out?')) window.location.href = '/login'; }}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium px-4 py-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors w-fit"
                        >
                            <LogOut className="w-5 h-5" /><span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
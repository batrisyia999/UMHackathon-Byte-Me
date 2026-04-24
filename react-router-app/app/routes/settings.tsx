import { User, Bell, Lock, Globe, Sparkles, CreditCard, Shield, HelpCircle, LogOut } from 'lucide-react';

export function loader() {
    return {};
}

export default function Settings() {
    const navItems = [
        { icon: <User className="w-5 h-5" />, label: 'Account', active: true },
        { icon: <Bell className="w-5 h-5" />, label: 'Notifications' },
        { icon: <Lock className="w-5 h-5" />, label: 'Privacy & Security' },
        { icon: <Sparkles className="w-5 h-5" />, label: 'AI Preferences' },
        { icon: <Globe className="w-5 h-5" />, label: 'Language & Region' },
        { icon: <CreditCard className="w-5 h-5" />, label: 'Subscription' },
        { icon: <Shield className="w-5 h-5" />, label: 'Data & Privacy' },
        { icon: <HelpCircle className="w-5 h-5" />, label: 'Help & Support' },
    ];

    const toggles = [
        { title: 'Email Notifications', description: 'Receive email updates about new opportunities', enabled: true },
        { title: 'Push Notifications', description: 'Get push notifications for important updates', enabled: true },
        { title: 'Weekly Digest', description: 'Receive a weekly summary of your opportunities', enabled: true },
        { title: 'AI Recommendations', description: 'Get AI-powered opportunity recommendations', enabled: true },
        { title: 'Marketing Emails', description: 'Receive updates about new features and tips', enabled: false },
    ];

    return (
        <div className="p-6 max-w-[1400px] mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-1">Settings</h1>
                <p className="text-gray-600">Manage your account settings and preferences.</p>
            </div>
            <div className="grid grid-cols-4 gap-6">
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <button key={item.label} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${item.active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                            {item.icon}<span>{item.label}</span>
                        </button>
                    ))}
                </div>
                <div className="col-span-3 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Account Information</h2>
                        <div className="space-y-4">
                            {[{ label: 'Full Name', value: 'Aisha Rahman', type: 'text' }, { label: 'Email Address', value: 'aisha.rahman@um.edu.my', type: 'email' }, { label: 'Phone Number', value: '+60 12-345 6789', type: 'tel' }, { label: 'University', value: 'University of Malaya', type: 'text' }].map((field) => (
                                <div key={field.label}>
                                    <label className="block text-sm font-medium mb-2">{field.label}</label>
                                    <input type={field.type} defaultValue={field.value} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Save Changes</button>
                            <button className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
                        <div className="flex items-center gap-6">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha" alt="Profile" className="w-24 h-24 rounded-full" />
                            <div>
                                <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 mb-2 block">Upload New Photo</button>
                                <p className="text-xs text-gray-600">JPG, PNG or GIF. Max size 2MB.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
                        <div className="space-y-4">
                            {toggles.map((t) => (
                                <div key={t.title} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                    <div>
                                        <div className="font-medium text-sm mb-1">{t.title}</div>
                                        <div className="text-sm text-gray-600">{t.description}</div>
                                    </div>
                                    <button className={`relative w-12 h-6 rounded-full transition-colors ${t.enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${t.enabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-red-200 p-6">
                        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
                        <div className="space-y-4">
                            {[{ label: 'Export Your Data', action: 'Export Data', style: 'text-gray-600 border-gray-200' }, { label: 'Deactivate Account', action: 'Deactivate', style: 'text-orange-600 border-orange-200' }, { label: 'Delete Account', action: 'Delete Account', style: 'text-red-600 border-red-200' }].map((item) => (
                                <div key={item.label} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                                    <div className="font-medium text-sm">{item.label}</div>
                                    <button className={`px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 ${item.style}`}>{item.action}</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                            <LogOut className="w-5 h-5" /><span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
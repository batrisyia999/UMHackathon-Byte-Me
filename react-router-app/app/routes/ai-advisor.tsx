import { useState } from 'react';
import { Sparkles, Send, Info, ThumbsUp, ThumbsDown } from 'lucide-react';

export function loader() {
    return {};
}

export default function AIAdvisor() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'user',
            content: 'Which opportunities should I prioritize this week?',
            time: '9:12 AM',
        },
        {
            id: 2,
            role: 'assistant',
            content: 'Based on your profile, goals, and upcoming deadlines, here are the top opportunities to prioritize this week.',
            time: '9:12 AM',
        },
        {
            id: 3,
            role: 'user',
            content: 'Which has the best ROI?',
            time: '9:14 AM',
        },
        {
            id: 4,
            role: 'assistant',
            content: "Here's a quick ROI comparison based on stipend, learning impact, career signal, and time investment.",
            time: '9:14 AM',
        },
        {
            id: 5,
            role: 'user',
            content: 'What am I missing for the top scholarship?',
            time: '9:15 AM',
        },
        {
            id: 6,
            role: 'assistant',
            content: 'For the Khazanah Global Scholarship 2026, here are the key gaps and how to close them.',
            time: '9:15 AM',
        },
    ]);

    const handleSend = () => {
        if (!input.trim()) return;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages((prev) => [
            ...prev,
            { id: prev.length + 1, role: 'user', content: input.trim(), time: now },
        ]);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSend();
    };

    const handleQuickPrompt = (prompt: string) => {
        setInput(prompt);
    };

    const quickPrompts = [
        'Which opportunities should I prioritize?',
        'Show me high ROI opportunities',
        'What fits my career goals best?',
        'What scholarships am I eligible for?',
        'Help me plan my next 7 days',
    ];

    const goals = [
        { label: 'Secure a high-impact internship in tech or data', progress: 88 },
        { label: 'Win a fully funded scholarship for postgraduate', progress: 60 },
        { label: 'Build a strong portfolio and research experience', progress: 45 },
    ];

    const urgent = [
        { title: 'Google STEP Internship (SEA)', note: 'Application due in 2 days' },
        { title: 'PETRONAS Internship 2025', note: 'Test window closes in 4 days' },
        { title: 'Khazanah Scholarship 2026', note: 'Documents due in 8 days' },
    ];

    return (
        <div className="h-full flex">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-indigo-600" />
                        <div>
                            <h1 className="text-lg font-semibold">AI Advisor</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                    Your AI partner for smarter decisions and better opportunities.
                                </span>
                                <span className="flex items-center gap-1 text-xs text-green-600">
                                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                                    Memory active
                                </span>
                                <Info className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-auto p-6 space-y-6">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div className={`flex-1 ${msg.role === 'user' ? 'max-w-2xl' : ''} space-y-2`}>
                                <div
                                    className={`rounded-xl p-5 ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white border border-gray-200'
                                        }`}
                                >
                                    <div className="text-sm">{msg.content}</div>
                                </div>
                                {msg.role === 'assistant' && (
                                    <div className="flex gap-2">
                                        <button className="p-1.5 hover:bg-gray-100 rounded">
                                            <ThumbsUp className="w-4 h-4 text-gray-400" />
                                        </button>
                                        <button className="p-1.5 hover:bg-gray-100 rounded">
                                            <ThumbsDown className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                )}
                                <div
                                    className={`text-xs text-gray-500 ${msg.role === 'user' ? 'text-right' : ''
                                        }`}
                                >
                                    {msg.time}
                                </div>
                            </div>
                            {msg.role === 'user' && (
                                <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha"
                                    alt="You"
                                    className="w-8 h-8 rounded-full flex-shrink-0"
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything about opportunities, applications, or your goals..."
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <button
                            onClick={handleSend}
                            className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="text-xs text-gray-500 text-center mt-2">
                        AI can make mistakes. Verify important info.
                    </div>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-auto">
                <h3 className="font-semibold mb-4">Quick prompts</h3>
                <div className="space-y-2">
                    {quickPrompts.map((prompt) => (
                        <button
                            key={prompt}
                            onClick={() => handleQuickPrompt(prompt)}
                            className="w-full text-left text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
                <button className="w-full mt-4 text-sm text-indigo-600 hover:text-indigo-700">
                    View all prompts
                </button>

                <div className="mt-8">
                    <h3 className="font-semibold mb-4">Your Goals</h3>
                    <div className="space-y-3">
                        {goals.map((goal) => (
                            <div key={goal.label}>
                                <div className="text-sm font-medium mb-1">{goal.label}</div>
                                <div className="bg-white rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-indigo-600 h-full"
                                        style={{ width: `${goal.progress}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{goal.progress}%</div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 text-sm text-indigo-600 hover:text-indigo-700">
                        View all goals
                    </button>
                </div>

                <div className="mt-8">
                    <h3 className="font-semibold mb-4">Today's Urgent</h3>
                    <div className="text-xs text-orange-600 mb-2">{urgent.length}</div>
                    <div className="space-y-2">
                        {urgent.map((item) => (
                            <div key={item.title} className="bg-white rounded-lg p-3">
                                <div className="text-xs font-medium mb-1">{item.title}</div>
                                <div className="text-xs text-gray-600">{item.note}</div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 text-sm text-indigo-600 hover:text-indigo-700">
                        View all deadlines
                    </button>
                </div>
            </div>
        </div>
    );
}
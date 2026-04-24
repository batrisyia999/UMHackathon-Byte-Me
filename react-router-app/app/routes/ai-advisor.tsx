import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Info, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link } from 'react-router';

export function loader() {
    return {};
}

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    time: string;
    liked?: boolean;
    disliked?: boolean;
}

const AI_RESPONSES: Record<string, string> = {
    default: "Great question! Based on your profile — 3rd year Computer Science at UM, CGPA 3.6–3.74, and a goal of gaining industry experience — I'd recommend focusing on the PETRONAS Digital Innovation Internship and Google STEP Internship this week, as both deadlines are within 30 days and your fit score is above 90%.",
    prioritize: "This week, prioritize: (1) PETRONAS Digital Innovation Internship — deadline in 20 days, 96% fit. (2) Google STEP Internship — deadline in 14 days, 96% fit. (3) ADB-Japan Scholarship — already under review, track your email. Start with your essay for PETRONAS today.",
    roi: "Best ROI opportunities for you: 1. PETRONAS Internship — RM 7,000/mo, Medium effort, 92 ROI score. 2. Google STEP — RM 9,500/mo, Medium effort, 91 ROI score. 3. ADB Scholarship — Full tuition + living allowance, High effort, 90 ROI score.",
    scholarships: "Based on your CGPA (3.6–3.74) and CS background, you're eligible for: ADB-Japan Scholarship (97% fit), Khazanah Global Scholarship (80% fit, apply next year), and MARA scholarship programmes. I'd focus on ADB first as it's currently under review.",
    plan: "Here's your 7-day plan: Day 1-2: Finalize PETRONAS essay draft. Day 3: Upload documents for Google STEP. Day 4: Review ADB scholarship status. Day 5-6: Research Shell Graduate Programme requirements. Day 7: Rest and review your pipeline.",
    missing: "For the Khazanah Global Scholarship, you're missing: (1) Research experience — consider joining a faculty lab. (2) Leadership roles — add any club leadership positions. (3) Published work or projects — your portfolio needs 2 more projects. These gaps account for a 23% score reduction.",
    goals: "Your career goals align best with Data Science and AI/ML roles. I recommend: (1) Complete the Python certification this month. (2) Add 2 quantified achievements to your CV. (3) Build 1 end-to-end ML project for your portfolio.",
};

function getAIResponse(input: string): string {
    const lower = input.toLowerCase();
    if (lower.includes('prioritize') || lower.includes('this week') || lower.includes('focus')) return AI_RESPONSES.prioritize;
    if (lower.includes('roi') || lower.includes('best return') || lower.includes('value')) return AI_RESPONSES.roi;
    if (lower.includes('scholarship')) return AI_RESPONSES.scholarships;
    if (lower.includes('plan') || lower.includes('7 days') || lower.includes('week')) return AI_RESPONSES.plan;
    if (lower.includes('missing') || lower.includes('gap') || lower.includes('khazanah')) return AI_RESPONSES.missing;
    if (lower.includes('goal') || lower.includes('career')) return AI_RESPONSES.goals;
    return AI_RESPONSES.default;
}

export default function AIAdvisor() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, role: 'user', content: 'Which opportunities should I prioritize this week?', time: '9:12 AM' },
        { id: 2, role: 'assistant', content: 'Based on your profile, goals, and upcoming deadlines, here are the top opportunities to prioritize this week.', time: '9:12 AM' },
        { id: 3, role: 'user', content: 'Which has the best ROI?', time: '9:14 AM' },
        { id: 4, role: 'assistant', content: "Here's a quick ROI comparison based on stipend, learning impact, career signal, and time investment.", time: '9:14 AM' },
        { id: 5, role: 'user', content: 'What am I missing for the top scholarship?', time: '9:15 AM' },
        { id: 6, role: 'assistant', content: 'For the Khazanah Global Scholarship 2026, here are the key gaps and how to close them.', time: '9:15 AM' },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg: Message = { id: messages.length + 1, role: 'user', content: input.trim(), time: now };
        const responseText = getAIResponse(input);
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: prev.length + 1,
                role: 'assistant',
                content: responseText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
        }, 1200);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSend();
    };

    const handleQuickPrompt = (prompt: string) => {
        setInput(prompt);
    };

    const handleReaction = (id: number, type: 'like' | 'dislike') => {
        setMessages(prev => prev.map(m =>
            m.id === id
                ? { ...m, liked: type === 'like' ? !m.liked : false, disliked: type === 'dislike' ? !m.disliked : false }
                : m
        ));
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
        { title: 'Google STEP Internship (SEA)', note: 'Application due in 2 days', href: '/opportunities/google-step-2025' },
        { title: 'PETRONAS Internship 2025', note: 'Test window closes in 4 days', href: '/opportunities/petronas-2025' },
        { title: 'Khazanah Scholarship 2026', note: 'Documents due in 8 days', href: '/opportunities/khazanah-2026' },
    ];

    return (
        <div className="h-full flex">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-indigo-600" />
                        <div>
                            <h1 className="text-lg font-semibold">AI Advisor</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Your AI partner for smarter decisions and better opportunities.</span>
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
                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div className={`${msg.role === 'user' ? 'max-w-2xl' : 'flex-1'} space-y-2`}>
                                <div className={`rounded-xl p-5 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200'}`}>
                                    <div className="text-sm">{msg.content}</div>
                                </div>
                                {msg.role === 'assistant' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleReaction(msg.id, 'like')}
                                            className={`p-1.5 rounded transition-colors ${msg.liked ? 'bg-green-100' : 'hover:bg-gray-100'}`}
                                            title="Helpful"
                                        >
                                            <ThumbsUp className={`w-4 h-4 ${msg.liked ? 'text-green-600' : 'text-gray-400'}`} />
                                        </button>
                                        <button
                                            onClick={() => handleReaction(msg.id, 'dislike')}
                                            className={`p-1.5 rounded transition-colors ${msg.disliked ? 'bg-red-100' : 'hover:bg-gray-100'}`}
                                            title="Not helpful"
                                        >
                                            <ThumbsDown className={`w-4 h-4 ${msg.disliked ? 'text-red-500' : 'text-gray-400'}`} />
                                        </button>
                                    </div>
                                )}
                                <div className={`text-xs text-gray-500 ${msg.role === 'user' ? 'text-right' : ''}`}>{msg.time}</div>
                            </div>
                            {msg.role === 'user' && (
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha" alt="You" className="w-8 h-8 rounded-full flex-shrink-0" />
                            )}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
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
                            disabled={!input.trim() || isTyping}
                            className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="text-xs text-gray-500 text-center mt-2">AI can make mistakes. Verify important info.</div>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-auto flex-shrink-0">
                <h3 className="font-semibold mb-4">Quick prompts</h3>
                <div className="space-y-2">
                    {quickPrompts.map((prompt) => (
                        <button
                            key={prompt}
                            onClick={() => handleQuickPrompt(prompt)}
                            className="w-full text-left text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 transition-colors"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => handleQuickPrompt('Show me all available prompts')}
                    className="w-full mt-4 text-sm text-indigo-600 hover:text-indigo-700"
                >
                    View all prompts
                </button>

                <div className="mt-8">
                    <h3 className="font-semibold mb-4">Your Goals</h3>
                    <div className="space-y-3">
                        {goals.map((goal) => (
                            <div key={goal.label}>
                                <div className="text-sm font-medium mb-1">{goal.label}</div>
                                <div className="bg-white rounded-full h-2 overflow-hidden">
                                    <div className="bg-indigo-600 h-full" style={{ width: `${goal.progress}%` }}></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{goal.progress}%</div>
                            </div>
                        ))}
                    </div>
                    <Link to="/profile" className="w-full mt-4 text-sm text-indigo-600 hover:text-indigo-700 block hover:underline">
                        View all goals
                    </Link>
                </div>

                <div className="mt-8">
                    <h3 className="font-semibold mb-4">Today's Urgent</h3>
                    <div className="text-xs text-orange-600 mb-2">{urgent.length} urgent</div>
                    <div className="space-y-2">
                        {urgent.map((item) => (
                            <Link key={item.title} to={item.href} className="block bg-white rounded-lg p-3 hover:shadow-md transition-shadow">
                                <div className="text-xs font-medium mb-1">{item.title}</div>
                                <div className="text-xs text-gray-600">{item.note}</div>
                            </Link>
                        ))}
                    </div>
                    <Link to="/planner" className="w-full mt-4 text-sm text-indigo-600 hover:text-indigo-700 block hover:underline">
                        View all deadlines
                    </Link>
                </div>
            </div>
        </div>
    );
}
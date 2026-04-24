import { useSearchParams, Link } from 'react-router';
import { Search as SearchIcon, Briefcase, BookOpen, Users, ArrowRight } from 'lucide-react';

export function loader() {
    return {};
}

export default function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    // Mock search results
    const results = query ? [
        { id: 1, type: 'opportunity', title: `Internship related to "${query}"`, description: 'PETRONAS Digital Innovation Internship 2025. Strong match with your skills.', icon: <Briefcase className="w-5 h-5 text-indigo-600" />, link: '/opportunities' },
        { id: 2, type: 'opportunity', title: `Scholarship matching "${query}"`, description: 'ADB-Japan Scholarship Program 2025. High eligibility based on your profile.', icon: <Briefcase className="w-5 h-5 text-indigo-600" />, link: '/opportunities' },
        { id: 3, type: 'resource', title: `Guide: How to prepare for "${query}" interviews`, description: 'A comprehensive guide to acing technical and behavioral interviews.', icon: <BookOpen className="w-5 h-5 text-emerald-600" />, link: '/resource-hub' },
        { id: 4, type: 'network', title: `Alumni working in "${query}" fields`, description: 'Connect with 15+ alumni who are currently working in this industry.', icon: <Users className="w-5 h-5 text-blue-600" />, link: '/network' }
    ] : [];

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold mb-2">Search Results</h1>
                <p className="text-gray-600">
                    {query ? `Showing results for "${query}"` : 'Enter a search term in the top bar to find opportunities, resources, and people.'}
                </p>
            </div>

            {query && results.length > 0 ? (
                <div className="space-y-4">
                    {results.map((result) => (
                        <div key={result.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg flex-shrink-0">
                                    {result.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">{result.type}</span>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">{result.title}</h3>
                                    <p className="text-sm text-gray-600 mb-4">{result.description}</p>

                                    <Link to={result.link} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                                        View details <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : query ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                    <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
                    <p className="text-sm text-gray-500">We couldn't find anything matching "{query}". Try different keywords.</p>
                </div>
            ) : null}
        </div>
    );
}

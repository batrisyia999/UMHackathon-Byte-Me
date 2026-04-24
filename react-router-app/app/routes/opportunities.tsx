import { useState } from 'react';
import { Link } from 'react-router';
import { Sparkles, Bookmark, ChevronDown, Grid3x3, List, X, CheckCircle2, Star, TrendingUp } from 'lucide-react';

export function loader() {
  return {};
}

export default function Opportunities() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Opportunities</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <Bookmark className="w-4 h-4" />
            Saved Searches
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-6 border-b border-gray-200">
        <button className="pb-3 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">All</button>
        <button className="pb-3 text-sm text-gray-600 hover:text-gray-900">Scholarships</button>
        <button className="pb-3 text-sm text-gray-600 hover:text-gray-900">Internships</button>
        <button className="pb-3 text-sm text-gray-600 hover:text-gray-900">Competitions</button>
        <button className="pb-3 text-sm text-gray-600 hover:text-gray-900">Grants</button>
        <button className="pb-3 text-sm text-gray-600 hover:text-gray-900">Certifications</button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium">AI Filters</span>
          <span className="text-xs text-gray-500">Refine opportunities based on your profile and preferences</span>
          <button className="ml-auto text-sm text-indigo-600 hover:text-indigo-700">Clear all</button>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 px-3 py-1.5 bg-indigo-50 rounded-lg">Edit Filters</button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <FilterChip label="Course" value="Computer Science" />
          <FilterChip label="Year" value="3rd Year" />
          <FilterChip label="CGPA" value="3.60 - 3.74" />
          <FilterChip label="Goal" value="Industry Experience" />
          <FilterChip label="Effort" value="Any" />
          <FilterChip label="Deadline Urgency" value="Any" />
          <FilterChip label="Location" value="Any" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">48 opportunities found</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md">Best Match</button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md">Highest ROI</button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md">Most Urgent</button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md">Low Effort</button>
          </div>
        </div>
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
            <OpportunityCard
              id="petronas-2025"
              tag="Highly Matched"
              verified={true}
              logo="https://logo.clearbit.com/petronas.com"
              title="PETRONAS Digital Innovation Internship 2025"
              company="PETRONAS"
              category="Internship"
              deadline="20 Jun 2025"
              estimatedValue="RM 7,000 / month"
              fitScore={96}
              effort="Medium"
              eligibility="High"
              roiScore={92}
              recommendation="Strong match with your skills in Python, data analysis and problem solving."
              topPick={true}
            />
            <OpportunityCard
              id="adb-2025"
              verified={true}
              logo="https://logo.clearbit.com/adb.org"
              title="ADB-Japan Scholarship Program 2025"
              company="Asian Development Bank"
              category="Scholarship"
              deadline="15 May 2025"
              estimatedValue="Full Tuition + Living Allowance"
              fitScore={97}
              effort="High"
              eligibility="High"
              roiScore={90}
              recommendation="Excellent fit for your academic profile and career goals."
              topPick={true}
            />
            <OpportunityCard
              id="google-step-2025"
              tag="Newly Added"
              verified={true}
              logo="https://logo.clearbit.com/google.com"
              title="Google STEP Internship (GAPAC) 2025"
              company="Google"
              category="Internship"
              deadline="24 May 2025"
              estimatedValue="RM 9,500 / month"
              fitScore={96}
              effort="Medium"
              eligibility="Medium"
              roiScore={91}
              recommendation="Great opportunity to work on real-world projects at Google."
            />
            <OpportunityCard
              id="icpc-2025"
              tag="Trending"
              verified={true}
              logo="https://logo.clearbit.com/icpc.global"
              title="ICPC Asia Pacific Finals 2025"
              company="ICPC Foundation"
              category="Competition"
              deadline="15 Jun 2025"
              estimatedValue="RM 2,000"
              fitScore={88}
              effort="Medium"
              eligibility="High"
              roiScore={85}
              recommendation="Strong track record in programming competitions."
            />
          </div>
          <div className="mt-6 flex justify-center">
            <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Load more <ChevronDown className="w-4 h-4 inline ml-2" />
            </button>
          </div>
        </div>

        <div className="w-80 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold">Why these are recommended</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Matched to your academic profile, skills, and career goals</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>High eligibility-confidence based on your profile (Top 18%)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Balanced mix of high impact and achievable opportunities</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold">AI Compare</h3>
              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded ml-auto">Top 3 Picks</span>
            </div>
            <div className="space-y-2 mb-4">
              {[
                { initial: 'P', bg: 'bg-teal-500', name: 'PETRONAS Internship 2025', type: 'Internship', score: 96 },
                { initial: 'A', bg: 'bg-blue-600', name: 'ADB-Japan Scholarship 2025', type: 'Scholarship', score: 93 },
                { initial: 'G', bg: 'bg-red-500', name: 'Google STEP Internship 2025', type: 'Internship', score: 90 },
              ].map((item) => (
                <div key={item.name} className="bg-white rounded-lg p-3 flex items-center gap-3">
                  <div className={`w-10 h-10 ${item.bg} rounded flex-shrink-0 flex items-center justify-center`}>
                    <span className="text-white font-semibold text-xs">{item.initial}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{item.name}</div>
                    <div className="text-xs text-gray-600">{item.type}</div>
                  </div>
                  <div className="text-lg font-semibold text-green-600">{item.score}%</div>
                </div>
              ))}
            </div>
            <button className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700">
              View full comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5">
      <span className="text-xs text-gray-500">{label}:</span>
      <span className="text-xs font-medium">{value}</span>
      <button className="hover:bg-gray-200 rounded p-0.5">
        <X className="w-3 h-3 text-gray-500" />
      </button>
    </div>
  );
}

function OpportunityCard({ id, tag, verified, logo, title, company, category, deadline, estimatedValue, fitScore, effort, eligibility, roiScore, recommendation, topPick }: {
  id: string; tag?: string; verified?: boolean; logo?: string; title: string; company: string;
  category: string; deadline: string; estimatedValue: string; fitScore: number; effort: string;
  eligibility: string; roiScore: number; recommendation: string; topPick?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow relative">
      {topPick && (
        <div className="absolute -top-2 left-4 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
          <Star className="w-3 h-3" /> Top Pick
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {logo && <img src={logo} alt={company} className="w-8 h-8 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />}
          </div>
          <div className="flex-1">
            {tag && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded mb-1 inline-block ${tag === 'Highly Matched' ? 'bg-green-100 text-green-700' : tag === 'Newly Added' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                {tag}
              </span>
            )}
            <Link to={`/opportunities/${id}`} className="block font-semibold text-sm hover:text-indigo-600 line-clamp-2 mb-1">{title}</Link>
            <div className="text-xs text-gray-600">by {company} {verified && <span className="text-green-600">• Verified</span>}</div>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded mt-1 inline-block">{category}</span>
          </div>
        </div>
        <button className="p-1.5 hover:bg-gray-100 rounded">
          <Bookmark className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div><div className="text-xs text-gray-500 mb-1">Deadline</div><div className="text-sm font-medium">{deadline}</div></div>
        <div><div className="text-xs text-gray-500 mb-1">Est. Value</div><div className="text-sm font-medium">{estimatedValue}</div></div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-600 mb-0.5">Fit Score</div>
          <div className="text-lg font-semibold text-green-600">{fitScore}%</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-600 mb-0.5">Effort</div>
          <div className={`text-sm font-semibold ${effort === 'High' ? 'text-red-600' : effort === 'Medium' ? 'text-orange-600' : 'text-green-600'}`}>{effort}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-600 mb-0.5">Eligibility</div>
          <div className={`text-sm font-semibold ${eligibility === 'High' ? 'text-green-600' : eligibility === 'Medium' ? 'text-orange-600' : 'text-red-600'}`}>{eligibility}</div>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-4 text-xs text-gray-600">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>ROI Score: {roiScore}/100</span>
      </div>
      <div className="bg-indigo-50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-medium text-gray-900 mb-1">Why recommended:</div>
            <div className="text-xs text-gray-700">{recommendation}</div>
          </div>
        </div>
      </div>
      <Link to={`/opportunities/${id}`} className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
        View Opportunity
      </Link>
    </div>
  );
}
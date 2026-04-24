from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import StudentProfile, OpportunityRecommendation
from .services.opportunity_service import OpportunityService
from typing import List

app = FastAPI(title="OpportunIQ API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

opportunity_service = OpportunityService()

@app.get("/")
async def root():
    return {"message": "Welcome to OpportunIQ Decision Intelligence API"}

@app.get("/opportunities")
async def get_all_opportunities():
    return opportunity_service.opportunities

@app.post("/analyze")
async def analyze_opportunities(profile: StudentProfile):
    """
    Analyzes opportunities for a student profile.
    In a full implementation, this would call the AI & Decision Logic service.
    For the 'Data Engineer' part, we provide the filtered and preprocessed data.
    """
    filtered_opps = opportunity_service.filter_by_profile(profile)
    
    # Pre-calculate urgency for each
    results = []
    for opp in filtered_opps:
        urgency = opportunity_service.calculate_urgency_score(opp.deadline)
        # Placeholder for AI-driven scoring
        results.append({
            "opportunity": opp,
            "urgency_score": urgency
        })
    
    return {
        "status": "success",
        "count": len(results),
        "data": results,
        "raw_ai_context": {
            "profile_context": opportunity_service.format_profile_for_ai(profile),
            "opportunity_context": opportunity_service.format_opportunities_for_ai(filtered_opps)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

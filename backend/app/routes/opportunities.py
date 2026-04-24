from fastapi import APIRouter
from app.services.opportunity_service import OpportunityService

router = APIRouter()

# Use OpportunityService to return real opportunity data
service = OpportunityService()

@router.get("/opportunities")
def get_opportunities():
    return {"data": [opp.dict() for opp in service.opportunities]}
import json
import os
from datetime import datetime
from typing import List, Optional
from ..models import Opportunity, StudentProfile

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "opportunities.json")

class OpportunityService:
    def __init__(self):
        self.opportunities = self.load_opportunities()

    def load_opportunities(self) -> List[Opportunity]:
        try:
            with open(DATA_PATH, "r") as f:
                data = json.load(f)
                return [Opportunity(**item) for item in data]
        except Exception as e:
            print(f"Error loading opportunities: {e}")
            return []

    def calculate_urgency_score(self, deadline_str: Optional[str]) -> int:
        """
        Calculates urgency score from 0-100 based on days remaining.
        Handles multiple dates separated by '/' and null values.
        """
        if not deadline_str:
            return 20  # Default low urgency for no deadline

        try:
            # Handle multiple dates by picking the earliest one that is still in the future
            dates = [d.strip() for d in deadline_str.split("/")]
            parsed_dates = []
            for d in dates:
                try:
                    parsed_dates.append(datetime.strptime(d, "%Y-%m-%d"))
                except:
                    continue
            
            if not parsed_dates:
                return 20

            today = datetime.now()
            # Filter for future dates only
            future_dates = [d for d in parsed_dates if d >= today]
            
            if not future_dates:
                return 100 # All deadlines passed

            target_deadline = min(future_dates)
            delta = (target_deadline - today).days

            if delta <= 0:
                return 100
            if delta >= 30:
                return 10
            
            return int(100 - (delta * 3))
        except:
            return 20

    def filter_by_profile(self, profile: StudentProfile) -> List[Opportunity]:
        """
        Basic heuristic filtering to narrow down relevant opportunities.
        """
        filtered = []
        for opp in self.opportunities:
            # Check study level fit (e.g. Undergraduate matches Bachelor)
            level_match = False
            # Normalize study levels for matching
            norm_profile_level = "Undergraduate" if profile.year > 0 else "Foundation"
            # Actual UM students are Undergraduate/Postgrad
            # New JSON uses "Bachelor", "Diploma", etc.
            
            for level in opp.study_level:
                if "Undergraduate" in level or "Bachelor" in level or "Degree" in level:
                    level_match = True
                    break
                if "Any" in level:
                    level_match = True
                    break
            
            if not level_match:
                continue

            # Check year fit
            year_match = False
            if profile.year in opp.target_year or 0 in opp.target_year:
                year_match = True
            
            if not year_match:
                continue

            # Check discipline fit
            discipline_match = False
            if any(d.lower() in ["all", "any"] for d in opp.target_disciplines):
                discipline_match = True
            else:
                for discipline in opp.target_disciplines:
                    if discipline.lower() in profile.course.lower() or profile.course.lower() in discipline.lower():
                        discipline_match = True
                        break
            
            if discipline_match:
                filtered.append(opp)
        
        return filtered

    def get_opportunity_by_id(self, opp_id: str) -> Opportunity:
        for opp in self.opportunities:
            if opp.id == opp_id:
                return opp
        return None

    def format_opportunities_for_ai(self, opportunities: List[Opportunity]) -> str:
        """
        Converts a list of opportunities into a condensed text format for GLM consumption.
        """
        formatted = ""
        for opp in opportunities:
            formatted += f"ID: {opp.id}\n"
            formatted += f"Title: {opp.title}\n"
            formatted += f"Category: {opp.category}\n"
            formatted += f"Eligibility: {opp.eligibility}\n"
            formatted += f"Deadline: {opp.deadline or 'N/A'}\n"
            formatted += f"Value: {opp.estimated_value or 'Check Link'} {opp.value_currency}\n"
            formatted += f"Study Levels: {', '.join(opp.study_level)}\n"
            formatted += f"Disciplines: {', '.join(opp.target_disciplines)}\n"
            formatted += f"---\n"
        return formatted

    def format_profile_for_ai(self, profile: StudentProfile) -> str:
        return f"""
Student Name: {profile.name}
Course: {profile.course}
Faculty: {profile.faculty}
Year: {profile.year}
CGPA: {profile.cgpa}
Interests: {', '.join(profile.interests)}
Goals: {', '.join(profile.goals)}
Time Availability: {profile.time_availability}
Readiness: {profile.readiness_level}
Assets: {', '.join(profile.assets)}
"""

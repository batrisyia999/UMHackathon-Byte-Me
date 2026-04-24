import os
import requests
from dotenv import load_dotenv
import json
import time

load_dotenv()

API_KEY = os.getenv("GLM_API_KEY")

if not API_KEY:
    raise ValueError("GLM_API_KEY is missing in .env file")

def analyze_with_glm(data):
    url = "https://api.ilmu.ai/v1/chat/completions"

    payload = {
        "model": "ilmu-glm-5.1",
        "messages": [
            {
                "role": "user",
                "content": f"""
                You are an AI Decision Intelligence System for university students.

                Your task is to analyze a student's profile and a list of opportunities, then determine which opportunities the student should prioritize.

                Evaluate each opportunity using:
                - Profile Fit
                - Urgency (based on deadline)
                - Economic Value
                - Effort Level
                - Eligibility Confidence

                For each opportunity, return:
                - title
                - fit_score (0–100)
                - urgency ("Low", "Medium", "High")
                - value (number)
                - effort ("Low", "Medium", "High")
                - eligibility ("Low", "Medium", "High")
                - action ("Apply Now", "Prepare Soon", "Track Later", "Skip")
                - reason (short explanation)
                - next_step (specific action)

                Rules:
                - High fit + high urgency → Apply Now
                - High value but not ready → Prepare Soon
                - Relevant but not urgent → Track Later
                - Low fit → Skip

                IMPORTANT:
                - Return ONLY valid JSON
                - No text outside JSON
                - No markdown

                STRICT REQUIREMENTS:
                - Return EXACTLY 3 opportunities
                - Rank them from 1 (best match) to 3 (lowest match)
                - Each result must be clearly ordered by relevance score
                - Never return empty results
                - If data is weak, still infer best possible ranking

                Input:
                Student Profile:
                {json.dumps(data.get("profile", {}), indent=2)}

                Opportunities:
                {json.dumps(data.get("opportunities", []), indent=2)}

                Output:
                {{
                "results": [
                    {{
                    "title": "string",
                    "fit_score": number,
                    "urgency": "Low | Medium | High",
                    "value": number,
                    "effort": "Low | Medium | High",
                    "eligibility": "Low | Medium | High",
                    "action": "Apply Now | Prepare Soon | Track Later | Skip",
                    "reason": "string",
                    "next_step": "string"
                    }}
                ]
                }}
                """
            }
        ]
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    response = None

    for i in range(3):
        try:
            response = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                break

        except requests.exceptions.RequestException:
            time.sleep(2)

    if not response or response.status_code == 504:
        return {
            "results": [
                {
                    "title": "AI service temporarily unavailable",
                    "fit_score": 0,
                    "urgency": "Low",
                    "value": 0,
                    "effort": "Low",
                    "eligibility": "Low",
                    "action": "Try Again",
                    "reason": "GLM API timeout (504). Fallback response triggered.",
                    "next_step": "Retry analysis in a few minutes"
                }
            ]
        }  

    print("STATUS:", response.status_code)
    print("RAW RESPONSE:", response.text)

    if response.status_code != 200:
        return {
        "error": "GLM request failed",
        "status": response.status_code,
        "raw": response.text
        }
    
    try:
        result = response.json()
    except Exception:
        return {
        "error": "Invalid JSON from API",
        "raw": response.text
        }


    # extract AI message
    try:
        content = result["choices"][0]["message"]["content"]
    except Exception:
        return {
            "error": "Failed to extract AI message",
            "raw": result
        }

    print("RAW AI OUTPUT:", content)

    # safe JSON parsing
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        import re
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group())
        else:
            parsed = {
                "insight": "Parsing failed",
                "recommendation": "Try again",
                "explanation": content
            }

    # fallback safety (PUT HERE)
    if not parsed.get("results"):
        parsed = {
            "results": [
                {
                    "title": "No strong match found",
                    "fit_score": 60,
                    "urgency": "Medium",
                    "value": 0,
                    "effort": "Medium",
                    "eligibility": "Medium",
                    "action": "Prepare Soon",
                    "reason": "Fallback result to ensure system stability",
                    "next_step": "Improve profile or add more opportunities"
                }
            ]
        }

    return parsed


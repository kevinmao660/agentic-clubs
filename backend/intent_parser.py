import os
import openai
import json
import re
from typing import Dict, List, Any

class IntentParser:
    def __init__(self):
        """Initialize intent parser with OpenAI configuration"""
        self.openai_client = openai.OpenAI(
            api_key=os.getenv('OPENAI_API_KEY', 'your-openai-api-key-here')
        )
        self.model = os.getenv('OPENAI_MODEL', 'gpt-4')
        
        # Common industry keywords for validation
        self.industry_keywords = {
            'healthtech': ['health', 'medical', 'wellness', 'mental health', 'healthcare', 'biotech'],
            'fintech': ['finance', 'banking', 'payments', 'investment', 'cryptocurrency', 'blockchain'],
            'edtech': ['education', 'learning', 'training', 'academic', 'student', 'university'],
            'sustainability': ['environmental', 'green', 'renewable', 'energy', 'climate', 'sustainable'],
            'ai': ['artificial intelligence', 'machine learning', 'ai', 'ml', 'automation'],
            'cybersecurity': ['security', 'cybersecurity', 'privacy', 'protection', 'threat'],
            'ecommerce': ['retail', 'ecommerce', 'shopping', 'marketplace', 'online retail'],
            'saas': ['software', 'saas', 'cloud', 'platform', 'enterprise'],
            'media': ['entertainment', 'media', 'content', 'publishing', 'broadcasting'],
            'real_estate': ['real estate', 'property', 'housing', 'construction', 'development']
        }
        
        # Common support types
        self.support_types = [
            'sponsorship', 'partnership', 'mentorship', 'donation', 'in-kind support',
            'collaboration', 'speaking engagement', 'workshop', 'event support'
        ]
        
        # Common contact roles
        self.contact_roles = [
            'partnerships manager', 'community manager', 'marketing director',
            'business development', 'corporate social responsibility', 'founder',
            'ceo', 'recruiter', 'outreach coordinator', 'events manager'
        ]
    
    def parse_intent(self, description: str, club_summary: str = "") -> Dict[str, Any]:
        """Parse user's sponsorship request into structured data"""
        try:
            # Create comprehensive prompt for intent parsing
            prompt = self._create_parsing_prompt(description, club_summary)
            
            # Use OpenAI function calling for structured output
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an AI assistant that analyzes sponsorship requests from student clubs and extracts key information for business outreach."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                functions=[{
                    "name": "parse_sponsorship_intent",
                    "description": "Parse sponsorship request into structured data",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "industries": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "List of target industries or domains mentioned"
                            },
                            "support_type": {
                                "type": "string",
                                "description": "Type of support requested (e.g., sponsorship, partnership, mentorship)"
                            },
                            "contact_roles": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "List of roles that would likely handle this kind of request"
                            },
                            "event_type": {
                                "type": "string",
                                "description": "Type of event or activity being organized"
                            },
                            "target_audience": {
                                "type": "string",
                                "description": "Target audience for the event or initiative"
                            },
                            "timeline": {
                                "type": "string",
                                "description": "Timeline or date for the event/initiative"
                            },
                            "budget_range": {
                                "type": "string",
                                "description": "Budget range or funding needs mentioned"
                            }
                        },
                        "required": ["industries", "support_type", "contact_roles"]
                    }
                }],
                function_call={"name": "parse_sponsorship_intent"},
                temperature=0.1,
                max_tokens=500
            )
            
            # Extract function call arguments
            function_call = response.choices[0].message.function_call
            if function_call and function_call.name == "parse_sponsorship_intent":
                parsed_data = json.loads(function_call.arguments)
                
                # Validate and clean the parsed data
                validated_data = self._validate_parsed_data(parsed_data)
                
                return validated_data
            else:
                # Fallback to manual parsing if function calling fails
                return self._fallback_parse(description)
                
        except Exception as e:
            print(f"AI intent parsing failed: {str(e)}")
            # Fallback to manual parsing
            return self._fallback_parse(description)
    
    def _create_parsing_prompt(self, description: str, club_summary: str) -> str:
        """Create a comprehensive prompt for intent parsing"""
        prompt = f"""Please analyze the following sponsorship request from a student club and extract key information.

Club Context:
{club_summary if club_summary else 'No additional club context provided.'}

Sponsorship Request:
"{description}"

Please extract the following information:
1. Industries: What industries or business domains are mentioned or implied?
2. Support Type: What type of support is being requested?
3. Contact Roles: What job titles or roles would be most appropriate to contact?
4. Event Type: What kind of event or initiative is this?
5. Target Audience: Who is the target audience?
6. Timeline: When is this happening?
7. Budget Range: Any mention of funding needs?

Focus on identifying companies that would be a good fit for this sponsorship opportunity."""

        return prompt
    
    def _validate_parsed_data(self, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean the parsed data"""
        validated = {}
        
        # Validate industries
        industries = parsed_data.get('industries', [])
        if isinstance(industries, list):
            # Clean and normalize industry names
            cleaned_industries = []
            for industry in industries:
                if industry and isinstance(industry, str):
                    cleaned = industry.strip().lower()
                    if cleaned:
                        # Map to standard industry names
                        mapped = self._map_industry(cleaned)
                        if mapped and mapped not in cleaned_industries:
                            cleaned_industries.append(mapped)
            
            validated['industries'] = cleaned_industries[:5]  # Limit to 5 industries
        else:
            validated['industries'] = []
        
        # Validate support type
        support_type = parsed_data.get('support_type', '')
        if isinstance(support_type, str) and support_type.strip():
            cleaned_support = support_type.strip().lower()
            # Map to standard support type
            validated['support_type'] = self._map_support_type(cleaned_support)
        else:
            validated['support_type'] = 'sponsorship'
        
        # Validate contact roles
        contact_roles = parsed_data.get('contact_roles', [])
        if isinstance(contact_roles, list):
            # Clean and normalize role names
            cleaned_roles = []
            for role in contact_roles:
                if role and isinstance(role, str):
                    cleaned = role.strip().lower()
                    if cleaned:
                        # Map to standard role names
                        mapped = self._map_contact_role(cleaned)
                        if mapped and mapped not in cleaned_roles:
                            cleaned_roles.append(mapped)
            
            validated['contact_roles'] = cleaned_roles[:5]  # Limit to 5 roles
        else:
            validated['contact_roles'] = ['partnerships manager']
        
        # Add additional fields if available
        for field in ['event_type', 'target_audience', 'timeline', 'budget_range']:
            value = parsed_data.get(field, '')
            if isinstance(value, str) and value.strip():
                validated[field] = value.strip()
            else:
                validated[field] = ''
        
        return validated
    
    def _map_industry(self, industry: str) -> str:
        """Map industry keywords to standard industry names"""
        industry_lower = industry.lower()
        
        for standard_name, keywords in self.industry_keywords.items():
            for keyword in keywords:
                if keyword in industry_lower:
                    return standard_name
        
        # If no match found, return the original (cleaned)
        return industry
    
    def _map_support_type(self, support_type: str) -> str:
        """Map support type to standard options"""
        support_lower = support_type.lower()
        
        for standard_type in self.support_types:
            if standard_type in support_lower:
                return standard_type
        
        # Default to sponsorship if no match
        return 'sponsorship'
    
    def _map_contact_role(self, role: str) -> str:
        """Map contact role to standard options"""
        role_lower = role.lower()
        
        for standard_role in self.contact_roles:
            if standard_role in role_lower:
                return standard_role
        
        # If no match found, return the original (cleaned)
        return role
    
    def _fallback_parse(self, description: str) -> Dict[str, Any]:
        """Fallback parsing method using keyword matching"""
        description_lower = description.lower()
        
        # Extract industries
        industries = []
        for industry, keywords in self.industry_keywords.items():
            for keyword in keywords:
                if keyword in description_lower:
                    industries.append(industry)
                    break
        
        # Extract support type
        support_type = 'sponsorship'  # Default
        for st in self.support_types:
            if st in description_lower:
                support_type = st
                break
        
        # Extract contact roles
        contact_roles = ['partnerships manager']  # Default
        for role in self.contact_roles:
            if role in description_lower:
                contact_roles.append(role)
                if len(contact_roles) >= 3:  # Limit to 3 roles
                    break
        
        # Extract event type
        event_keywords = ['event', 'conference', 'workshop', 'hackathon', 'competition', 'sprint']
        event_type = ''
        for keyword in event_keywords:
            if keyword in description_lower:
                event_type = keyword
                break
        
        # Extract target audience
        audience_keywords = ['students', 'professionals', 'startups', 'companies', 'community']
        target_audience = ''
        for keyword in audience_keywords:
            if keyword in description_lower:
                target_audience = keyword
                break
        
        return {
            'industries': industries[:3],
            'support_type': support_type,
            'contact_roles': contact_roles[:3],
            'event_type': event_type,
            'target_audience': target_audience,
            'timeline': '',
            'budget_range': ''
        }
    
    def get_parsing_confidence(self, parsed_data: Dict[str, Any]) -> float:
        """Calculate confidence score for the parsed data"""
        confidence = 0.0
        total_fields = 0
        
        # Check if required fields are present
        required_fields = ['industries', 'support_type', 'contact_roles']
        for field in required_fields:
            total_fields += 1
            if field in parsed_data and parsed_data[field]:
                if field == 'industries' and len(parsed_data[field]) > 0:
                    confidence += 1.0
                elif field == 'support_type' and parsed_data[field]:
                    confidence += 1.0
                elif field == 'contact_roles' and len(parsed_data[field]) > 0:
                    confidence += 1.0
        
        # Check optional fields
        optional_fields = ['event_type', 'target_audience', 'timeline', 'budget_range']
        for field in optional_fields:
            total_fields += 1
            if field in parsed_data and parsed_data[field]:
                confidence += 0.5
        
        return confidence / total_fields if total_fields > 0 else 0.0
    
    def suggest_improvements(self, description: str, parsed_data: Dict[str, Any]) -> List[str]:
        """Suggest improvements to the sponsorship request description"""
        suggestions = []
        
        # Check if industries are specific enough
        if not parsed_data.get('industries'):
            suggestions.append("Consider specifying target industries (e.g., 'healthtech startups', 'fintech companies')")
        
        # Check if support type is clear
        if parsed_data.get('support_type') == 'sponsorship':
            suggestions.append("Be specific about what type of support you need (e.g., 'financial sponsorship', 'mentorship', 'in-kind donations')")
        
        # Check if timeline is mentioned
        if not parsed_data.get('timeline'):
            suggestions.append("Include timeline information (e.g., 'this semester', 'next month', 'Q1 2024')")
        
        # Check if target audience is clear
        if not parsed_data.get('target_audience'):
            suggestions.append("Specify your target audience (e.g., 'university students', 'tech professionals', 'startup founders')")
        
        # Check description length
        if len(description) < 50:
            suggestions.append("Provide more details about your event/initiative to help companies understand the opportunity")
        elif len(description) > 500:
            suggestions.append("Consider making your request more concise while keeping key details")
        
        return suggestions







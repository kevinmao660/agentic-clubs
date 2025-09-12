import os
import openai
import json
from typing import List, Dict, Any
import uuid

class EmailGenerator:
    def __init__(self):
        """Initialize email generator service"""
        self.openai_client = openai.OpenAI(
            api_key=os.getenv('OPENAI_API_KEY', 'your-openai-api-key-here')
        )
        self.model = os.getenv('OPENAI_MODEL', 'gpt-4')
    
    def generate_emails(self, club_info: Dict[str, Any], intent_data: Dict[str, Any], contacts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate personalized email drafts for each contact"""
        try:
            emails = []
            
            for contact in contacts:
                email_draft = self._generate_single_email(club_info, intent_data, contact)
                if email_draft:
                    emails.append(email_draft)
            
            return emails
            
        except Exception as e:
            print(f"Email generation failed: {str(e)}")
            return self._generate_mock_emails(club_info, intent_data, contacts)
    
    def _generate_single_email(self, club_info: Dict[str, Any], intent_data: Dict[str, Any], contact: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a single personalized email draft"""
        try:
            # Create prompt for email generation
            prompt = self._create_email_prompt(club_info, intent_data, contact)
            
            # Generate email using OpenAI
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an AI assistant that writes professional, personalized outreach emails for student club sponsorship requests. Write emails that are friendly, specific, and show genuine interest in the company."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                functions=[{
                    "name": "generate_outreach_email",
                    "description": "Generate a personalized outreach email",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "subject": {
                                "type": "string",
                                "description": "Email subject line"
                            },
                            "body": {
                                "type": "string",
                                "description": "Email body content"
                            },
                            "tone": {
                                "type": "string",
                                "description": "Tone of the email (professional, friendly, enthusiastic)"
                            }
                        },
                        "required": ["subject", "body"]
                    }
                }],
                function_call={"name": "generate_outreach_email"},
                temperature=0.7,
                max_tokens=800
            )
            
            # Extract function call arguments
            function_call = response.choices[0].message.function_call
            if function_call and function_call.name == "generate_outreach_email":
                email_data = json.loads(function_call.arguments)
                
                return {
                    'id': str(uuid.uuid4()),
                    'contact': contact,
                    'subject': email_data.get('subject', ''),
                    'body': email_data.get('body', ''),
                    'status': 'draft'
                }
            else:
                # Fallback to basic email generation
                return self._generate_basic_email(club_info, intent_data, contact)
                
        except Exception as e:
            print(f"AI email generation failed: {str(e)}")
            return self._generate_basic_email(club_info, intent_data, contact)
    
    def _create_email_prompt(self, club_info: Dict[str, Any], intent_data: Dict[str, Any], contact: Dict[str, Any]) -> str:
        """Create a comprehensive prompt for email generation"""
        club_summary = club_info.get('summary', '')
        industries = intent_data.get('industries', [])
        support_type = intent_data.get('support_type', 'sponsorship')
        description = intent_data.get('description', '')
        
        contact_name = contact.get('name', '')
        contact_title = contact.get('title', '')
        company_name = contact.get('companyName', '')
        
        prompt = f"""Please write a personalized outreach email for a sponsorship request.

Club Information:
{club_summary}

Sponsorship Request:
{description}

Target Industries: {', '.join(industries)}
Support Type: {support_type}

Contact Information:
- Name: {contact_name}
- Title: {contact_title}
- Company: {company_name}

Please create:
1. A compelling subject line
2. A personalized email body that:
   - Addresses the contact by name
   - References their role and company
   - Explains the club's mission and request
   - Shows why their company would be a good fit
   - Includes a clear call to action
   - Maintains a professional yet friendly tone

The email should be approximately 3-4 paragraphs and demonstrate that you've done research on their company."""

        return prompt
    
    def _generate_basic_email(self, club_info: Dict[str, Any], intent_data: Dict[str, Any], contact: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a basic email draft without AI"""
        club_summary = club_info.get('summary', '')
        support_type = intent_data.get('support_type', 'sponsorship')
        description = intent_data.get('description', '')
        
        contact_name = contact.get('name', '')
        contact_title = contact.get('title', '')
        company_name = contact.get('companyName', '')
        
        # Generate subject line
        subject = f"{support_type.title()} Opportunity: {company_name}"
        
        # Generate basic email body
        body = f"""Hi {contact_name},

I hope this email finds you well! I'm reaching out on behalf of our student club at the university.

{club_summary}

{description}

Given your role as {contact_title} at {company_name}, I believe there could be a great opportunity for collaboration. We'd love to discuss how {company_name} could support our initiative.

Would you be interested in scheduling a brief call to discuss this opportunity further? I'd be happy to share more details about our event and explore ways we could work together.

Thank you for your time, and I look forward to hearing from you!

Best regards,
[Your Name]
[Club Name]"""

        return {
            'id': str(uuid.uuid4()),
            'contact': contact,
            'subject': subject,
            'body': body,
            'status': 'draft'
        }
    
    def _generate_mock_emails(self, club_info: Dict[str, Any], intent_data: Dict[str, Any], contacts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate mock email drafts for demonstration"""
        emails = []
        
        for i, contact in enumerate(contacts):
            email_draft = {
                'id': str(uuid.uuid4()),
                'contact': contact,
                'subject': f"Partnership Opportunity: {contact.get('companyName', 'Company')}",
                'body': f"""Hi {contact.get('name', 'there')},

I hope this email finds you well! I'm reaching out on behalf of our student club at the university.

{club_info.get('summary', 'We are a student organization focused on innovation and community impact.')}

{intent_data.get('description', 'We are looking for sponsorship support for our upcoming event.')}

Given your role as {contact.get('title', 'a key decision maker')} at {contact.get('companyName', 'your company')}, I believe there could be a great opportunity for collaboration.

Would you be interested in scheduling a brief call to discuss this opportunity further?

Thank you for your time!

Best regards,
[Your Name]""",
                'status': 'draft'
            }
            emails.append(email_draft)
        
        return emails




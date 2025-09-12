from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import hashlib
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'agentic-clubs-backend-simple'
    })

@app.route('/process-documents', methods=['POST'])
def process_documents():
    """Process uploaded club documents and generate summary with caching"""
    try:
        if 'documents' not in request.files:
            return jsonify({'success': False, 'error': 'No documents provided'}), 400
        
        files = request.files.getlist('documents')
        if not files or files[0].filename == '':
            return jsonify({'success': False, 'error': 'No files selected'}), 400
        
        # For now, just return a mock summary
        # In the full version, this would process the actual documents
        mock_summary = "This is a mock summary of the uploaded club documents. The full system would use AI to analyze the content and generate a comprehensive summary."
        
        # Generate a simple hash for demonstration
        content_hash = hashlib.sha256(f"mock_{datetime.now().isoformat()}".encode()).hexdigest()
        
        return jsonify({
            'success': True,
            'summary': mock_summary,
            'hash': content_hash,
            'cached': False,
            'documents_processed': len(files)
        })
        
    except Exception as e:
        app.logger.error(f"Error processing documents: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/parse-intent', methods=['POST'])
def parse_intent():
    """Parse user's sponsorship request into structured data"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        description = data.get('description', '')
        club_summary = data.get('clubSummary', '')
        
        if not description:
            return jsonify({'success': False, 'error': 'No description provided'}), 400
        
        # Mock intent parsing - in full version this would use GPT-4
        mock_intent = {
            'industries': ['healthtech', 'fintech', 'edtech'],
            'support_type': 'sponsorship',
            'contact_roles': ['partnerships manager', 'community manager', 'marketing director'],
            'event_type': 'design sprint',
            'target_audience': 'university students',
            'timeline': 'this semester',
            'budget_range': 'flexible'
        }
        
        return jsonify({
            'success': True,
            'cached': False,
            **mock_intent
        })
        
    except Exception as e:
        app.logger.error(f"Error parsing intent: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/discover-companies', methods=['POST'])
def discover_companies():
    """Discover relevant companies based on parsed intent"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Mock company discovery - in full version this would use Crunchbase/Apollo APIs
        mock_companies = [
            {
                'id': '1',
                'name': 'HealthTech Solutions',
                'industry': 'healthtech',
                'description': 'Innovative mental health technology platform helping students access counseling services',
                'website': 'https://healthtechsolutions.com',
                'size': '50-100 employees',
                'location': 'San Francisco, CA'
            },
            {
                'id': '2',
                'name': 'MindfulAI',
                'industry': 'healthtech',
                'description': 'AI-powered mental wellness app with personalized meditation and stress management',
                'website': 'https://mindfulai.com',
                'size': '10-50 employees',
                'location': 'Austin, TX'
            },
            {
                'id': '3',
                'name': 'FinFlow',
                'industry': 'fintech',
                'description': 'Digital payment solutions for educational institutions and student services',
                'website': 'https://finflow.com',
                'size': '100-500 employees',
                'location': 'New York, NY'
            }
        ]
        
        return jsonify({
            'success': True,
            'companies': mock_companies,
            'cached': False
        })
        
    except Exception as e:
        app.logger.error(f"Error discovering companies: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/discover-contacts', methods=['POST'])
def discover_contacts():
    """Discover contacts at selected companies"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        companies = data.get('companies', [])
        if not companies:
            return jsonify({'success': False, 'error': 'No companies provided'}), 400
        
        # Mock contact discovery - in full version this would use Apollo/Hunter APIs
        mock_contacts = [
            {
                'id': '1',
                'name': 'Sarah Johnson',
                'title': 'Partnerships Manager',
                'email': 'sarah.johnson@healthtechsolutions.com',
                'companyId': '1',
                'companyName': 'HealthTech Solutions'
            },
            {
                'id': '2',
                'name': 'Michael Chen',
                'title': 'Community Lead',
                'email': 'michael.chen@healthtechsolutions.com',
                'companyId': '1',
                'companyName': 'HealthTech Solutions'
            },
            {
                'id': '3',
                'name': 'Emily Rodriguez',
                'title': 'Marketing Director',
                'email': 'emily.rodriguez@mindfulai.com',
                'companyId': '2',
                'companyName': 'MindfulAI'
            }
        ]
        
        return jsonify({
            'success': True,
            'contacts': mock_contacts,
            'cached': False
        })
        
    except Exception as e:
        app.logger.error(f"Error discovering contacts: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/generate-emails', methods=['POST'])
def generate_emails():
    """Generate personalized email drafts using AI"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        club_info = data.get('clubInfo', {})
        intent_data = data.get('intentData', {})
        contacts = data.get('contacts', [])
        
        if not contacts:
            return jsonify({'success': False, 'error': 'No contacts provided'}), 400
        
        # Mock email generation - in full version this would use GPT-4
        mock_emails = []
        for i, contact in enumerate(contacts):
            email_draft = {
                'id': f'email_{i+1}',
                'contact': contact,
                'subject': f'Partnership Opportunity: {contact.get("companyName", "Company")}',
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
            mock_emails.append(email_draft)
        
        return jsonify({
            'success': True,
            'emails': mock_emails,
            'cached': False
        })
        
    except Exception as e:
        app.logger.error(f"Error generating emails: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/send-email', methods=['POST'])
def send_email():
    """Send email through Gmail API"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Mock email sending - in full version this would integrate with Gmail API
        return jsonify({
            'success': True,
            'message': 'Email sent successfully (mock)',
            'email_id': 'mock_email_id'
        })
        
    except Exception as e:
        app.logger.error(f"Error sending email: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"🚀 Starting Agentic Clubs Backend (Simple Version)")
    print(f"📡 Server will be available at: http://localhost:{port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"💡 This is a simplified version for demonstration purposes")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )

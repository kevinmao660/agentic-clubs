from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import hashlib
import json
import redis
from datetime import datetime
import openai
from document_processor import DocumentProcessor
from intent_parser import IntentParser
from company_discovery import CompanyDiscovery
from contact_discovery import ContactDiscovery
from email_generator import EmailGenerator
from cache_manager import CacheManager

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize services
cache_manager = CacheManager()
document_processor = DocumentProcessor()
intent_parser = IntentParser()
company_discovery = CompanyDiscovery()
contact_discovery = ContactDiscovery()
email_generator = EmailGenerator()

# Initialize OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY', 'your-openai-api-key-here')

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'agentic-clubs-backend'
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
        
        # Process documents and generate hash
        documents_data = []
        combined_text = ""
        
        for file in files:
            if file and file.filename:
                # Extract text from document
                text = document_processor.extract_text(file)
                documents_data.append({
                    'filename': file.filename,
                    'text': text,
                    'size': len(text)
                })
                combined_text += text + "\n\n"
        
        # Generate hash for caching
        content_hash = hashlib.sha256(combined_text.encode()).hexdigest()
        
        # Check cache first
        cached_summary = cache_manager.get_document_summary(content_hash)
        if cached_summary:
            return jsonify({
                'success': True,
                'summary': cached_summary,
                'hash': content_hash,
                'cached': True,
                'documents_processed': len(documents_data)
            })
        
        # Generate new summary using OpenAI
        summary = document_processor.generate_summary(combined_text)
        
        # Cache the result
        cache_manager.cache_document_summary(content_hash, summary)
        
        return jsonify({
            'success': True,
            'summary': summary,
            'hash': content_hash,
            'cached': False,
            'documents_processed': len(documents_data)
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
        
        # Check cache first
        cache_key = f"intent:{hashlib.sha256(description.encode()).hexdigest()}"
        cached_intent = cache_manager.get_intent_parse(cache_key)
        if cached_intent:
            return jsonify({
                'success': True,
                'cached': True,
                **cached_intent
            })
        
        # Parse intent using OpenAI
        parsed_intent = intent_parser.parse_intent(description, club_summary)
        
        # Cache the result
        cache_manager.cache_intent_parse(cache_key, parsed_intent)
        
        return jsonify({
            'success': True,
            'cached': False,
            **parsed_intent
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
        
        # Check cache first
        cache_key = f"companies:{hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()}"
        cached_companies = cache_manager.get_companies(cache_key)
        if cached_companies:
            return jsonify({
                'success': True,
                'companies': cached_companies,
                'cached': True
            })
        
        # Discover companies
        companies = company_discovery.discover_companies(data)
        
        # Cache the result
        cache_manager.cache_companies(cache_key, companies)
        
        return jsonify({
            'success': True,
            'companies': companies,
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
        
        # Check cache first
        cache_key = f"contacts:{hashlib.sha256(json.dumps(companies, sort_keys=True).encode()).hexdigest()}"
        cached_contacts = cache_manager.get_contacts(cache_key)
        if cached_contacts:
            return jsonify({
                'success': True,
                'contacts': cached_contacts,
                'cached': True
            })
        
        # Discover contacts
        contacts = contact_discovery.discover_contacts(companies)
        
        # Cache the result
        cache_manager.cache_contacts(cache_key, contacts)
        
        return jsonify({
            'success': True,
            'contacts': contacts,
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
        
        # Check cache first
        cache_key = f"emails:{hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()}"
        cached_emails = cache_manager.get_emails(cache_key)
        if cached_emails:
            return jsonify({
                'success': True,
                'emails': cached_emails,
                'cached': True
            })
        
        # Generate emails
        emails = email_generator.generate_emails(club_info, intent_data, contacts)
        
        # Cache the result
        cache_manager.cache_emails(cache_key, emails)
        
        return jsonify({
            'success': True,
            'emails': emails,
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
        
        # This would integrate with Gmail API
        # For now, return success
        return jsonify({
            'success': True,
            'message': 'Email sent successfully',
            'email_id': 'mock_email_id'
        })
        
    except Exception as e:
        app.logger.error(f"Error sending email: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/cache/clear', methods=['POST'])
def clear_cache():
    """Clear all cached data"""
    try:
        cache_manager.clear_all()
        return jsonify({
            'success': True,
            'message': 'Cache cleared successfully'
        })
    except Exception as e:
        app.logger.error(f"Error clearing cache: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/cache/stats', methods=['GET'])
def cache_stats():
    """Get cache statistics"""
    try:
        stats = cache_manager.get_stats()
        return jsonify({
            'success': True,
            'stats': stats
        })
    except Exception as e:
        app.logger.error(f"Error getting cache stats: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )

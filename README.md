# Agentic Clubs - AI-Powered Sponsorship Outreach System

An intelligent system that helps student clubs streamline their sponsorship outreach process using AI. The system automatically finds suitable companies, identifies key contacts, and drafts personalized outreach emails with smart caching to minimize redundant operations.

## Features

### Core Workflow

1. **Smart Document Processing** - Upload club documents and get AI-powered summaries with intelligent caching
2. **Intent Parsing** - Convert natural language requests into structured data using GPT-4
3. **Company Discovery** - Find relevant companies using Crunchbase, Apollo, and other data sources
4. **Contact Discovery** - Identify key decision-makers at target companies
5. **Personalized Email Generation** - Create tailored outreach emails using AI
6. **Review & Send** - Review drafts and send through Gmail integration

### Key Benefits

- **Generality**: Works for any club (any industry or focus) by dynamically using the club's info
- **Efficiency**: Smart caching avoids repeated heavy computations and API calls
- **Human-in-the-Loop**: AI drafts emails, but final sending requires human approval
- **Integration-Friendly**: Built as a web application with external API support

## 🏗️ Architecture

### Frontend

- **Next.js 14** with TypeScript and Tailwind CSS
- Modern, responsive UI with drag-and-drop file uploads
- Step-by-step workflow interface
- Real-time progress tracking

### Backend

- **Python Flask** for AI processing and data extraction
- **Node.js/Next.js API routes** for orchestration and web services
- **Redis** for intelligent caching of AI responses and processed data
- **MongoDB** for data persistence (optional)

### AI & Data Sources

- **OpenAI GPT-4** for document summarization, intent parsing, and email generation
- **Crunchbase API** for company discovery and firmographic data
- **Apollo.io API** for contact discovery and professional data
- **Hunter.io API** for email finding and verification
- **Gmail API** for email sending and integration

## 🛠️ Installation

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Redis server
- MongoDB (optional)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd agentic-clubs
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp env.example .env.local
```

Edit `.env.local` with your API keys:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# External API Keys
CRUNCHBASE_API_KEY=your_crunchbase_api_key_here
APOLLO_API_KEY=your_apollo_api_key_here
HUNTER_API_KEY=your_hunter_api_key_here

# Gmail OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/agentic-clubs
REDIS_URL=redis://localhost:6379
```

### 4. Start Services

```bash
# Start Redis (in a separate terminal)
redis-server

# Start the Python backend (in a separate terminal)
npm run python:dev

# Start the Next.js frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## 📖 Usage

### 1. Upload Club Documents

- Drag and drop or select club documents (PDF, Word, TXT)
- System automatically extracts text and generates AI summaries
- Smart caching prevents reprocessing unchanged documents

### 2. Define Your Sponsorship Request

- Describe what you're looking for in natural language
- AI parses your request into structured data (industries, support type, contact roles)
- System suggests improvements for better targeting

### 3. Discover Companies

- AI finds relevant companies based on your criteria
- Results include company descriptions, websites, and industry classifications
- Select companies that align with your outreach goals

### 4. Find Key Contacts

- System identifies decision-makers at each company
- Uses professional databases and smart scraping
- Provides contact names, titles, and email addresses

### 5. Generate Personalized Emails

- AI creates tailored outreach emails for each contact
- Emails reference company mission and contact role
- Professional yet friendly tone suitable for student outreach

### 6. Review and Send

- Review each email draft before sending
- Edit content if needed
- Send directly through Gmail integration or copy for manual sending

## 🔧 Configuration

### API Keys Setup

#### OpenAI

1. Sign up at [OpenAI](https://openai.com)
2. Generate an API key
3. Add to `.env.local`

#### Crunchbase

1. Sign up for [Crunchbase Pro](https://www.crunchbase.com/pro)
2. Generate API key
3. Add to `.env.local`

#### Apollo.io

1. Sign up at [Apollo.io](https://apollo.io)
2. Generate API key
3. Add to `.env.local`

#### Hunter.io

1. Sign up at [Hunter.io](https://hunter.io)
2. Generate API key
3. Add to `.env.local`

#### Gmail OAuth

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Gmail API
3. Create OAuth 2.0 credentials
4. Add client ID and secret to `.env.local`

### Caching Configuration

The system uses Redis for intelligent caching with configurable expiration times:

- Document summaries: 24 hours
- Intent parsing: 12 hours
- Company discovery: 6 hours
- Contact discovery: 6 hours
- Email drafts: 2 hours

## 🧪 Development

### Project Structure

```
agentic-clubs/
├── app/                    # Next.js frontend
│   ├── dashboard/         # Main workflow interface
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/             # React components
│   ├── DocumentUpload.tsx # Document processing
│   ├── IntentParser.tsx   # Intent analysis
│   ├── CompanyDiscovery.tsx # Company finding
│   ├── ContactDiscovery.tsx # Contact finding
│   ├── EmailGeneration.tsx # Email creation
│   └── EmailReview.tsx    # Email review/sending
├── backend/                # Python backend
│   ├── app.py             # Main Flask application
│   ├── cache_manager.py   # Redis caching
│   ├── document_processor.py # Document processing
│   ├── intent_parser.py   # Intent analysis
│   ├── company_discovery.py # Company discovery
│   ├── contact_discovery.py # Contact finding
│   └── email_generator.py # Email generation
├── package.json            # Node.js dependencies
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend
python -m pytest
```

### Code Quality

```bash
# Frontend linting
npm run lint

# Backend formatting
cd backend
black .
isort .
```

## 🚀 Deployment

### Production Build

```bash
# Build the Next.js application
npm run build

# Start production server
npm start
```

### Docker Deployment

```dockerfile
# Example Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables

Ensure all required environment variables are set in production:

- API keys for external services
- Database connection strings
- OAuth credentials
- JWT secrets

## 🔒 Security Considerations

- API keys are stored securely in environment variables
- User data is processed securely with proper validation
- Gmail OAuth follows Google's security guidelines
- Document processing includes input validation and sanitization
- Rate limiting is implemented for external API calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation for common solutions
- Review the troubleshooting guide

## 🔮 Roadmap

### Phase 2 Features

- Advanced analytics and outreach tracking
- CRM integration for relationship management
- Multi-language support
- Advanced email templates and A/B testing
- Integration with more data sources

### Phase 3 Features

- Machine learning for response prediction
- Automated follow-up sequences
- Advanced reporting and insights
- Mobile application
- Enterprise features for universities

## 🙏 Acknowledgments

- OpenAI for GPT-4 API access
- Crunchbase, Apollo.io, and Hunter.io for data APIs
- Google for Gmail API integration
- The open-source community for various libraries and tools

---

Built with ❤️ for student organizations everywhere.




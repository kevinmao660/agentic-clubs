import os
import requests
import json
from typing import List, Dict, Any
import time

class CompanyDiscovery:
    def __init__(self):
        """Initialize company discovery service"""
        self.crunchbase_key = os.getenv('CRUNCHBASE_API_KEY')
        self.apollo_key = os.getenv('APOLLO_API_KEY')
        
        # Mock data for demonstration
        self.mock_companies = {
            'healthtech': [
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
                }
            ],
            'fintech': [
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
        }
    
    def discover_companies(self, intent_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Discover companies based on parsed intent"""
        try:
            industries = intent_data.get('industries', [])
            support_type = intent_data.get('support_type', 'sponsorship')
            
            if not industries:
                return []
            
            companies = []
            
            # Try to use real APIs first
            for industry in industries:
                industry_companies = self._search_crunchbase(industry, support_type)
                if industry_companies:
                    companies.extend(industry_companies)
                
                # Also try Apollo for additional data
                apollo_companies = self._search_apollo(industry, support_type)
                if apollo_companies:
                    companies.extend(apollo_companies)
            
            # Remove duplicates and limit results
            unique_companies = self._deduplicate_companies(companies)
            return unique_companies[:20]  # Limit to 20 companies
            
        except Exception as e:
            print(f"Company discovery failed: {str(e)}")
            # Return mock data as fallback
            return self._get_mock_companies(intent_data)
    
    def _search_crunchbase(self, industry: str, support_type: str) -> List[Dict[str, Any]]:
        """Search Crunchbase API for companies"""
        if not self.crunchbase_key:
            return []
        
        try:
            # This would be the actual Crunchbase API call
            # For now, return empty list
            return []
        except Exception as e:
            print(f"Crunchbase search failed: {str(e)}")
            return []
    
    def _search_apollo(self, industry: str, support_type: str) -> List[Dict[str, Any]]:
        """Search Apollo API for companies"""
        if not self.apollo_key:
            return []
        
        try:
            # This would be the actual Apollo API call
            # For now, return empty list
            return []
        except Exception as e:
            print(f"Apollo search failed: {str(e)}")
            return []
    
    def _get_mock_companies(self, intent_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get mock companies for demonstration"""
        industries = intent_data.get('industries', [])
        companies = []
        
        for industry in industries:
            if industry in self.mock_companies:
                companies.extend(self.mock_companies[industry])
        
        return companies
    
    def _deduplicate_companies(self, companies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate companies based on name and website"""
        seen = set()
        unique = []
        
        for company in companies:
            identifier = f"{company.get('name', '').lower()}_{company.get('website', '').lower()}"
            if identifier not in seen:
                seen.add(identifier)
                unique.append(company)
        
        return unique







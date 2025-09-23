import os
import requests
import json
from typing import List, Dict, Any
import re

class ContactDiscovery:
    def __init__(self):
        """Initialize contact discovery service"""
        self.apollo_key = os.getenv('APOLLO_API_KEY')
        self.hunter_key = os.getenv('HUNTER_API_KEY')
        
        # Mock contacts for demonstration
        self.mock_contacts = {
            'HealthTech Solutions': [
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
                }
            ],
            'MindfulAI': [
                {
                    'id': '3',
                    'name': 'Emily Rodriguez',
                    'title': 'Marketing Director',
                    'email': 'emily.rodriguez@mindfulai.com',
                    'companyId': '2',
                    'companyName': 'MindfulAI'
                }
            ]
        }
    
    def discover_contacts(self, companies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Discover contacts at the given companies"""
        try:
            contacts = []
            
            for company in companies:
                company_contacts = self._find_company_contacts(company)
                contacts.extend(company_contacts)
            
            return contacts
            
        except Exception as e:
            print(f"Contact discovery failed: {str(e)}")
            return self._get_mock_contacts(companies)
    
    def _find_company_contacts(self, company: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find contacts at a specific company"""
        company_name = company.get('name', '')
        company_id = company.get('id', '')
        website = company.get('website', '')
        
        contacts = []
        
        # Try Apollo API first
        apollo_contacts = self._search_apollo(company_name, website)
        if apollo_contacts:
            contacts.extend(apollo_contacts)
        
        # Try Hunter API for email discovery
        hunter_contacts = self._search_hunter(company_name, website)
        if hunter_contacts:
            contacts.extend(hunter_contacts)
        
        # If no contacts found, try to generate mock contacts
        if not contacts:
            contacts = self._generate_mock_contacts(company)
        
        # Add company information to contacts
        for contact in contacts:
            contact['companyId'] = company_id
            contact['companyName'] = company_name
        
        return contacts[:3]  # Limit to 3 contacts per company
    
    def _search_apollo(self, company_name: str, website: str) -> List[Dict[str, Any]]:
        """Search Apollo API for company contacts"""
        if not self.apollo_key:
            return []
        
        try:
            # This would be the actual Apollo API call
            # For now, return empty list
            return []
        except Exception as e:
            print(f"Apollo search failed: {str(e)}")
            return []
    
    def _search_hunter(self, company_name: str, website: str) -> List[Dict[str, Any]]:
        """Search Hunter API for company emails"""
        if not self.hunter_key or not website:
            return []
        
        try:
            # Extract domain from website
            domain = self._extract_domain(website)
            if not domain:
                return []
            
            # This would be the actual Hunter API call
            # For now, return empty list
            return []
            
        except Exception as e:
            print(f"Hunter search failed: {str(e)}")
            return []
    
    def _extract_domain(self, website: str) -> str:
        """Extract domain from website URL"""
        try:
            # Remove protocol and path
            domain = website.replace('https://', '').replace('http://', '')
            domain = domain.split('/')[0]
            return domain
        except Exception:
            return ""
    
    def _generate_mock_contacts(self, company: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate mock contacts for demonstration"""
        company_name = company.get('name', '')
        
        if company_name in self.mock_contacts:
            return self.mock_contacts[company_name]
        
        # Generate generic contacts
        return [
            {
                'id': f"mock_{company.get('id', '1')}_1",
                'name': 'John Doe',
                'title': 'Partnerships Manager',
                'email': f"partnerships@{self._extract_domain(company.get('website', 'company.com'))}",
                'companyId': company.get('id', '1'),
                'companyName': company_name
            }
        ]
    
    def _get_mock_contacts(self, companies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get mock contacts for demonstration"""
        contacts = []
        
        for company in companies:
            company_name = company.get('name', '')
            if company_name in self.mock_contacts:
                contacts.extend(self.mock_contacts[company_name])
        
        return contacts







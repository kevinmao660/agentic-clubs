'use client'

import { useState, useEffect } from 'react'
import { 
  BuildingOfficeIcon, 
  MagnifyingGlassIcon,
  GlobeAltIcon,
  MapPinIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { IntentData, Company } from '@/app/dashboard/page'

interface CompanyDiscoveryProps {
  intentData: IntentData
  onComplete: (data: Company[]) => void
}

export default function CompanyDiscovery({ intentData, onComplete }: CompanyDiscoveryProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchProgress, setSearchProgress] = useState(0)
  const [error, setError] = useState('')
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set())

  // Mock companies for demonstration - in real app, these would come from APIs
  const mockCompanies: Company[] = [
    {
      id: '1',
      name: 'HealthTech Solutions',
      industry: 'healthtech',
      description: 'Innovative mental health technology platform helping students access counseling services',
      website: 'https://healthtechsolutions.com',
      size: '50-100 employees',
      location: 'San Francisco, CA'
    },
    {
      id: '2',
      name: 'MindfulAI',
      industry: 'healthtech',
      description: 'AI-powered mental wellness app with personalized meditation and stress management',
      website: 'https://mindfulai.com',
      size: '10-50 employees',
      location: 'Austin, TX'
    },
    {
      id: '3',
      name: 'StudentWell',
      industry: 'healthtech',
      description: 'Digital mental health platform specifically designed for college students',
      website: 'https://studentwell.com',
      size: '50-100 employees',
      location: 'Boston, MA'
    },
    {
      id: '4',
      name: 'CampusCare',
      industry: 'healthtech',
      description: 'Comprehensive student health and wellness solutions for universities',
      website: 'https://campuscare.com',
      size: '100-500 employees',
      location: 'New York, NY'
    },
    {
      id: '5',
      name: 'WellnessWorks',
      industry: 'healthtech',
      description: 'Corporate wellness platform with focus on mental health and stress reduction',
      website: 'https://wellnessworks.com',
      size: '50-100 employees',
      location: 'Seattle, WA'
    }
  ]

  const discoverCompanies = async () => {
    setIsSearching(true)
    setError('')
    setSearchProgress(0)

    try {
      // Simulate API call with progress updates
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 10
        })
      }, 200)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      clearInterval(progressInterval)
      setSearchProgress(100)
      
      // In real app, this would call the Python backend
      // const response = await fetch('/api/python/discover-companies', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(intentData)
      // })
      
      // For now, use mock data
      setCompanies(mockCompanies)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discover companies')
    } finally {
      setIsSearching(false)
    }
  }

  const toggleCompanySelection = (companyId: string) => {
    const newSelected = new Set(selectedCompanies)
    if (newSelected.has(companyId)) {
      newSelected.delete(companyId)
    } else {
      newSelected.add(companyId)
    }
    setSelectedCompanies(newSelected)
  }

  const handleContinue = () => {
    const selected = companies.filter(company => selectedCompanies.has(company.id))
    onComplete(selected)
  }

  const getIndustryIcon = (industry: string) => {
    switch (industry.toLowerCase()) {
      case 'healthtech':
        return '🏥'
      case 'fintech':
        return '💰'
      case 'edtech':
        return '🎓'
      case 'sustainability':
        return '🌱'
      default:
        return '🏢'
    }
  }

  useEffect(() => {
    // Auto-start discovery when component mounts
    discoverCompanies()
  }, [])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Discover Relevant Companies</h2>
        <p className="text-gray-600">
          Based on your request, we'll find companies that match your criteria for sponsorship outreach.
        </p>
      </div>

      {/* Intent Summary */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Your Sponsorship Request</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Industries:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {intentData.industries.map((industry, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {industry}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="font-medium text-blue-800">Support Type:</span>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {intentData.supportType}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Target Roles:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {intentData.contactRoles.map((role, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search Progress */}
      {isSearching && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <ClockIcon className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Discovering Companies...</span>
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div 
              className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${searchProgress}%` }}
            ></div>
          </div>
          <p className="text-yellow-700 text-sm mt-2">
            Searching Crunchbase, Apollo, and other data sources...
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <button
            onClick={discoverCompanies}
            className="mt-2 btn-primary text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Companies List */}
      {companies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Found {companies.length} Companies
            </h3>
            <div className="text-sm text-gray-600">
              {selectedCompanies.size} of {companies.length} selected
            </div>
          </div>

          <div className="space-y-3">
            {companies.map((company) => (
              <div
                key={company.id}
                className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                  selectedCompanies.has(company.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleCompanySelection(company.id)}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.has(company.id)}
                    onChange={() => toggleCompanySelection(company.id)}
                    className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{getIndustryIcon(company.industry)}</span>
                      <h4 className="font-semibold text-gray-900">{company.name}</h4>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {company.industry}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{company.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <GlobeAltIcon className="h-4 w-4" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Website
                        </a>
                      </div>
                      {company.location && (
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{company.location}</span>
                        </div>
                      )}
                      {company.size && (
                        <div className="flex items-center space-x-1">
                          <UsersIcon className="h-4 w-4" />
                          <span>{company.size}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {companies.length === 0 && !isSearching && (
          <button
            onClick={discoverCompanies}
            className="btn-primary flex items-center space-x-2"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span>Discover Companies</span>
          </button>
        )}
        
        {companies.length > 0 && selectedCompanies.size > 0 && (
          <button
            onClick={handleContinue}
            className="btn-primary"
          >
            Continue with {selectedCompanies.size} Companies
          </button>
        )}
      </div>

      {/* Instructions */}
      {companies.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          <p>Select the companies you'd like to reach out to for sponsorship.</p>
          <p className="mt-1">You can select multiple companies to contact in your outreach campaign.</p>
        </div>
      )}
    </div>
  )
}







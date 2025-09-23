'use client'

import { useState, useEffect } from 'react'
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Company, Contact } from '@/app/dashboard/page'

interface ContactDiscoveryProps {
  companies: Company[]
  onComplete: (data: Contact[]) => void
}

export default function ContactDiscovery({ companies, onComplete }: ContactDiscoveryProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchProgress, setSearchProgress] = useState(0)
  const [error, setError] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())

  // Mock contacts for demonstration - in real app, these would come from Apollo/Hunter APIs
  const mockContacts: Contact[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      title: 'Partnerships Manager',
      email: 'sarah.johnson@healthtechsolutions.com',
      companyId: '1',
      companyName: 'HealthTech Solutions'
    },
    {
      id: '2',
      name: 'Michael Chen',
      title: 'Community Lead',
      email: 'michael.chen@healthtechsolutions.com',
      companyId: '1',
      companyName: 'HealthTech Solutions'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      title: 'Marketing Director',
      email: 'emily.rodriguez@mindfulai.com',
      companyId: '2',
      companyName: 'MindfulAI'
    },
    {
      id: '4',
      name: 'David Kim',
      title: 'Founder & CEO',
      email: 'david.kim@mindfulai.com',
      companyId: '2',
      companyName: 'MindfulAI'
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      title: 'Partnerships Director',
      email: 'lisa.thompson@studentwell.com',
      companyId: '3',
      companyName: 'StudentWell'
    },
    {
      id: '6',
      name: 'James Wilson',
      title: 'Community Manager',
      email: 'james.wilson@studentwell.com',
      companyId: '3',
      companyName: 'StudentWell'
    },
    {
      id: '7',
      name: 'Amanda Foster',
      title: 'Strategic Partnerships',
      email: 'amanda.foster@campuscare.com',
      companyId: '4',
      companyName: 'CampusCare'
    },
    {
      id: '8',
      name: 'Robert Davis',
      title: 'Marketing Manager',
      email: 'robert.davis@wellnessworks.com',
      companyId: '5',
      companyName: 'WellnessWorks'
    }
  ]

  const discoverContacts = async () => {
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
          return prev + 15
        })
      }, 300)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      clearInterval(progressInterval)
      setSearchProgress(100)
      
      // In real app, this would call the Python backend
      // const response = await fetch('/api/python/discover-contacts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ companies })
      // })
      
      // For now, use mock data
      setContacts(mockContacts)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discover contacts')
    } finally {
      setIsSearching(false)
    }
  }

  const toggleContactSelection = (contactId: string) => {
    const newSelected = new Set(selectedContacts)
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId)
    } else {
      newSelected.add(contactId)
    }
    setSelectedContacts(newSelected)
  }

  const handleContinue = () => {
    const selected = contacts.filter(contact => selectedContacts.has(contact.id))
    onComplete(selected)
  }

  const getContactsByCompany = (companyId: string) => {
    return contacts.filter(contact => contact.companyId === companyId)
  }

  const getRoleIcon = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('partnership')) return '🤝'
    if (lowerTitle.includes('community')) return '👥'
    if (lowerTitle.includes('marketing')) return '📢'
    if (lowerTitle.includes('founder') || lowerTitle.includes('ceo')) return '👑'
    if (lowerTitle.includes('manager')) return '💼'
    return '👤'
  }

  useEffect(() => {
    // Auto-start discovery when component mounts
    discoverContacts()
  }, [])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Key Contacts</h2>
        <p className="text-gray-600">
          We'll identify the right people at each company to contact for your sponsorship request.
        </p>
      </div>

      {/* Companies Summary */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Target Companies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {companies.map((company) => (
            <div key={company.id} className="flex items-center space-x-2">
              <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">{company.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search Progress */}
      {isSearching && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <ClockIcon className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Finding Contacts...</span>
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div 
              className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${searchProgress}%` }}
            ></div>
          </div>
          <p className="text-yellow-700 text-sm mt-2">
            Searching Apollo.io, Hunter.io, and LinkedIn for key decision-makers...
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <button
            onClick={discoverContacts}
            className="mt-2 btn-primary text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Contacts by Company */}
      {contacts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Found {contacts.length} Contacts
            </h3>
            <div className="text-sm text-gray-600">
              {selectedContacts.size} of {contacts.length} selected
            </div>
          </div>

          {companies.map((company) => {
            const companyContacts = getContactsByCompany(company.id)
            if (companyContacts.length === 0) return null

            return (
              <div key={company.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">{company.name}</h4>
                  <p className="text-sm text-gray-600">{companyContacts.length} contacts found</p>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {companyContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-4 transition-all duration-200 cursor-pointer ${
                        selectedContacts.has(contact.id)
                          ? 'bg-primary-50 border-l-4 border-l-primary-500'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleContactSelection(contact.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedContacts.has(contact.id)}
                          onChange={() => toggleContactSelection(contact.id)}
                          className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xl">{getRoleIcon(contact.title)}</span>
                            <h5 className="font-medium text-gray-900">{contact.name}</h5>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {contact.title}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <EnvelopeIcon className="h-4 w-4" />
                              <span>{contact.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {contacts.length === 0 && !isSearching && (
          <button
            onClick={discoverContacts}
            className="btn-primary flex items-center space-x-2"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span>Find Contacts</span>
          </button>
        )}
        
        {contacts.length > 0 && selectedContacts.size > 0 && (
          <button
            onClick={handleContinue}
            className="btn-primary"
          >
            Continue with {selectedContacts.size} Contacts
          </button>
        )}
      </div>

      {/* Instructions */}
      {contacts.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          <p>Select the contacts you'd like to reach out to for sponsorship.</p>
          <p className="mt-1">We recommend selecting 1-2 contacts per company for the best results.</p>
        </div>
      )}
    </div>
  )
}







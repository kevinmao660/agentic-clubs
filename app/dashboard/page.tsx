'use client'

import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon, 
  MagnifyingGlassIcon, 
  UserGroupIcon, 
  EnvelopeIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import DocumentUpload from '@/components/DocumentUpload'
import IntentParser from '@/components/IntentParser'
import CompanyDiscovery from '@/components/CompanyDiscovery'
import ContactDiscovery from '@/components/ContactDiscovery'
import EmailGeneration from '@/components/EmailGeneration'
import EmailReview from '@/components/EmailReview'

export type WorkflowStep = 'upload' | 'intent' | 'companies' | 'contacts' | 'emails' | 'review'

export interface ClubInfo {
  summary: string
  documents: File[]
  hash: string
}

export interface IntentData {
  industries: string[]
  supportType: string
  contactRoles: string[]
  description: string
}

export interface Company {
  id: string
  name: string
  industry: string
  description: string
  website: string
  size?: string
  location?: string
}

export interface Contact {
  id: string
  name: string
  title: string
  email: string
  companyId: string
  companyName: string
}

export interface EmailDraft {
  id: string
  contact: Contact
  subject: string
  body: string
  status: 'draft' | 'sent' | 'failed'
}

export default function Dashboard() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload')
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null)
  const [intentData, setIntentData] = useState<IntentData | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [emailDrafts, setEmailDrafts] = useState<EmailDraft[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const workflowSteps = [
    { id: 'upload', title: 'Upload Documents', icon: DocumentTextIcon, description: 'Upload club documents' },
    { id: 'intent', title: 'Define Intent', icon: MagnifyingGlassIcon, description: 'Describe your sponsorship needs' },
    { id: 'companies', title: 'Find Companies', icon: RocketLaunchIcon, description: 'Discover relevant companies' },
    { id: 'contacts', title: 'Find Contacts', icon: UserGroupIcon, description: 'Identify key decision-makers' },
    { id: 'emails', title: 'Generate Emails', icon: EnvelopeIcon, description: 'Create personalized drafts' },
    { id: 'review', title: 'Review & Send', icon: CheckCircleIcon, description: 'Review and send emails' }
  ]

  const getStepStatus = (stepId: WorkflowStep) => {
    if (stepId === 'upload') return clubInfo ? 'completed' : 'pending'
    if (stepId === 'intent') return intentData ? 'completed' : 'pending'
    if (stepId === 'companies') return companies.length > 0 ? 'completed' : 'pending'
    if (stepId === 'contacts') return contacts.length > 0 ? 'completed' : 'pending'
    if (stepId === 'emails') return emailDrafts.length > 0 ? 'completed' : 'pending'
    if (stepId === 'review') return emailDrafts.some(d => d.status === 'sent') ? 'completed' : 'pending'
    return 'pending'
  }

  const canProceedToStep = (stepId: WorkflowStep) => {
    switch (stepId) {
      case 'upload':
        return true
      case 'intent':
        return clubInfo !== null
      case 'companies':
        return intentData !== null
      case 'contacts':
        return companies.length > 0
      case 'emails':
        return contacts.length > 0
      case 'review':
        return emailDrafts.length > 0
      default:
        return false
    }
  }

  const handleStepComplete = (step: WorkflowStep, data: any) => {
    switch (step) {
      case 'upload':
        setClubInfo(data)
        setCurrentStep('intent')
        break
      case 'intent':
        setIntentData(data)
        setCurrentStep('companies')
        break
      case 'companies':
        setCompanies(data)
        setCurrentStep('contacts')
        break
      case 'contacts':
        setContacts(data)
        setCurrentStep('emails')
        break
      case 'emails':
        setEmailDrafts(data)
        setCurrentStep('review')
        break
      case 'review':
        // Emails sent, workflow complete
        break
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return <DocumentUpload onComplete={(data) => handleStepComplete('upload', data)} />
      case 'intent':
        return <IntentParser clubInfo={clubInfo!} onComplete={(data) => handleStepComplete('intent', data)} />
      case 'companies':
        return <CompanyDiscovery intentData={intentData!} onComplete={(data) => handleStepComplete('companies', data)} />
      case 'contacts':
        return <ContactDiscovery companies={companies} onComplete={(data) => handleStepComplete('contacts', data)} />
      case 'emails':
        return <EmailGeneration clubInfo={clubInfo!} intentData={intentData!} contacts={contacts} onComplete={(data) => handleStepComplete('emails', data)} />
      case 'review':
        return <EmailReview emailDrafts={emailDrafts} onComplete={(data) => handleStepComplete('review', data)} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <RocketLaunchIcon className="h-8 w-8 text-primary-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">Agentic Clubs</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome to your sponsorship dashboard</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workflow Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Sponsorship Outreach Workflow</h1>
            <div className="text-sm text-gray-600">
              Step {workflowSteps.findIndex(s => s.id === currentStep) + 1} of {workflowSteps.length}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {workflowSteps.map((step, index) => {
              const status = getStepStatus(step.id as WorkflowStep)
              const canProceed = canProceedToStep(step.id as WorkflowStep)
              const isCurrent = step.id === currentStep
              
              return (
                <div
                  key={step.id}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    isCurrent
                      ? 'border-primary-600 bg-primary-50'
                      : status === 'completed'
                      ? 'border-green-500 bg-green-50'
                      : canProceed
                      ? 'border-gray-300 bg-white hover:border-primary-400'
                      : 'border-gray-200 bg-gray-100'
                  }`}
                  onClick={() => canProceed && setCurrentStep(step.id as WorkflowStep)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      status === 'completed'
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <h3 className={`text-sm font-medium ${
                      isCurrent ? 'text-primary-900' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Progress indicator */}
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                      <div className={`w-4 h-0.5 ${
                        status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  )
}







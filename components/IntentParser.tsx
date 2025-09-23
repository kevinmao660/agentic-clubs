'use client'

import { useState } from 'react'
import { 
  MagnifyingGlassIcon, 
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { ClubInfo, IntentData } from '@/app/dashboard/page'

interface IntentParserProps {
  clubInfo: ClubInfo
  onComplete: (data: IntentData) => void
}

export default function IntentParser({ clubInfo, onComplete }: IntentParserProps) {
  const [description, setDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedIntent, setParsedIntent] = useState<IntentData | null>(null)
  const [error, setError] = useState('')

  const exampleRequests = [
    "We're looking for sponsorships from healthtech startups for our mental health design sprint",
    "Need financial support from fintech companies for our blockchain hackathon",
    "Seeking partnerships with edtech companies to sponsor our coding bootcamp",
    "Looking for sponsors from sustainable energy companies for our green tech conference"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!description.trim()) {
      setError('Please describe what you\'re looking for')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const response = await fetch('/api/python/parse-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          clubSummary: clubInfo.summary
        })
      })

      if (!response.ok) {
        throw new Error('Failed to parse intent')
      }

      const data = await response.json()
      
      if (data.success) {
        const intent: IntentData = {
          industries: data.industries || [],
          supportType: data.support_type || 'sponsorship',
          contactRoles: data.contact_roles || [],
          description: description
        }
        
        setParsedIntent(intent)
        onComplete(intent)
      } else {
        setError(data.error || 'Failed to parse intent')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setDescription(example)
    setError('')
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Define Your Sponsorship Request</h2>
        <p className="text-gray-600">
          Describe what you're looking for in natural language. Our AI will extract the key details 
          to help find the right companies and contacts.
        </p>
      </div>

      {/* Club Summary Display */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Your Club Summary</h3>
        <p className="text-blue-800 text-sm leading-relaxed">{clubInfo.summary}</p>
      </div>

      {/* Intent Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="description" className="form-label">
            Describe what you're looking for
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., We're looking for sponsorships from healthtech startups for our mental health design sprint"
            className="input-field min-h-[120px] resize-none"
            disabled={isProcessing}
          />
          <p className="mt-2 text-sm text-gray-500">
            Be specific about industries, types of support, and any other relevant details.
          </p>
        </div>

        {/* Example Requests */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Example requests:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exampleRequests.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="p-3 text-left text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors duration-200"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Parsed Intent Display */}
        {parsedIntent && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-800">Intent Parsed Successfully</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-green-800 mb-1">Industries</h4>
                <div className="flex flex-wrap gap-1">
                  {parsedIntent.industries.map((industry, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-green-800 mb-1">Support Type</h4>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  {parsedIntent.supportType}
                </span>
              </div>
              
              <div>
                <h4 className="font-medium text-green-800 mb-1">Contact Roles</h4>
                <div className="flex flex-wrap gap-1">
                  {parsedIntent.contactRoles.map((role, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {!parsedIntent && (
            <button
              type="submit"
              disabled={isProcessing || !description.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <ClockIcon className="h-5 w-5 animate-spin" />
                  <span>Parsing...</span>
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  <span>Parse Intent</span>
                </>
              )}
            </button>
          )}
          
          {parsedIntent && (
            <button
              onClick={() => onComplete(parsedIntent)}
              className="btn-primary"
            >
              Continue to Company Discovery
            </button>
          )}
        </div>
      </form>

      {/* Processing Info */}
      {isProcessing && (
        <div className="text-center text-sm text-gray-600">
          <p>AI is analyzing your request and extracting key information...</p>
          <p className="mt-1">This helps us find the most relevant companies for your outreach.</p>
        </div>
      )}
    </div>
  )
}







'use client'

import { useState } from 'react'
import { 
  EnvelopeIcon, 
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { EmailDraft } from '@/app/dashboard/page'

interface EmailReviewProps {
  emailDrafts: EmailDraft[]
  onComplete: (data: any) => void
}

export default function EmailReview({ emailDrafts, onComplete }: EmailReviewProps) {
  const [selectedDrafts, setSelectedDrafts] = useState<Set<string>>(new Set())
  const [isSending, setIsSending] = useState(false)
  const [sendingProgress, setSendingProgress] = useState(0)
  const [sentEmails, setSentEmails] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState<string | null>(null)

  const toggleDraftSelection = (draftId: string) => {
    const newSelected = new Set(selectedDrafts)
    if (newSelected.has(draftId)) {
      newSelected.delete(draftId)
    } else {
      newSelected.add(draftId)
    }
    setSelectedDrafts(newSelected)
  }

  const sendEmails = async () => {
    if (selectedDrafts.size === 0) {
      setError('Please select at least one email to send')
      return
    }

    setIsSending(true)
    setError('')
    setSendingProgress(0)

    try {
      const selected = Array.from(selectedDrafts)
      
      // Simulate sending emails with progress updates
      for (let i = 0; i < selected.length; i++) {
        const draftId = selected[i]
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Update progress
        setSendingProgress(((i + 1) / selected.length) * 100)
        
        // Mark as sent
        setSentEmails(prev => new Set([...prev, draftId]))
        
        // In real app, this would call the Gmail API
        // const response = await fetch('/api/send-email', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ draftId, emailData: emailDrafts.find(d => d.id === draftId) })
        // })
      }
      
      // Workflow complete
      onComplete({ success: true, sentCount: selected.length })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send emails')
    } finally {
      setIsSending(false)
    }
  }

  const getStatusIcon = (draft: EmailDraft) => {
    if (sentEmails.has(draft.id)) {
      return <CheckCircleIcon className="h-5 w-5 text-green-600" />
    }
    if (isSending && selectedDrafts.has(draft.id)) {
      return <ClockIcon className="h-5 w-5 text-yellow-600 animate-spin" />
    }
    return <EnvelopeIcon className="h-5 w-5 text-gray-400" />
  }

  const getStatusText = (draft: EmailDraft) => {
    if (sentEmails.has(draft.id)) {
      return 'Sent'
    }
    if (isSending && selectedDrafts.has(draft.id)) {
      return 'Sending...'
    }
    return 'Ready to send'
  }

  const getStatusColor = (draft: EmailDraft) => {
    if (sentEmails.has(draft.id)) {
      return 'text-green-600 bg-green-50 border-green-200'
    }
    if (isSending && selectedDrafts.has(draft.id)) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const previewEmail = (draft: EmailDraft) => {
    setShowPreview(draft.id)
  }

  const closePreview = () => {
    setShowPreview(null)
  }

  const editEmail = (draft: EmailDraft) => {
    // In a real app, this would open an edit form
    console.log('Edit email:', draft)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Send Emails</h2>
        <p className="text-gray-600">
          Review your email drafts and send them to your selected contacts. You can edit emails before sending.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{emailDrafts.length}</div>
          <div className="text-sm text-blue-800">Total Drafts</div>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{sentEmails.size}</div>
          <div className="text-sm text-green-800">Emails Sent</div>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{emailDrafts.length - sentEmails.size}</div>
          <div className="text-sm text-purple-800">Remaining</div>
        </div>
      </div>

      {/* Sending Progress */}
      {isSending && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <ClockIcon className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Sending Emails...</span>
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div 
              className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${sendingProgress}%` }}
            ></div>
          </div>
          <p className="text-yellow-700 text-sm mt-2">
            Sending {selectedDrafts.size} emails through Gmail...
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Email Drafts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Email Drafts</h3>
          <div className="text-sm text-gray-600">
            {selectedDrafts.size} of {emailDrafts.length} selected
          </div>
        </div>

        <div className="space-y-3">
          {emailDrafts.map((draft) => (
            <div
              key={draft.id}
              className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                selectedDrafts.has(draft.id) && !sentEmails.has(draft.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  {!sentEmails.has(draft.id) && (
                    <input
                      type="checkbox"
                      checked={selectedDrafts.has(draft.id)}
                      onChange={() => toggleDraftSelection(draft.id)}
                      disabled={isSending}
                      className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{draft.contact.name}</h4>
                        <p className="text-sm text-gray-600">{draft.contact.title} at {draft.contact.companyName}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(draft)}`}>
                          {getStatusIcon(draft)} {getStatusText(draft)}
                        </span>
                        <button
                          onClick={() => previewEmail(draft)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          title="Preview email"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {!sentEmails.has(draft.id) && (
                          <button
                            onClick={() => editEmail(draft)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            title="Edit email"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-900 mb-1">Subject:</h5>
                      <p className="text-gray-700 text-sm">{draft.subject}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Email Preview:</h5>
                      <div className="bg-gray-50 p-3 rounded border text-sm text-gray-700 max-h-24 overflow-hidden">
                        {draft.body.substring(0, 150)}...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {!isSending && emailDrafts.length > 0 && selectedDrafts.size > 0 && (
          <button
            onClick={sendEmails}
            className="btn-primary flex items-center space-x-2"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            <span>Send {selectedDrafts.size} Emails</span>
          </button>
        )}
        
        {sentEmails.size > 0 && (
          <button
            onClick={() => onComplete({ success: true, sentCount: sentEmails.size })}
            className="btn-primary"
          >
            Complete Workflow
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600">
        <p>Select the emails you'd like to send and review them before sending.</p>
        <p className="mt-1">Once sent, emails cannot be edited. Make sure everything looks perfect!</p>
      </div>

      {/* Email Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
                <button
                  onClick={closePreview}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {(() => {
                const draft = emailDrafts.find(d => d.id === showPreview)
                if (!draft) return null
                
                return (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">To:</h4>
                      <p className="text-gray-700">{draft.contact.name} ({draft.contact.email})</p>
                      <p className="text-sm text-gray-600">{draft.contact.title} at {draft.contact.companyName}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Subject:</h4>
                      <p className="text-gray-700">{draft.subject}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Body:</h4>
                      <div className="bg-gray-50 p-4 rounded border text-gray-700 whitespace-pre-wrap">
                        {draft.body}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}







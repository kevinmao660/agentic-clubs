'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  DocumentTextIcon, 
  XMarkIcon, 
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { ClubInfo } from '@/app/dashboard/page'

interface DocumentUploadProps {
  onComplete: (data: ClubInfo) => void
}

export default function DocumentUpload({ onComplete }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [error, setError] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setDocuments(prev => [...prev, ...acceptedFiles])
    setError('')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    multiple: true
  })

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const processDocuments = async () => {
    if (documents.length === 0) {
      setError('Please upload at least one document')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const formData = new FormData()
      documents.forEach(doc => formData.append('documents', doc))

      const response = await fetch('/api/python/process-documents', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to process documents')
      }

      const data = await response.json()
      
      if (data.success) {
        setSummary(data.summary)
        
        // Create club info object
        const clubInfo: ClubInfo = {
          summary: data.summary,
          documents: documents,
          hash: data.hash
        }
        
        onComplete(clubInfo)
      } else {
        setError(data.error || 'Failed to process documents')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return '📄'
    if (file.type.includes('word')) return '📝'
    if (file.type === 'text/plain') return '📃'
    return '📄'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Club Documents</h2>
        <p className="text-gray-600">
          Upload documents about your club to help AI understand your mission, activities, and achievements.
          Supported formats: PDF, Word documents, and text files.
        </p>
      </div>

      {/* Document Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg text-gray-600 mb-2">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag & drop files here, or click to select files'}
        </p>
        <p className="text-sm text-gray-500">
          Upload club constitution, event flyers, sponsorship materials, etc.
        </p>
      </div>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Uploaded Documents</h3>
          {documents.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getFileIcon(file)}</span>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeDocument(index)}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Summary Display */}
      {summary && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-green-800">Club Summary Generated</h3>
          </div>
          <p className="text-green-700 text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {!summary && (
          <button
            onClick={processDocuments}
            disabled={isProcessing || documents.length === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <ClockIcon className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <DocumentTextIcon className="h-5 w-5" />
                <span>Process Documents</span>
              </>
            )}
          </button>
        )}
        
        {summary && (
          <button
            onClick={() => onComplete({ summary, documents, hash: 'generated' })}
            className="btn-primary"
          >
            Continue to Next Step
          </button>
        )}
      </div>

      {/* Processing Info */}
      {isProcessing && (
        <div className="text-center text-sm text-gray-600">
          <p>AI is analyzing your documents and generating a club summary...</p>
          <p className="mt-1">This may take a few moments depending on document size.</p>
        </div>
      )}
    </div>
  )
}







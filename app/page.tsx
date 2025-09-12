import Link from 'next/link'
import { RocketLaunchIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="pt-8 pb-6">
          <div className="flex items-center justify-center">
            <RocketLaunchIcon className="h-12 w-12 text-indigo-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Agentic Clubs</h1>
          </div>
          <p className="mt-4 text-center text-xl text-gray-600 max-w-2xl mx-auto">
            AI-Powered Sponsorship Outreach System for Student Clubs
          </p>
        </header>

        {/* Main Content */}
        <main className="py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Streamline Your Sponsorship Outreach
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Document Processing</h3>
                <p className="text-gray-600">
                  Upload club documents and get AI-powered summaries with intelligent caching
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Intelligent Company Discovery</h3>
                <p className="text-gray-600">
                  Find relevant companies and key contacts using AI and professional databases
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✉️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Email Generation</h3>
                <p className="text-gray-600">
                  Create tailored outreach emails that reference company mission and contact roles
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
              <p className="text-gray-600 mb-6">
                Begin your sponsorship outreach journey with our step-by-step workflow designed specifically for student clubs.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
              >
                Start Your Outreach
                <RocketLaunchIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-200">
          <div className="text-center text-gray-500">
            <p>Built with ❤️ for student organizations everywhere</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'

export default function InvoiceApp() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for error in URL params
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    if (errorParam) {
      setError('Authentication failed. Please try again.')
    }
  }, [])

  const handleLogin = () => {
    window.location.href = '/api/auth/notion'
  }

  return (
    <section id="invoice-app" className="min-h-screen flex items-center justify-center p-4 bg-white py-20">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-gray-900" />
            </div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              Get Started
            </h2>
            <p className="text-gray-600">
              Connect your Notion workspace to generate professional invoices
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-md transition-all flex items-center justify-center gap-3"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 110 12 6 6 0 010-12z" />
            </svg>
            Login with Notion
          </button>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              You'll be redirected to Notion to authorize this app
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}


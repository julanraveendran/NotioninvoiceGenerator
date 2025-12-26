'use client'

import { useRef } from 'react'
import InvoiceApp from './components/InvoiceApp'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  const appSectionRef = useRef<HTMLDivElement>(null)

  const scrollToApp = () => {
    appSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center">
          {/* H1 */}
          <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6 leading-tight tracking-tight">
            Turn Notion Pages into Professional Invoices
          </h1>

          {/* Sub-headline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-6 max-w-2xl mx-auto font-normal">
            The fastest way for freelancers and agencies to get paid without leaving their Notion workspace.
          </p>

          {/* SEO Paragraph */}
          <p className="text-base md:text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            PaidInBlocks is a free Notion Invoice Generator that lets you transform your Notion database entries into professional, branded invoices in seconds. Connect your workspace, select your projects, and download polished PDF invoices—all without switching tools or learning complex software.
          </p>

          {/* CTA Button */}
          <button
            onClick={scrollToApp}
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-3 md:px-8 md:py-4 rounded-md transition-all border border-gray-900 hover:border-gray-800"
            aria-label="Scroll to invoice generator"
          >
            Generate Invoice Now
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </section>

      {/* Invoice App Section */}
      <div ref={appSectionRef}>
        <InvoiceApp />
      </div>
    </main>
  )
}

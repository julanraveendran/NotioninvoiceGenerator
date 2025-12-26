'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Download, Upload, Loader2 } from 'lucide-react'
import { generateInvoicePDF } from '@/lib/invoice-generator'

interface Database {
  id: string
  title: string
  url: string
}

interface DatabaseRow {
  id: string
  name?: string
  date?: string
  amount?: number
  [key: string]: any
}

export default function Dashboard() {
  const router = useRouter()
  const [databases, setDatabases] = useState<Database[]>([])
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string>('')
  const [rows, setRows] = useState<DatabaseRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingRows, setLoadingRows] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    fetchDatabases()
  }, [])

  useEffect(() => {
    if (selectedDatabaseId) {
      fetchDatabaseRows(selectedDatabaseId)
    }
  }, [selectedDatabaseId])

  const fetchDatabases = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notion/databases')
      if (response.status === 401) {
        router.push('/')
        return
      }
      const data = await response.json()
      if (data.error) {
        alert(data.error)
        return
      }
      setDatabases(data.databases || [])
    } catch (error) {
      console.error('Error fetching databases:', error)
      alert('Failed to fetch databases')
    } finally {
      setLoading(false)
    }
  }

  const fetchDatabaseRows = async (databaseId: string) => {
    setLoadingRows(true)
    try {
      const response = await fetch(`/api/notion/database/${databaseId}`)
      if (response.status === 401) {
        router.push('/')
        return
      }
      const data = await response.json()
      if (data.error) {
        alert(data.error)
        return
      }
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3ab5b589-1a1e-4c97-9ae9-6ecabd10b5bb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:72',message:'Received rows from API',data:{rowCount:data.rows?.length,rows:data.rows?.map((r:any)=>({id:r.id,amount:r.amount,amountType:typeof r.amount,amountIsNull:r.amount===null,amountIsUndefined:r.amount===undefined}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      setRows(data.rows || [])
    } catch (error) {
      console.error('Error fetching rows:', error)
      alert('Failed to fetch database rows')
    } finally {
      setLoadingRows(false)
    }
  }

  const handleLogout = () => {
    // Clear the cookie by setting it to expire
    document.cookie = 'notion_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/')
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateInvoice = async (row: DatabaseRow) => {
    try {
      await generateInvoicePDF(row, logoPreview)
    } catch (error) {
      console.error('Error generating invoice:', error)
      alert('Failed to generate invoice. Please try again.')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
              <p className="text-gray-600">Select a database and generate invoices</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Logo (Optional)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-all">
              <Upload className="w-5 h-5" />
              Choose Logo
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
            {logoPreview && (
              <div className="flex items-center gap-2">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-12 w-auto object-contain"
                />
                <span className="text-sm text-gray-600">Logo ready</span>
              </div>
            )}
          </div>
        </div>

        {/* Database Selector */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Database
          </label>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading databases...
            </div>
          ) : (
            <select
              value={selectedDatabaseId}
              onChange={(e) => setSelectedDatabaseId(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Select a database --</option>
              {databases.map((db) => (
                <option key={db.id} value={db.id}>
                  {db.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Data Table */}
        {selectedDatabaseId && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Last 10 Rows</h2>
            {loadingRows ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : rows.length === 0 ? (
              <p className="text-gray-600 text-center py-12">No rows found in this database</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800">
                          {row.name || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-800 font-medium">
                          {/* #region agent log */}
                          {(()=>{fetch('http://127.0.0.1:7242/ingest/3ab5b589-1a1e-4c97-9ae9-6ecabd10b5bb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:219',message:'Rendering amount cell (post-fix)',data:{rowId:row.id,amount:row.amount,amountType:typeof row.amount,amountIsNull:row.amount===null,amountIsUndefined:row.amount===undefined,amountIsNumber:typeof row.amount==='number',willRender:row.amount!=null&&typeof row.amount==='number'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H2'})}).catch(()=>{});return null;})()}
                          {/* #endregion */}
                          {row.amount != null && typeof row.amount === 'number' ? `$${row.amount.toFixed(2)}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleGenerateInvoice(row)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                          >
                            <Download className="w-4 h-4" />
                            Generate Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}


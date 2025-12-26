import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface InvoiceRow {
  id: string
  name?: string
  date?: string
  amount?: number
  [key: string]: any
}

export async function generateInvoicePDF(row: InvoiceRow, logoUrl: string | null = null) {
  // Create a hidden div with the invoice HTML
  const invoiceDiv = document.createElement('div')
  invoiceDiv.style.position = 'absolute'
  invoiceDiv.style.left = '-9999px'
  invoiceDiv.style.width = '800px'
  invoiceDiv.style.padding = '40px'
  invoiceDiv.style.backgroundColor = '#ffffff'
  invoiceDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

  const invoiceDate = row.date ? new Date(row.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  invoiceDiv.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto; background: white; padding: 40px;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #e5e7eb;">
        <div>
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="max-height: 60px; margin-bottom: 20px;" />` : ''}
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #111827;">INVOICE</h1>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Invoice Date</div>
          <div style="font-size: 16px; font-weight: 600; color: #111827;">${invoiceDate}</div>
        </div>
      </div>

      <!-- Invoice Details -->
      <div style="margin-bottom: 40px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px;">
          <div>
            <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Bill To</div>
            <div style="font-size: 16px; color: #111827; font-weight: 500;">${row.name || 'Client Name'}</div>
          </div>
          <div>
            <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Invoice #</div>
            <div style="font-size: 16px; color: #111827; font-weight: 500;">INV-${row.id.slice(0, 8).toUpperCase()}</div>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div style="margin-bottom: 40px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
              <th style="text-align: left; padding: 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Description</th>
              <th style="text-align: right; padding: 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Date</th>
              <th style="text-align: right; padding: 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 16px; font-size: 16px; color: #111827;">${row.name || 'Service'}</td>
              <td style="padding: 16px; text-align: right; font-size: 16px; color: #6b7280;">${row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}</td>
              <td style="padding: 16px; text-align: right; font-size: 16px; font-weight: 600; color: #111827;">$${((row.amount != null && typeof row.amount === 'number') ? row.amount : 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Total -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
        <div style="width: 300px;">
          <div style="display: flex; justify-content: space-between; padding: 16px 0; border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb;">
            <div style="font-size: 18px; font-weight: 700; color: #111827;">Total</div>
            <div style="font-size: 24px; font-weight: 700; color: #111827;">$${((row.amount != null && typeof row.amount === 'number') ? row.amount : 0).toFixed(2)}</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
        <p style="margin: 0;">Thank you for your business!</p>
      </div>
    </div>
  `

  document.body.appendChild(invoiceDiv)

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(invoiceDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Download the PDF
    const fileName = `invoice-${row.name?.replace(/\s+/g, '-').toLowerCase() || 'invoice'}-${Date.now()}.pdf`
    pdf.save(fileName)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  } finally {
    // Clean up
    document.body.removeChild(invoiceDiv)
  }
}


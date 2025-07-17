export function getInvoiceHeader(title: string, seller?: { name: string; address?: string; phone?: string; email?: string }) {
  const companyName = seller?.name || "Mockify";
  const companyAddress = seller?.address || "Creative Business Solutions";
  const companyPhone = seller?.phone || "";
  const companyEmail = seller?.email || "";
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .invoice-container {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .logo {
          width: 120px;
          height: auto;
          object-fit: contain;
        }
        .company-info {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
        }
        .invoice-title {
          text-align: right;
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .invoice-subtitle {
          text-align: right;
          font-size: 14px;
          color: #6b7280;
        }
        .invoice-details {
          margin-bottom: 30px;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          margin-left: 8px;
        }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-processing { background-color: #dbeafe; color: #1e40af; }
        .status-shipped { background-color: #e0e7ff; color: #3730a3; }
        .status-delivered { background-color: #dcfce7; color: #166534; }
        .status-cancelled { background-color: #fee2e2; color: #991b1b; }
        .status-paid { background-color: #dcfce7; color: #166534; }
        .status-unpaid { background-color: #fee2e2; color: #991b1b; }
        .section {
          margin-bottom: 24px;
        }
        .section-title {
          font-weight: bold;
          margin-bottom: 12px;
          color: #374151;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .user-details {
          font-size: 11px;
          color: #6b7280;
          line-height: 1.3;
        }
        .user-details strong {
          color: #374151;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background-color: #f9fafb;
          font-weight: bold;
          font-size: 12px;
          color: #374151;
        }
        .items-table th {
          background-color: #f3f4f6;
        }
        .financial-summary {
          width: 50%;
          margin-left: auto;
        }
        .financial-summary td {
          padding: 8px;
          font-size: 12px;
        }
        .total {
          font-weight: bold;
          font-size: 14px;
          border-top: 2px solid #e5e7eb;
          color: #1f2937;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #6b7280;
          font-size: 11px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        .disclaimer {
          margin-top: 30px;
          padding: 16px;
          background-color: #f9fafb;
          border-radius: 6px;
          border-left: 4px solid #e5e7eb;
        }
        .disclaimer-text {
          font-size: 10px;
          color: #6b7280;
          line-height: 1.4;
          text-align: left;
        }
        .social-links {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin: 16px 0;
        }
        .social-link {
          display: inline-block;
          width: 20px;
          height: 20px;
          color: #6b7280;
          text-decoration: none;
        }
        .social-link:hover {
          color: #374151;
        }
        @media print {
          html, body {
            width: 210mm;
            min-height: 297mm;
            max-width: 210mm;
            margin: 0 auto !important;
            padding: 0 !important;
            box-sizing: border-box;
            background: #fff !important;
          }
          .invoice-container {
            box-shadow: none;
            padding: 20px;
          }
          .header, .footer, .section, .invoice-details, .items-table, .financial-summary {
            page-break-inside: avoid;
          }
        }
        @page {
          size: A4;
          margin: 10mm;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="logo-section">
            <img src="https://api.mockify.vercel.app/uploads/mockify-logo-black.png" alt="Mockify Logo" class="logo" />
            <div class="company-info">
              <strong>${companyName}</strong><br>
              ${companyAddress}<br>
              ${companyPhone ? `${companyPhone}<br>` : ''}
              ${companyEmail ? `${companyEmail}<br>` : ''}
              Be Connected
            </div>
          </div>
          <div>
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-subtitle">Thank you for your business!</div>
          </div>
        </div>

        <div class="invoice-details">
  `;
}

export function getToolHeader(title: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .invoice-container {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .logo {
          width: 120px;
          height: auto;
          object-fit: contain;
        }
        .company-info {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
        }
        .invoice-title {
          text-align: right;
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .invoice-subtitle {
          text-align: right;
          font-size: 14px;
          color: #6b7280;
        }
        .invoice-details {
          margin-bottom: 30px;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          margin-left: 8px;
        }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-processing { background-color: #dbeafe; color: #1e40af; }
        .status-shipped { background-color: #e0e7ff; color: #3730a3; }
        .status-delivered { background-color: #dcfce7; color: #166534; }
        .status-cancelled { background-color: #fee2e2; color: #991b1b; }
        .status-paid { background-color: #dcfce7; color: #166534; }
        .status-unpaid { background-color: #fee2e2; color: #991b1b; }
        .section {
          margin-bottom: 24px;
        }
        .section-title {
          font-weight: bold;
          margin-bottom: 12px;
          color: #374151;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .user-details {
          font-size: 11px;
          color: #6b7280;
          line-height: 1.3;
        }
        .user-details strong {
          color: #374151;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background-color: #f9fafb;
          font-weight: bold;
          font-size: 12px;
          color: #374151;
        }
        .items-table th {
          background-color: #f3f4f6;
        }
        .financial-summary {
          width: 50%;
          margin-left: auto;
        }
        .financial-summary td {
          padding: 8px;
          font-size: 12px;
        }
        .total {
          font-weight: bold;
          font-size: 14px;
          border-top: 2px solid #e5e7eb;
          color: #1f2937;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #6b7280;
          font-size: 11px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        .disclaimer {
          margin-top: 30px;
          padding: 16px;
          background-color: #f9fafb;
          border-radius: 6px;
          border-left: 4px solid #e5e7eb;
        }
        .disclaimer-text {
          font-size: 10px;
          color: #6b7280;
          line-height: 1.4;
          text-align: left;
        }
        .social-links {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin: 16px 0;
        }
        .social-link {
          display: inline-block;
          width: 20px;
          height: 20px;
          color: #6b7280;
          text-decoration: none;
        }
        .social-link:hover {
          color: #374151;
        }
        @media print {
          html, body {
            width: 210mm;
            min-height: 297mm;
            max-width: 210mm;
            margin: 0 auto !important;
            padding: 0 !important;
            box-sizing: border-box;
            background: #fff !important;
          }
          .invoice-container {
            box-shadow: none;
            padding: 20px;
          }
          .header, .footer, .section, .invoice-details, .items-table, .financial-summary {
            page-break-inside: avoid;
          }
        }
        @page {
          size: A4;
          margin: 10mm;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="logo-section">
            <img src="https://api.mockify.vercel.app/uploads/mockify-logo-black.png" alt="Mockify Logo" class="logo" />
            <div class="company-info">
              <strong>Mockify</strong><br>
              Creative Business Solutions<br>
              Be Connected
            </div>
          </div>
          <div>
            <div class="invoice-title">${title.toUpperCase()}</div>
            <div class="invoice-subtitle">Generated by Mockify Tools</div>
          </div>
        </div>

        <div class="invoice-details">
  `;
}

export function getInvoiceFooter() {
  const currentYear = new Date().getFullYear();
  return `
        </div>

        <div class="footer">
          <div class="disclaimer">
            <div class="disclaimer-text">
              <strong>Disclaimer:</strong> Mockify Kart is a user-based E-Commerce platform that facilitates transactions between buyers and sellers. All payments are processed directly by individual sellers, and sellers are solely responsible for payment processing, order fulfillment, and customer service related to their products. Mockify Kart service is offered by Mockify, however Mockify is not responsible for payment disputes, order issues, or seller-related matters.
            </div>
          </div>
          <div class="social-links">
            <a href="https://www.linkedin.com/company/mockifytools/" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Follow us on LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://instagram.com/mockifytools" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Follow us on Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.617-6.78-6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://x.com/mockifytools" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Follow us on X (Twitter)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://youtube.com/@Mockify" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Subscribe to our YouTube channel">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://facebook.com/profile.php?id=61558649983492" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Follow us on Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
          <p>© ${currentYear} mockify. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getToolFooter() {
  const currentYear = new Date().getFullYear();
  return `
        </div>

        <div class="footer">
          <div class="disclaimer">
            <div class="disclaimer-text">
              <strong>Disclaimer:</strong> Mockify Tools is a service provided by Mockify to assist professionals in the productivity and business. These tools are designed to help with calculations, form generation, and documentation. While we strive for accuracy, Mockify is not responsible for any errors, omissions, or decisions made based on the output of these tools. Users are advised to verify all calculations and information independently. The generated documents are for reference purposes only and should be reviewed by qualified professionals before use in official or legal contexts.
            </div>
          </div>
          <div class="social-links">
            <a href="https://www.linkedin.com/company/mockifytools/" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Follow us on LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://instagram.com/mockifytools" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Follow us on Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.617-6.78-6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://x.com/mockifytools" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Follow us on X (Twitter)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://youtube.com/@Mockify" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Subscribe to our YouTube channel">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://facebook.com/profile.php?id=61558649983492" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Follow us on Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
          <p>© ${currentYear} mockify. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateCompleteInvoiceHTML(title: string, content: string, seller?: { name: string; address?: string; phone?: string; email?: string }) {
  return getInvoiceHeader(title, seller) + content + getInvoiceFooter();
}

export function generateCompleteToolHTML(title: string, content: string) {
  return getToolHeader(title) + content + getToolFooter();
}
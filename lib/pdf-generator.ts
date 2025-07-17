import jsPDF from "jspdf"
import "jspdf-autotable"
import { format } from "date-fns"

// Define types for PDF content
export type PDFContentItem = {
  type: "heading" | "subheading" | "paragraph" | "list" | "table" | "spacer"
  content?: string | string[] | { header: string[]; body: string[][] }
  style?: any
}

/**
 * Generate a PDF document from the provided content
 */
export function generatePDF(title: string, content: PDFContentItem[], filename = "mockify-result.pdf"): void {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Set document properties
  doc.setProperties({
    title: title,
    subject: "Mockify Tool Result",
    author: "Mockify",
    creator: "Mockify Tool",
  })

  // Add header with logo
  addHeader(doc, title)

  // Starting y position after header
  let y = 40

  // Add content
  content.forEach((item) => {
    switch (item.type) {
      case "heading":
        doc.setFont("helvetica", "bold")
        doc.setFontSize(16)
        doc.text(item.content as string, 20, y)
        y += 10
        break

      case "subheading":
        doc.setFont("helvetica", "bold")
        doc.setFontSize(14)
        doc.text(item.content as string, 20, y)
        y += 8
        break

      case "paragraph":
        doc.setFont("helvetica", "normal")
        doc.setFontSize(12)
        const lines = doc.splitTextToSize(item.content as string, 170)
        doc.text(lines, 20, y)
        y += 6 * lines.length
        break

      case "list":
        doc.setFont("helvetica", "normal")
        doc.setFontSize(12)
        const listItems = item.content as string[]
        listItems.forEach((listItem) => {
          doc.text(`• ${listItem}`, 25, y)
          y += 6
        })
        break

      case "table":
        const tableContent = item.content as { header: string[]; body: string[][] }
        ;(doc as any).autoTable({
          startY: y,
          head: [tableContent.header],
          body: tableContent.body,
          margin: { left: 20, right: 20 },
          styles: { fontSize: 10 },
          headStyles: { fillColor: [37, 99, 235] },
        })
        y = (doc as any).lastAutoTable.finalY + 10
        break

      case "spacer":
        y += 10
        break
    }

    // Check if we need a new page
    if (y > 270) {
      doc.addPage()
      addHeader(doc, title)
      y = 40
    }
  })

  // Add footer with page numbers
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    addFooter(doc, i, totalPages)
  }

  // Save the PDF
  doc.save(filename)
}

/**
 * Add header to the PDF
 */
function addHeader(doc: jsPDF, title: string): void {
  // Add logo (placeholder)
  doc.setFillColor(37, 99, 235) //   Blue
  doc.rect(0, 0, 210, 25, "F")

  // Add title
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text("MOCKIFY", 20, 15)

  // Add subtitle
  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)
  doc.text(title, 70, 15)

  // Reset text color
  doc.setTextColor(0, 0, 0)
}

/**
 * Add footer to the PDF
 */
function addFooter(doc: jsPDF, currentPage: number, totalPages: number): void {
  const date = format(new Date(), "MMMM d, yyyy")

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)

  // Add date on the left
  doc.text(`Generated on: ${date}`, 20, 285)

  // Add page numbers on the right
  doc.text(`Page ${currentPage} of ${totalPages}`, 170, 285)

  // Add website URL in the center
  doc.text("www.mockify.vercel.app", 90, 285)
}

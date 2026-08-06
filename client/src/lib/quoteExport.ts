import { QuoteItem } from "@/contexts/QuoteContext";

export interface QuoteExportData {
  items: QuoteItem[];
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  exportDate: string;
}

/**
 * Export quote items as CSV file
 */
export function exportQuoteAsCSV(data: QuoteExportData) {
  const { items, companyName, contactEmail, contactPhone, exportDate } = data;

  // Create CSV headers
  const headers = ["Product Name", "SKU", "Unit", "Quantity"];
  
  // Create CSV rows
  const rows = items.map(item => [
    `"${(item.productName || "").replace(/"/g, '""')}"`,
    `"${(item.productSku || "").replace(/"/g, '""')}"`,
    `"${(item.unit || "").replace(/"/g, '""')}"`,
    item.quantity.toString(),
  ]);

  // Create CSV content
  let csvContent = "AMO Industrial - Quote Request\n";
  if (companyName) csvContent += `Company: ${companyName}\n`;
  if (contactEmail) csvContent += `Email: ${contactEmail}\n`;
  if (contactPhone) csvContent += `Phone: ${contactPhone}\n`;
  csvContent += `Export Date: ${exportDate}\n\n`;
  csvContent += headers.join(",") + "\n";
  csvContent += rows.map(row => row.join(",")).join("\n");
  csvContent += `\n\nTotal Items: ${items.length}\nTotal Quantity: ${items.reduce((sum, item) => sum + item.quantity, 0)}`;

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadFile(blob, `AMO-Quote-${Date.now()}.csv`);
}

/**
 * Export quote items as PDF file using browser print
 */
export function exportQuoteAsPDF(data: QuoteExportData) {
  const { items, companyName, contactEmail, contactPhone, exportDate } = data;

  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>AMO Industrial - Quote Request</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          border-bottom: 3px solid #CC0000;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          color: #CC0000;
          font-size: 24px;
        }
        .header-info {
          font-size: 12px;
          color: #666;
          margin-top: 10px;
        }
        .quote-details {
          margin-bottom: 20px;
          font-size: 13px;
        }
        .quote-details p {
          margin: 5px 0;
        }
        .label {
          font-weight: bold;
          color: #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
          font-weight: bold;
          font-size: 12px;
        }
        td {
          border: 1px solid #ddd;
          padding: 10px;
          font-size: 12px;
        }
        tr:nth-child(even) {
          background-color: #fafafa;
        }
        .summary {
          text-align: right;
          margin-top: 20px;
          font-size: 13px;
        }
        .summary p {
          margin: 5px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          font-size: 11px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>AMO Industrial</h1>
        <div class="header-info">Quote Request - ${exportDate}</div>
      </div>

      <div class="quote-details">
        ${companyName ? `<p><span class="label">Company:</span> ${companyName}</p>` : ""}
        ${contactEmail ? `<p><span class="label">Email:</span> ${contactEmail}</p>` : ""}
        ${contactPhone ? `<p><span class="label">Phone:</span> ${contactPhone}</p>` : ""}
      </div>

      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>SKU</th>
            <th>Unit</th>
            <th style="text-align: center;">Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.productName || "-"}</td>
              <td>${item.productSku || "-"}</td>
              <td>${item.unit || "-"}</td>
              <td style="text-align: center;">${item.quantity}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="summary">
        <p><strong>Total Items:</strong> ${items.length}</p>
        <p><strong>Total Quantity:</strong> ${items.reduce((sum, item) => sum + item.quantity, 0)}</p>
      </div>

      <div class="footer">
        <p>This quote request has been generated from AMO Industrial's online catalog.</p>
        <p>Our team will review your request and respond within 24 business hours with pricing and availability.</p>
      </div>
    </body>
    </html>
  `;

  // Create a temporary window to print
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * Helper function to download a file
 */
function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

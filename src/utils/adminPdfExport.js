export function exportAdminReport({ title, subtitle, columns, data, filename }) {
  const list = data || [];
  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to download the PDF report.");
    return;
  }

  const thHtml = columns.map(c => `<th>${c.header}</th>`).join('');

  const rowsHtml = list.map((item) => {
    const cells = columns.map(c => {
      const val = c.accessor(item);
      const isBold = c.bold ? 'font-weight: bold; color: #2563eb;' : '';
      return `<td style="${isBold}">${val !== undefined && val !== null ? val : '—'}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename || 'CivicConnect_Admin_Report'}</title>
      <style>
        @page {
          size: landscape;
          margin: 12mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 20px;
          background: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #ffffff;
          padding: 20px 24px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0 0 6px 0;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .header p {
          margin: 0;
          font-size: 12px;
          opacity: 0.9;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .meta-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 10px 14px;
          border-radius: 8px;
        }
        .meta-card .label {
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 2px;
        }
        .meta-card .value {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 12px;
        }
        th {
          background-color: #2563eb;
          color: #ffffff;
          text-align: left;
          padding: 10px 12px;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        th:first-child { border-top-left-radius: 8px; }
        th:last-child { border-top-right-radius: 8px; }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: middle;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .footer {
          margin-top: 24px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 15px; text-align: right;">
        <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer;">
          🖨️ Save as PDF / Print Document
        </button>
      </div>

      <div class="header">
        <h1>CivicConnect - ${title} Report</h1>
        <p>${subtitle || 'Official System Administrative Report'}</p>
      </div>

      <div class="meta-grid">
        <div class="meta-card">
          <div class="label">Report Title</div>
          <div class="value">${title}</div>
        </div>
        <div class="meta-card">
          <div class="label">Total Records</div>
          <div class="value">${list.length} Items</div>
        </div>
        <div class="meta-card">
          <div class="label">Generated On</div>
          <div class="value">${todayStr}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>${thHtml}</tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer">
        Generated on ${todayStr} | CivicConnect Admin System | Official Administrative Document
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

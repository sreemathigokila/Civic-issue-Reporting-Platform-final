import { formatComplaintId } from './formatId';
import { getEffectiveStatus } from './deadlineUtils';

export function exportComplaintsPDF({ complaints, deptName, distName, filterName }) {
  const list = complaints || [];
  const dept = deptName || 'Electricity Dept';
  const dist = distName || 'Cuddalore';
  const scope = filterName || 'All Department Complaints';
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

  const rowsHtml = list.map((c) => {
    const code = formatComplaintId(c);
    const title = c.title || 'Civic Issue';
    const loc = c.locationAddress || c.location || 'Coimbatore';
    const priority = c.priority || 'MEDIUM';
    const rawStatus = getEffectiveStatus(c);
    const status = rawStatus ? rawStatus.replace(/_/g, ' ') : 'SUBMITTED';
    const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently';
    const workerName = c.workerName || c.worker?.user?.fullName || c.worker?.fullName || (c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' ? 'Assigned Field Inspector' : 'Not Assigned');
    const deadline = c.workDeadline || c.work_deadline || 'N/A';
    const desc = c.description || 'No additional details provided.';

    const statusBg = status.includes('RESOLVED') ? '#d1fae5' : status.includes('VERIFICATION') ? '#f3e8ff' : status.includes('PROGRESS') ? '#e0e7ff' : '#fef3c7';
    const statusColor = status.includes('RESOLVED') ? '#065f46' : status.includes('VERIFICATION') ? '#581c87' : status.includes('PROGRESS') ? '#3730a3' : '#92400e';
    const priorityColor = priority === 'HIGH' ? '#dc2626' : priority === 'MEDIUM' ? '#d97706' : '#2563eb';

    return `
      <tr>
        <td style="font-weight: bold; color: #4f46e5; white-space: nowrap;">${code}</td>
        <td>
          <div style="font-weight: 600; color: #1e293b;">${title}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 3px;">${desc}</div>
        </td>
        <td>${loc}</td>
        <td><span style="font-weight: 700; color: ${priorityColor};">${priority}</span></td>
        <td>
          <span style="background-color: ${statusBg}; color: ${statusColor}; padding: 3px 8px; border-radius: 12px; font-weight: 700; font-size: 11px; display: inline-block;">
            ${status}
          </span>
        </td>
        <td style="white-space: nowrap;">${dateStr}</td>
        <td>${workerName}</td>
        <td style="font-weight: 600; color: #6b21a8; white-space: nowrap;">${deadline}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CivicConnect_${dept.replace(/\s+/g, '_')}_Complaints_Report</title>
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
          background: linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%);
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
          grid-template-columns: repeat(4, 1fr);
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
          background-color: #6d28d9;
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
          vertical-align: top;
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
        <button onclick="window.print()" style="background: #6d28d9; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer;">
          🖨️ Save as PDF / Print Document
        </button>
      </div>

      <div class="header">
        <h1>CivicConnect - Department Complaints Report</h1>
        <p>Official Export Document | Department Head Management Portal</p>
      </div>

      <div class="meta-grid">
        <div class="meta-card">
          <div class="label">Department</div>
          <div class="value">${dept}</div>
        </div>
        <div class="meta-card">
          <div class="label">District</div>
          <div class="value">${dist}</div>
        </div>
        <div class="meta-card">
          <div class="label">Report Scope</div>
          <div class="value">${scope}</div>
        </div>
        <div class="meta-card">
          <div class="label">Total Records</div>
          <div class="value">${list.length} Complaints</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Issue & Details</th>
            <th>Location</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Submitted Date</th>
            <th>Assigned Worker</th>
            <th>Deadline</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer">
        Generated on ${todayStr} | CivicConnect Civic Issue Reporting Platform | Confidential Departmental Document
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

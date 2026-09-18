export function formatComplaintId(c) {
  if (!c) return 'C-1001';
  
  let raw = '';
  if (typeof c === 'object') {
    raw = c.complaintNo || c.complaintCode || c.complaint_no || c.id;
  } else {
    raw = String(c);
  }

  const str = String(raw).trim();
  if (str.startsWith('C-') && str.length >= 6) {
    return str;
  }

  const digits = str.replace(/[^0-9]/g, '');
  const num = parseInt(digits, 10) || 1;
  const formattedNum = num < 1000 ? 1000 + num : num;
  return `C-${formattedNum}`;
}

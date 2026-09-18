export function getNotificationTargetUrl(n, roleKey) {
  if (!n) return '/';
  const cleanRole = (roleKey || '').toLowerCase().replace('role_', '');
  
  // 1. Check explicit fields
  let codeOrId = n.complaintId || n.complaint_id || n.complaintCode || n.complaint_code;

  // 2. Extract C-XXXX or task code from title or message
  if (!codeOrId && (n.title || n.message)) {
    const text = `${n.title || ''} ${n.message || ''}`;
    const match = text.match(/C-\d+/i) || text.match(/ID:\s*([\w-]+)/i) || text.match(/task\s+(C-\d+|\d+)/i);
    if (match) {
      codeOrId = match[1] || match[0];
      codeOrId = codeOrId.replace(/ID:\s*/i, '').trim();
    }
  }

  // 3. Fallback to main list route if no specific complaint is linked
  if (!codeOrId) {
    if (cleanRole === 'worker') return '/worker/tasks';
    if (cleanRole === 'dept_head' || cleanRole === 'department_head') return '/depthead/complaints';
    if (cleanRole === 'admin' || cleanRole === 'super_admin' || cleanRole === 'district_admin') return '/admin/complaints';
    return '/citizen/complaints';
  }

  // 4. Construct role-based complaint detail page URL
  if (cleanRole === 'worker') {
    return `/worker/tasks/${codeOrId}`;
  }
  if (cleanRole === 'dept_head' || cleanRole === 'department_head') {
    return `/depthead/complaints/${codeOrId}`;
  }
  if (cleanRole === 'admin' || cleanRole === 'super_admin' || cleanRole === 'district_admin') {
    return `/admin/complaints/${codeOrId}`;
  }
  return `/citizen/complaints/${codeOrId}`;
}

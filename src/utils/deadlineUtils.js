export function isPastDeadline(deadlineStr) {
  if (!deadlineStr) return false;
  try {
    const str = String(deadlineStr).trim();
    let dateObj = null;

    if (str.includes('/')) {
      const parts = str.split(' ');
      const dateParts = parts[0].split('/');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);

        let hours = 23, minutes = 59;
        if (parts.length >= 2) {
          const timePart = parts.slice(1).join(' ');
          const timeMatch = timePart.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (timeMatch) {
            let h = parseInt(timeMatch[1], 10);
            let m = parseInt(timeMatch[2], 10);
            const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
            if (ampm === 'PM' && h < 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            hours = h;
            minutes = m;
          }
        }
        dateObj = new Date(year, month, day, hours, minutes);
      }
    }

    if (!dateObj || isNaN(dateObj.getTime())) {
      const parts = str.split(' ');
      if (parts[0].includes('-')) {
        const dateParts = parts[0].split('-');
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1;
          const day = parseInt(dateParts[2], 10);

          let hours = 23, minutes = 59;
          if (parts.length >= 2) {
            const timePart = parts.slice(1).join(' ');
            const timeMatch = timePart.match(/(\d+):(\d+)\s*(AM|PM)?/i);
            if (timeMatch) {
              let h = parseInt(timeMatch[1], 10);
              let m = parseInt(timeMatch[2], 10);
              const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
              if (ampm === 'PM' && h < 12) h += 12;
              if (ampm === 'AM' && h === 12) h = 0;
              hours = h;
              minutes = m;
            }
          }
          dateObj = new Date(year, month, day, hours, minutes);
        }
      }
    }

    if (!dateObj || isNaN(dateObj.getTime())) {
      dateObj = new Date(str);
    }

    if (dateObj && !isNaN(dateObj.getTime())) {
      return new Date() > dateObj;
    }
  } catch (e) {
    console.error("Error checking deadline:", e);
  }
  return false;
}

export function getEffectiveStatus(complaint) {
  if (!complaint) return 'SUBMITTED';
  const status = complaint.status || 'SUBMITTED';
  const rawUpper = String(status).toUpperCase().replace(/ /g, '_');

  if (['RESOLVED', 'CLOSED', 'SENT_FOR_VERIFICATION', 'SUBMITTED_FOR_REVIEW', 'CITIZEN_APPROVED', 'REJECTED'].includes(rawUpper)) {
    return status;
  }

  const deadlineStr = complaint.workDeadline || complaint.work_deadline;
  if (isPastDeadline(deadlineStr)) {
    return 'PENDING';
  }

  return status;
}

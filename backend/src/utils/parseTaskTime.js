/**
 * Parse time string to minutes since midnight (0-1439).
 * Supports: "12:12am", "6 AM", "6:30 PM", "14:00", "9:00am"
 * @param {string} timeStr
 * @returns {number|null} minutes since midnight or null if unparseable
 */
function parseTaskTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0; // no time = midnight
  const s = timeStr.trim().toLowerCase();
  if (!s) return 0;

  // 24h format: 14:00, 09:30
  const match24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) return h * 60 + m;
    return null;
  }

  // 12h format: 6 am, 6:30 pm, 12:12am, 12:12 am
  const match12 = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = match12[2] ? parseInt(match12[2], 10) : 0;
    const period = (match12[3] || 'am').toLowerCase();
    if (h < 1 || h > 12 || (m !== 0 && (m < 0 || m > 59))) return null;
    if (period === 'pm' && h !== 12) h += 12;
    if (period === 'am' && h === 12) h = 0;
    return h * 60 + m;
  }

  return null;
}

/**
 * Get the due date for a task: scheduledDate at the given time (minutes since midnight).
 * @param {Date} scheduledDate
 * @param {number} minutesSinceMidnight
 * @returns {Date}
 */
function getTaskDueDate(scheduledDate, minutesSinceMidnight) {
  const d = new Date(scheduledDate);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(d.getMinutes() + minutesSinceMidnight);
  return d;
}

module.exports = { parseTaskTime, getTaskDueDate };

/**
 * Export utility for contact submissions
 * Allows author to download submissions as CSV from browser console
 */

import { getContactSubmissions, ContactSubmission } from './localStorage';

/**
 * Convert contact submissions to CSV format
 */
function submissionsToCSV(submissions: ContactSubmission[]): string {
  if (submissions.length === 0) {
    return 'No submissions found';
  }

  // CSV header
  const headers = ['ID', 'Name', 'Email', 'Message', 'Timestamp', 'Status'];
  const headerRow = headers.join(',');

  // CSV rows
  const dataRows = submissions.map(submission => {
    // Escape fields that might contain commas or quotes
    const escapeCsvField = (field: string): string => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    return [
      escapeCsvField(submission.id),
      escapeCsvField(submission.name),
      escapeCsvField(submission.email),
      escapeCsvField(submission.message),
      escapeCsvField(submission.timestamp),
      escapeCsvField(submission.status),
    ].join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Export contact submissions as CSV file
 * Usage: Call this function from browser console
 */
export function exportContactSubmissions(): void {
  const submissions = getContactSubmissions();

  if (submissions.length === 0) {
    console.log('No contact submissions to export');
    return;
  }

  const csv = submissionsToCSV(submissions);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Create download link
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  link.href = url;
  link.download = `contact-submissions-${timestamp}.csv`;
  link.style.display = 'none';

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);

  console.log(`✅ Exported ${submissions.length} contact submissions`);
}

/**
 * Display contact submissions in console table format
 * Usage: Call this function from browser console for quick preview
 */
export function viewContactSubmissions(): void {
  const submissions = getContactSubmissions();

  if (submissions.length === 0) {
    console.log('No contact submissions found');
    return;
  }

  console.table(
    submissions.map(s => ({
      ID: s.id,
      Name: s.name,
      Email: s.email,
      Message: s.message.substring(0, 50) + (s.message.length > 50 ? '...' : ''),
      Timestamp: new Date(s.timestamp).toLocaleString(),
      Status: s.status,
    }))
  );

  console.log(
    `Total submissions: ${submissions.length}\n\n` +
      'To export as CSV, run: exportContactSubmissions()'
  );
}

/**
 * Global exports for browser console access
 * Add these to window object in production
 */
if (typeof window !== 'undefined') {
  (window as any).exportContactSubmissions = exportContactSubmissions;
  (window as any).viewContactSubmissions = viewContactSubmissions;
  console.log(
    '📋 Contact submission utilities loaded:\n' +
      '  - viewContactSubmissions()  → View submissions in console\n' +
      '  - exportContactSubmissions() → Download as CSV'
  );
}

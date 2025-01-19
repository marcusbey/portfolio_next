import moment from 'moment';

export function formatDate(date: string | null | undefined): string {
  if (!date) return '';
  
  if (date.toLowerCase() === 'present') {
    return 'Present';
  }
  
  const parsedDate = moment(date, 'YYYY-MM-DD', true);
  if (!parsedDate.isValid()) {
    console.warn(`Invalid date format: ${date}. Expected format: YYYY-MM-DD`);
    return date;
  }
  
  return parsedDate.format('MMM YYYY');
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  return `${start} - ${end}`;
}

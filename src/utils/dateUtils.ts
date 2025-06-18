export class DateUtils {
  static parseDate(dateString: string): Date {
    if (!dateString || dateString === '00000000') {
      return new Date();
    }
    if (dateString.includes('/')) {
      const [month, day, year] = dateString.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
    if (dateString.length === 8 && !isNaN(Number(dateString))) {
      const year = parseInt(dateString.substring(0, 4));
      const month = parseInt(dateString.substring(4, 6)) - 1;
      const day = parseInt(dateString.substring(6, 8));
      return new Date(year, month, day);
    }
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
    return new Date();
  }
  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  static formatDateTime(date: Date): string {
    return date.toISOString().replace('T', ' ').substring(0, 19);
  }
}
export const parseSlashDate = (dateStr: string): Date | null => {
  if (!dateStr || dateStr === '00000000') return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  return date;
};
export const parseYYYYMMDD = (dateStr: string): Date | null => {
  if (!dateStr || dateStr === '00000000') return null;
  if (dateStr.length !== 8) return null;
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1; 
  const day = parseInt(dateStr.substring(6, 8), 10);
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  return date;
};
export const getCurrentDate = (): Date => {
  return new Date();
}; 
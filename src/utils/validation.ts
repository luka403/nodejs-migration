export const isNonEmptyString = (value: any): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};
export const isValidBooleanString = (value: any): boolean => {
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return normalized === 'yes' || normalized === 'no';
};
export const booleanFromString = (value: string): boolean => {
  return value.trim().toLowerCase() === 'yes';
};
export const isValidDateString = (value: any): boolean => {
  if (typeof value !== 'string') return false;
  if (value.includes('/')) {
    const parts = value.split('/');
    if (parts.length !== 3) return false;
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    return !isNaN(month) && !isNaN(day) && !isNaN(year) &&
           month >= 1 && month <= 12 && 
           day >= 1 && day <= 31 &&
           year >= 1900 && year <= 2100;
  }
  if (value.length === 8 && !isNaN(Number(value))) {
    const year = parseInt(value.substring(0, 4), 10);
    const month = parseInt(value.substring(4, 6), 10);
    const day = parseInt(value.substring(6, 8), 10);
    return !isNaN(month) && !isNaN(day) && !isNaN(year) &&
           month >= 1 && month <= 12 && 
           day >= 1 && day <= 31 &&
           year >= 1900 && year <= 2100;
  }
  return false;
};
export const isValidCategoryCode = (code: string): boolean => {
  if (!isNonEmptyString(code)) return false;
  return /^\d+$/.test(code) && code.length % 2 === 0 && code.length >= 2 && code.length <= 8;
};
export const validateRequiredFields = (obj: Record<string, any>, requiredFields: string[]): boolean => {
  return requiredFields.every(field => {
    const value = obj[field];
    return value !== undefined && value !== null && value !== '';
  });
}; 
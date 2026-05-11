export const normalizeRestriction = (restriction: string): string => {
  return restriction
    .split(/x/i) // Split by X (case-insensitive)
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 0)
    .join(' ');
};

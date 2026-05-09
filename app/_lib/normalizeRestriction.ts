import { restrictionDelimiterRegex } from "./const";

export const normalizeRestriction = (restriction: string): string => {
    return restriction
        .split(restrictionDelimiterRegex)
        .map(part => part.trim())
        .filter(part => part.length > 0)
        .join(' ');
}
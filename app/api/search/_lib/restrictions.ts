import { restrictionDelimiterRegex } from "@/app/_lib/const";

export const extractRestrictions = (suchtext: string): string[] => {
  if (!suchtext) return [];

  const matches = Array.from(suchtext.matchAll(restrictionDelimiterRegex)).map(
    (match) => match[1],
  );

  const normalized = matches
    .map((match) => match.replace(/[.,;\%]/g, "").replace(/x/gi, "x"))
    .map((match) => match.toUpperCase())
    .filter(Boolean);

  return Array.from(new Set(normalized));
};

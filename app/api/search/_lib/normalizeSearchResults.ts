import { parse } from "date-fns";
import { PreProcessedSearchResult, SearchResult } from "../../../_lib/types";
import { extractRestrictions } from "./restrictions";

export const normalizeSearchResults = (
  searchResults: PreProcessedSearchResult[],
): SearchResult[] => {
  return searchResults.map((result) => {
    return {
      ...result,
      datum: parse(result.datum, "dd.MM.yyyy", new Date()),
      restrictions: extractRestrictions(result.suchtext),
    };
  });
};

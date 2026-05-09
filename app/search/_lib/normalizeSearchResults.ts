import { format, formatDate, parse } from "date-fns";
import { PreProcessedSearchResult, SearchResult } from "../../_lib/types";

export const normalizeSearchResults = (
  searchResults: PreProcessedSearchResult[],
): SearchResult[] => {
  return searchResults.map((result) => {
    return {
      ...result,
      datum: parse(result.datum, "dd.MM.yyyy", new Date()),
    };
  });
};

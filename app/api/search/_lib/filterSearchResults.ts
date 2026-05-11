import Fuse from "fuse.js";
import { Filters, SearchResult } from "../../../_lib/types";

export const filterSearchResults = (
  data: SearchResult[],
  filters: Filters,
): SearchResult[] => {
  const { suchtext, fotografen, datum, restrictions } = filters;

  let searchResults = data;

  if (fotografen || datum || restrictions) {
    searchResults = data.filter((item: SearchResult) => {
      if (fotografen && item.fotografen !== fotografen) return false;
      if (datum && (item.datum < datum.from || item.datum > datum.to)) return false;
      if (restrictions && restrictions.length > 0) {
        const hasAnyRestriction = restrictions.some((restriction) =>
          item.restrictions?.includes(restriction)
        );
        if (!hasAnyRestriction) return false;
      }
      return true;
    });
  }

  if (suchtext) {
    const fuseSearch = new Fuse<SearchResult>(searchResults, {
      keys: [
        { name: "suchtext", weight: 0.7 },
        { name: "fotografen", weight: 0.2 },
        { name: "bildnummer", weight: 0.1 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
      includeScore: true,
      minMatchCharLength: 2,
      useExtendedSearch: true,
    });

    searchResults = fuseSearch
      .search(suchtext as string)
      .map((result) => ({
        item: result.item,
        score: result.score ?? 1,
      }))
      .map(({ item, score }) => {
        let adjustedScore = score;
        const query = (suchtext || "").toLowerCase();
        if (item.bildnummer.toLowerCase().startsWith(query)) {
          adjustedScore -= 0.15;
        }
        if (item.fotografen.toLowerCase().includes(query)) {
          adjustedScore -= 0.05;
        }
        if (item.suchtext.toLowerCase().includes(query)) {
          adjustedScore -= 0.1;
        }
        return { item, score: adjustedScore };
      })
      .sort((a, b) => a.score - b.score)
      .map(({ item }) => item);
  }

  return searchResults;
};

import Fuse from "fuse.js";
import { Filters, SearchResult } from "../_lib/types";

export const filterSearchResults = (data: SearchResult[], filters: Filters): SearchResult[] => {
    const { suchtext, fotografen, datum, restrictions } = filters;

    let searchResults = data;

    if (fotografen || datum || restrictions) {
      searchResults = data.filter((item: SearchResult) => {
        if (fotografen && item.fotografen !== fotografen) return false;
        if (datum && (item.datum < datum[0] || item.datum > datum[1]))
          return false;
        if (restrictions && !item.suchtext?.includes(restrictions)) return false;
        return true;
      });
    }

    if (suchtext) {
      const fuseSearch = new Fuse<SearchResult>(searchResults, {
        keys: ["suchtext", "fotografen", "bildnummer"],
        threshold: 0.1,
      });
      searchResults = fuseSearch
        .search(suchtext as string)
        .map((result) => result.item);
    }

    return searchResults;
}
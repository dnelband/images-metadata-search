import { FilterOptions, SearchResult } from "../../../_lib/types";

export const getSearchResultsFilterOptions = (data: SearchResult[]): FilterOptions => {
  const result = data.reduce((acc: FilterOptions, item) => {
    if (item.fotografen && !acc.fotografen?.includes(item.fotografen)) {
      acc.fotografen = [...(acc.fotografen || []), item.fotografen];
    }

    if (item.datum) {
      const dateStr = item.datum.toISOString().split("T")[0];
      const year = parseInt(dateStr.split("-")[0]);
      if (year >= 1900 && !acc.datum?.includes(dateStr)) {
        acc.datum = [...(acc.datum || []), dateStr];
      }
    }

    item.restrictions?.forEach((restriction) => {
      if (restriction && !acc.restrictions?.includes(restriction)) {
        acc.restrictions = [...(acc.restrictions || []), restriction];
      }
    });

    return acc;
  }, {
    fotografen: [],
    datum: [],
    restrictions: [],
  });

  if (result.datum) {
    result.datum.sort();
  }

  if (result.restrictions) {
    result.restrictions.sort();
  }

  return result;
};
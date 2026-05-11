import { promises as fs } from "fs";
import {
  SortBy,
  SortOrder,
  SearchResult,
  Filters,
  FilterOptions,
  PreProcessedSearchResult,
} from "../../../_lib/types";
import { getSearchResultsFilterOptions } from "./getSearchResultsFilterOptions";
import { filterSearchResults } from "./filterSearchResults";
import { normalizeSearchResults } from "./normalizeSearchResults";

interface GetSearchResultsParams {
  filters?: Filters;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
}

export type SearchResultsCollectionAttributes = {
  filterOptions: FilterOptions;
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  sortOrder: SortOrder;
};

interface GetSearchResultsResponse {
  items: SearchResult[];
  collectionAttributes: SearchResultsCollectionAttributes;
}

let cachedNormalizedData: SearchResult[] | null = null;
let cachedFilterOptions: FilterOptions | null = null;

async function loadSearchResultsData() {
  if (cachedNormalizedData && cachedFilterOptions) {
    return { normalizedData: cachedNormalizedData, filterOptions: cachedFilterOptions };
  }

  const file = await fs.readFile(`${process.cwd()}/app/data.json`, "utf8");
  const rawData = JSON.parse(file);

  const normalizedData = normalizeSearchResults(rawData);

  const filterOptions = getSearchResultsFilterOptions(normalizedData);

  cachedNormalizedData = normalizedData;
  cachedFilterOptions = filterOptions;

  return { normalizedData, filterOptions };
}

export async function getSearchResults({
  filters,
  page = 0,
  pageSize = 10,
  sortOrder = "desc",
}: GetSearchResultsParams): Promise<GetSearchResultsResponse> {
  const { normalizedData, filterOptions } = await loadSearchResultsData();

  const searchResults = filters
    ? filterSearchResults(normalizedData, filters)
    : normalizedData;

  searchResults.sort((a: SearchResult, b: SearchResult) => {
    if (sortOrder === "asc") {
      return a.datum.getTime() - b.datum.getTime();
    }
    return b.datum.getTime() - a.datum.getTime();
  });

  return {
    items: searchResults.slice(page * pageSize, (page + 1) * pageSize),
    collectionAttributes: {
      filterOptions,
      page,
      pageSize,
      totalPages: Math.ceil(searchResults.length / pageSize),
      totalItems: searchResults.length,
      sortOrder,
    },
  };
}

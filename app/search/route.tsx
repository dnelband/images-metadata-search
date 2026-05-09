"use server";

import { promises as fs } from "fs";
import {
  SortBy,
  SortOrder,
  SearchResult,
  Filters,
  FilterOptions,
} from "../_lib/types";
import { getSearchResultsFilterOptions } from "./_lib/getSearchResultsFilterOptions";
import { filterSearchResults } from "./_lib/filterSearchResults";
import { normalizeSearchResults } from "./_lib/normalizeSearchResults";

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

export async function getSearchResults({
  filters,
  page = 0,
  pageSize = 10,
  sortOrder = "desc",
}: GetSearchResultsParams): Promise<GetSearchResultsResponse> {

  const file = await fs.readFile(`${process.cwd()}/app/data.json`, "utf8");
  const data = JSON.parse(file);

  // filter search results based on filters
  const searchResults =  normalizeSearchResults( filters ? filterSearchResults(data, filters) : data);
  
  // sort search results based on datum
  searchResults.sort((a: SearchResult, b: SearchResult) => {
    if (sortOrder === "asc") {
      return a.datum.getTime() - b.datum.getTime();
    }
    return b.datum.getTime() - a.datum.getTime();
  });

  return {
    items: searchResults.slice(page * pageSize, (page + 1) * pageSize),
    collectionAttributes: {
      filterOptions: getSearchResultsFilterOptions(data),
      page,
      pageSize,
      totalPages: Math.ceil(searchResults.length / pageSize),
      totalItems: searchResults.length,
      sortOrder,
    },
  };
}

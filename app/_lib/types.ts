type SearchResultBase = {
  suchtext: string;
  bildnummer: string;
  fotografen: string;
  hoehe: string;
  breite: string;
};

export type PreProcessedSearchResult = SearchResultBase & {
  datum: string;
}
export type SearchResult = SearchResultBase & {
  datum: Date;
  restrictions?: string[];
}

export type SearchResultResponse = SearchResultBase & {
  datum: string;
  restrictions?: string[];
}

export type Filters = {
  suchtext: string | null;
  fotografen: string | null;
  datum: {
    from: Date;
    to: Date;
  } | null;
  restrictions: string[] | null;
}

export type SortBy = keyof Pick<SearchResult, "datum">;
export type SortOrder = "asc" | "desc";

export type FilterOptions = {
  fotografen: string[] | null;
  datum: string[] | null;
  restrictions: string[] | null;
}

export type SearchAnalytics = {
  totalSearchRequests: number;
  mostCommonQueryTerms: Array<{ term: string; count: number }>;
};

export type SearchResultsCollectionAttributes = {
  filterOptions: FilterOptions;
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  sortOrder: SortOrder;
};

export type SearchApiResponse = {
  items: SearchResultResponse[];
  collectionAttributes: SearchResultsCollectionAttributes;
  queryTimeMs: number;
};
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
}

export type Filters = {
  suchtext: string | null;
  fotografen: string | null;
  datum: string[] | null;
  restrictions: string | null;
}

export type SortBy = keyof Pick<SearchResult, "datum">;
export type SortOrder = "asc" | "desc";

export type FilterOptions = {
  fotografen: string[] | null;
  datum: string[] | null;
  restrictions: string[] | null;
}
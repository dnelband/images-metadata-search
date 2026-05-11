"use client";

import { useEffect, useState } from "react";
import {
  Filters,
  SearchResultResponse,
  SearchResultsCollectionAttributes,
  SearchApiResponse,
  SortOrder,
} from "./_lib/types";
import SearchClient from "./_components/SearchClient";
import ReactPaginate from "react-paginate";
import { formatDate } from "date-fns/format";

const getBackgroundColor = (bildnummer: string) => {
  let numStr = bildnummer.replace(/\D/g, '');
  if (parseInt(numStr) % 2 === 0) {
    numStr = numStr.split('').reverse().join('');
  }
  const hash = numStr.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const sillyMultiplier = 123456789;
  const base = hash * sillyMultiplier;
  const r = base % 256;
  const g = (base * 7) % 256;
  const b = (base * 13) % 256;
  return `rgb(${r}, ${g}, ${b})`;
};

const createSnippet = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  
  // If text is short, return as is
  if (text.length <= 35) return text;
  
  // Return first 35 characters with ellipsis
  return text.substring(0, 35) + "...";
};

const defaultFilters: Filters = {
  suchtext: "",
  fotografen: "",
  datum: null,
  restrictions: null,
} as Filters;

export default function Page() {
  const [items, setItems] = useState<SearchResultResponse[]>([]);
  const [collectionAttributes, setCollectionAttributes] =
    useState<SearchResultsCollectionAttributes | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      const pageSize = 10;
      const params = new URLSearchParams();
      if (filters.suchtext) params.set("suchtext", filters.suchtext);
      if (filters.fotografen) params.set("fotografen", filters.fotografen);
      if (filters.restrictions && filters.restrictions.length > 0) params.set("restrictions", filters.restrictions.join(","));
      if (filters.datum?.from) params.set("from", filters.datum.from.toISOString().split("T")[0]);
      if (filters.datum?.to) params.set("to", filters.datum.to.toISOString().split("T")[0]);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      params.set("sortOrder", sortOrder);

      try {
        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Failed to fetch search results");
        }

        const data = (await response.json()) as SearchApiResponse;
        setItems(data.items);
        setCollectionAttributes(data.collectionAttributes);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [filters, page, sortOrder]);

  const clearFilters = () => {
    setFilters(defaultFilters);
    setPage(0);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen text-white">
      {collectionAttributes && (
        <SearchClient
          filters={filters}
          setFilters={setFilters}
          filterOptions={collectionAttributes.filterOptions}
          clearFilters={clearFilters}
        />
      )}
      {items && collectionAttributes && (
        <div className="flex flex-col items-stretch pt-4 pb-4 gap-4">
          <div className="flex flex-row w-full gap-4 justify-between items-center">
            <h1 className="text-2xl font-bold">
              Showing {items.length} of total {collectionAttributes.totalItems} results
            </h1>
            <select
              className="p-2 border border-gray-600 rounded bg-gray-700 text-white"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          {error && <div className="text-red-400">{error}</div>}
        {loading && <div className="text-gray-300">Loading results…</div>}
        {!loading && items.length === 0 && (
          <div className="text-gray-300">No results found.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-lg shadow-md flex flex-col justify-between min-h-[200px] text-black"
              style={{ backgroundColor: getBackgroundColor(item.bildnummer) }}
            >
              <div>
                <h2 className="text-lg font-bold mb-2">{item.bildnummer}</h2>
                {filters.suchtext && (
                  <p className="mb-1">{createSnippet(item.suchtext, filters.suchtext)}</p>
                )}
                <p className="mb-1">{item.fotografen}</p>
              </div>
              <p className="text-sm">{formatDate(new Date(item.datum), "dd.MM.yyyy")}</p>
            </div>
          ))}
        </div>

          <div className="mx-auto max-w-[240px]">
            <ReactPaginate
              breakLabel="..."
              nextLabel="next >"
              onPageChange={(nextPage) => setPage(nextPage.selected)}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              pageCount={collectionAttributes.totalPages}
              previousLabel="< previous"
              renderOnZeroPageCount={null}
              activeClassName={"font-bold"}
              pageClassName={"cursor-pointer"}
              previousClassName={"cursor-pointer"}
              nextClassName={"cursor-pointer"}
              className="flex flex-row gap-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}

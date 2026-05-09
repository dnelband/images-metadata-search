"use client";

import { useEffect, useState } from "react";
import { Filters, SearchResult, SortOrder } from "./_lib/types";
import SearchClient from "./_components/SearchClient";
import {
  getSearchResults,
  SearchResultsCollectionAttributes,
} from "./search/route";
import ReactPaginate from "react-paginate";
import { formatDate } from "date-fns/format";

const defaultFilters: Filters = {
  suchtext: "",
  fotografen: "",
  datum: null,
  restrictions: null,
};

export default function Page() {
  const [items, setItems] = useState<SearchResult[]>([]);
  const [collectionAttributes, setCollectionAttributes] =
    useState<SearchResultsCollectionAttributes | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    collectionAttributes?.sortOrder || "asc",
  );
  const [page, setPage] = useState(collectionAttributes?.page || 0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const data = await getSearchResults({});
        setItems(data.items);
        setCollectionAttributes(data.collectionAttributes);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getSearchResults({ filters, page, sortOrder });
        setItems(data.items);
        setCollectionAttributes(data.collectionAttributes);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (filters) {
      fetchData();
    }
  }, [filters, page, sortOrder]);

  const clearFilters = () => {
    setFilters(defaultFilters);
    setPage(0);
  };

  return (
    <div>
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
          <div className="flex flex-row w-full gap-4 space-between">
            <h1>
              showing {items.length} of total {collectionAttributes.totalItems}
            </h1>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {items.map((item, index) => (
              <div key={index}>
                <h2 className="text-md font-bold">{item.bildnummer}</h2>
                <p>{item.suchtext}</p>
                <p>{item.fotografen}</p>
                <p>{formatDate(item.datum, "dd.MM.yyyy")}</p>
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

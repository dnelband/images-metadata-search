"use client";

import { useSearchHistory } from "../_hooks/useSearchHistory";
import { normalizeRestriction } from "../_lib/normalizeRestriction";
import { FilterOptions, Filters } from "../_lib/types";

interface SearchClientProps {
  filters: Filters;
  filterOptions: FilterOptions;
  setFilters: (filters: Filters) => void;
  clearFilters: () => void;
}

export default function SearchClient({
  filters,
  filterOptions,
  setFilters,
  clearFilters,
}: SearchClientProps) {
  const { searchHistory, addToSearchHistory } = useSearchHistory();
  const updateFilters = (name: keyof Filters, value: string | string[]) => { 
    setFilters({ ...filters, [name]: value });
    if (name === "suchtext") {
      addToSearchHistory(value.toString());
    }
  }
  return (
    <div>
      <div className="flex flex-row gap-4 p-2">
        <div className="flex flex-row gap-4 flex-grow">
          <div className="flex flex-grow relative">
            <input
              className="flex flex-grow"
              type="text"
              placeholder="Suchtext ..."
              value={filters.suchtext || ""}
              onChange={(e) => {
                updateFilters("suchtext", e.target.value);
              }}
            />
            {filters.suchtext && filters.suchtext.length > 2 && (
              <div className="mt-2 absolute top-4 left-0 bg-gray-700 border border-gray-300 rounded shadow-lg z-10 w-full p-2">
                <ul>
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <li
                      key={index}
                      className="cursor-pointer"
                      onClick={() => {
                        updateFilters("suchtext", item);
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex flex-row gap-4">
            <select
              onChange={(e) =>
                updateFilters("fotografen", e.target.value)
              }
              value={filters.fotografen || ""}
            >
              <option value="">Fotografen</option>
              {filterOptions.fotografen?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              onChange={(e) =>
                updateFilters("restrictions", e.target.value)
              }
              value={filters.restrictions || ""}
            >
              <option value="">Restrictions</option>
              {filterOptions.restrictions &&
                filterOptions.restrictions.map((option) => (
                  <option key={option} value={option}>
                    {normalizeRestriction(option)}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <button className="cursor-pointer" onClick={() => clearFilters()}>
          Clear Filters
        </button>
      </div>
      <hr />
    </div>
  );
}

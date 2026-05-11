"use client";

import { useEffect, useState, useRef } from "react";
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
  const [localSuchtext, setLocalSuchtext] = useState(filters.suchtext ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showRestrictionsDropdown, setShowRestrictionsDropdown] =
    useState(false);
  const { searchHistory, searchCounts, addToSearchHistory } =
    useSearchHistory();
  const inputRef = useRef<HTMLDivElement>(null);
  const restrictionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalSuchtext(filters.suchtext ?? "");
  }, [filters.suchtext]);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      if (localSuchtext !== filters.suchtext) {
        setFilters({ ...filters, suchtext: localSuchtext });
        if (localSuchtext.trim()) {
          addToSearchHistory(localSuchtext);
        }
      }
    }, 300);

    return () => window.clearTimeout(handler);
  }, [localSuchtext, filters, setFilters, addToSearchHistory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
      if (
        restrictionsRef.current &&
        !restrictionsRef.current.contains(event.target as Node)
      ) {
        setShowRestrictionsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleRestrictionAndClose = (restriction: string) => {
    toggleRestriction(restriction);
    setShowRestrictionsDropdown(false);
  };

  const parseFilterDatum = (datum: string[] | null | undefined) => {
    return (
      datum
        ?.map((date) => new Date(date))
        .filter((date) => !Number.isNaN(date.getTime())) ?? []
    );
  };

  const dateOptions = parseFilterDatum(filterOptions.datum);
  const fromDate = filters.datum?.from ?? dateOptions[0] ?? new Date();
  const toDate =
    filters.datum?.to ?? dateOptions[dateOptions.length - 1] ?? new Date();

  const updateFilters = (
    name: keyof Filters,
    value: string | string[] | Record<string, unknown>,
  ) => {
    setFilters({ ...filters, [name]: value });
  };

  const toggleRestriction = (restriction: string) => {
    const current = filters.restrictions ?? [];
    const updated = current.includes(restriction)
      ? current.filter((r) => r !== restriction)
      : [...current, restriction];
    updateFilters(
      "restrictions",
      (updated.length > 0 ? updated : null) as
        | string[]
        | Record<string, unknown>,
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg shadow-md">
      <div className="flex flex-row gap-4">
        <div className="flex relative flex-1" ref={inputRef}>
          <input
            className="flex-1 p-2 border border-gray-600 rounded bg-gray-700 text-white"
            type="text"
            placeholder="Suchtext ..."
            value={localSuchtext}
            onChange={(e) => {
              setLocalSuchtext(e.target.value);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && searchHistory.length > 0 && (
            <div className="mt-2 absolute top-full left-0 bg-gray-800 border border-gray-600 rounded shadow-lg z-10 w-full p-2">
              <ul>
                {searchHistory.slice(0, 5).map((item, index) => (
                  <li
                    key={index}
                    className="cursor-pointer p-1 hover:bg-gray-700 text-white"
                    onClick={() => {
                      setLocalSuchtext(item);
                      updateFilters("suchtext", item);
                      addToSearchHistory(item);
                      setShowSuggestions(false);
                    }}
                  >
                    {item} ({searchCounts[item]})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row gap-4 flex-wrap justify-between">
        <div className="flex flex-row gap-2 items-center">
          <label className="text-sm font-medium whitespace-nowrap">
            Fotografen
          </label>
          <select
            className="p-2 border border-gray-600 rounded bg-gray-700 text-white"
            onChange={(e) => updateFilters("fotografen", e.target.value)}
            value={filters.fotografen || ""}
          >
            <option value="">-- Select --</option>
            {filterOptions.fotografen?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-row gap-2 items-center">
          <div className="flex flex-row gap-2 items-center">
            <label className="text-sm font-medium whitespace-nowrap">
              From
            </label>
            <input
              type="date"
              className="p-2 border border-gray-600 rounded bg-gray-700 text-white"
              value={fromDate.toISOString().split("T")[0]}
              onChange={(e) => {
                const date = new Date(e.target.value);
                if (!isNaN(date.getTime())) {
                  updateFilters("datum", {
                    from: date,
                    to: filters.datum?.to ?? date,
                  });
                }
              }}
            />
          </div>
          <div className="flex flex-row gap-2 items-center">
            <label className="text-sm font-medium whitespace-nowrap">To</label>
            <input
              type="date"
              className="p-2 border border-gray-600 rounded bg-gray-700 text-white"
              value={toDate.toISOString().split("T")[0]}
              onChange={(e) => {
                const date = new Date(e.target.value);
                if (!isNaN(date.getTime())) {
                  updateFilters("datum", {
                    from: filters.datum?.from ?? date,
                    to: date,
                  });
                }
              }}
            />
          </div>
        </div>
        <div
          className="flex flex-row gap-2 items-start relative"
          ref={restrictionsRef}
        >
          <label className="text-sm font-medium whitespace-nowrap pt-2">
            Restrictions
          </label>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex flex-row gap-2 flex-wrap">
              {(filters.restrictions ?? []).map((restriction) => (
                <div
                  key={restriction}
                  className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm flex items-center gap-2"
                >
                  {normalizeRestriction(restriction)}
                  <button
                    onClick={() => toggleRestriction(restriction)}
                    className="hover:text-gray-200 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                setShowRestrictionsDropdown(!showRestrictionsDropdown)
              }
              className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-white text-sm hover:bg-gray-600 self-start"
            >
              Add Restriction
            </button>
            {showRestrictionsDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-10 w-48 p-2">
                <ul className="max-h-48 overflow-y-auto">
                  {filterOptions.restrictions &&
                    filterOptions.restrictions.map((option) => (
                      <li
                        key={option}
                        className="cursor-pointer p-2 hover:bg-gray-700 text-white text-sm flex items-center gap-2"
                        onClick={() => {
                          toggleRestrictionAndClose(option);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={(filters.restrictions ?? []).includes(
                            option,
                          )}
                          onChange={() => {}}
                          className="cursor-pointer"
                        />
                        {normalizeRestriction(option)}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => clearFilters()}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

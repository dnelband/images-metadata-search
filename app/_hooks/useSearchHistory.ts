"use client";

import { useEffect, useState } from "react";

export const useSearchHistory = () => {
  const [searchCounts, setSearchCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const storedCounts = localStorage.getItem("searchAnalytics");
    if (storedCounts) {
      setSearchCounts(JSON.parse(storedCounts));
    }
  }, []);

  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return;
    const updatedCounts = { ...searchCounts, [query]: (searchCounts[query] || 0) + 1 };
    localStorage.setItem("searchAnalytics", JSON.stringify(updatedCounts));
    setSearchCounts(updatedCounts);
  };

  const searchHistory = Object.entries(searchCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([term]) => term);

  return { searchHistory, searchCounts, addToSearchHistory };
};

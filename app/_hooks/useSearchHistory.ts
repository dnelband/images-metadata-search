"use client";

import { useEffect, useState } from "react";

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem("searchHistory");
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return; 
    const updatedHistory = [query, ...searchHistory];
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    // need to add some anayltics here, like number of searches, most common search terms, etc.
    setSearchHistory(updatedHistory);
  };

  return { searchHistory, addToSearchHistory };
};

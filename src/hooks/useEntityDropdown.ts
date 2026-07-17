// src/hooks/useEntityDropdown.ts
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getEntityDropdownOptions } from "../services/dropdown.service";

export const useEntityDropdown = ({
  dropdownName,
  pageSize = 20,
}: {
  dropdownName: string;
  pageSize?: number;
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const requestRef = useRef(0);

  const fetchData = async (
    searchValue: string,
    pageNumber: number,
    reset = false,
    signal?: AbortSignal,
  ) => {
    const requestId = ++requestRef.current;
    setLoading(true);

    try {
      const res = await getEntityDropdownOptions(
        {
          dropdown_name: dropdownName,
          search: searchValue,
          page: pageNumber,
          page_size: pageSize,
        },
        signal,
      );

      if (requestId !== requestRef.current) return;

      const newItems = res.items || [];

      setOptions(prev => (reset ? newItems : [...prev, ...newItems]));
      setHasMore((pageNumber * pageSize) < res.total);
    } catch (err) {
      if (!axios.isCancel(err)) throw err;
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    setPage(1);
    fetchData(search, 1, true, controller.signal);
    return () => controller.abort();
  }, [search]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchData(search, next);
  };

  return {
    options,
    loading,
    search,
    setSearch,
    loadMore,
  };
};
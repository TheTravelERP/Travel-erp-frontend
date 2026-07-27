// src/hooks/useEntityDropdown.ts
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getEntityDropdownOptions, getEntityDropdownOptionByValue } from "../services/dropdown.service";

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
  // Tracks values already resolved via ensureOptionLoaded, so an edit form
  // pre-filled with a value outside the first general page (e.g. a country
  // near the end of an alphabetical list) doesn't re-fetch it every render.
  const resolvedValuesRef = useRef(new Set<string>());

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

      setOptions(prev => {
        if (!reset) return [...prev, ...newItems];

        // A reset (general/search) fetch fires on mount at the same time as
        // ensureOptionLoaded's targeted lookup below. If this one resolves
        // *after* ensureOptionLoaded has already merged a resolved value in,
        // a plain `newItems` replace would silently wipe it back out —
        // leaving an edit form's pre-filled value (e.g. one outside the
        // first alphabetical page) stuck on "Loading..." forever. Preserve
        // any already-resolved entries this page doesn't already contain.
        const preserved = prev.filter(
          (o) => resolvedValuesRef.current.has(o.value) && !newItems.some((n: any) => n.value === o.value),
        );
        return preserved.length ? [...preserved, ...newItems] : newItems;
      });
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

  // Resolves a single pre-selected value that may not be in the currently
  // loaded (paginated, unsearched) options — e.g. editing a record whose
  // stored value (often a uuid) sorts outside the first page, or isn't
  // even matchable via the fuzzy label-based `search` param at all. Uses
  // the exact value_column lookup so this works regardless of whether
  // value_column happens to be one of the dropdown's search_columns.
  // Fires a one-off, isolated fetch and merges the result in, without
  // touching `search`/`page`/`hasMore` so general browsing is unaffected.
  const ensureOptionLoaded = async (targetValue: string | null | undefined) => {
    if (!targetValue) return;
    if (resolvedValuesRef.current.has(targetValue)) return;
    if (options.some((o) => o.value === targetValue)) {
      resolvedValuesRef.current.add(targetValue);
      return;
    }

    resolvedValuesRef.current.add(targetValue);

    try {
      const match = await getEntityDropdownOptionByValue({
        dropdown_name: dropdownName,
        value: targetValue,
      });

      if (match) {
        setOptions((prev) => (prev.some((o) => o.value === match.value) ? prev : [match, ...prev]));
      }
    } catch (err) {
      if (!axios.isCancel(err)) throw err;
    }
  };

  return {
    options,
    loading,
    search,
    setSearch,
    loadMore,
    ensureOptionLoaded,
  };
};
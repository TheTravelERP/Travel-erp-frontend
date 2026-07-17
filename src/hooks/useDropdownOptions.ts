// src/hooks/useDropdownOptions.ts
import { useEffect, useState } from "react";
import { getDropdownOptions } from "../services/dropdown.service";

/**
 * Many components (e.g. every chip in a table row) can ask for the same
 * dropdown_name in the same render pass. Cache resolved options per
 * dropdown_name and de-dupe concurrent requests so N chips only ever
 * trigger a single network call instead of N.
 */
const optionsCache = new Map<string, any[]>();
const inflightRequests = new Map<string, Promise<any[]>>();
const subscribers = new Map<string, Set<(options: any[]) => void>>();

function fetchOptions(dropdownName: string): Promise<any[]> {
  const existing = inflightRequests.get(dropdownName);
  if (existing) return existing;

  const request = getDropdownOptions({ dropdown_name: dropdownName })
    .then((data) => {
      optionsCache.set(dropdownName, data);
      subscribers.get(dropdownName)?.forEach((notify) => notify(data));
      return data;
    })
    .catch(() => {
      optionsCache.set(dropdownName, []);
      subscribers.get(dropdownName)?.forEach((notify) => notify([]));
      return [];
    })
    .finally(() => {
      inflightRequests.delete(dropdownName);
    });

  inflightRequests.set(dropdownName, request);
  return request;
}

export function useDropdownOptions(dropdownName: string) {
  const [options, setOptions] = useState<any[]>(
    () => optionsCache.get(dropdownName) ?? [],
  );
  const [loading, setLoading] = useState(!optionsCache.has(dropdownName));

  useEffect(() => {
    if (!dropdownName) return;

    if (optionsCache.has(dropdownName)) {
      setOptions(optionsCache.get(dropdownName)!);
      setLoading(false);
      return;
    }

    let set = subscribers.get(dropdownName);
    if (!set) {
      set = new Set();
      subscribers.set(dropdownName, set);
    }

    const notify = (data: any[]) => {
      setOptions(data);
      setLoading(false);
    };
    set.add(notify);

    setLoading(true);
    fetchOptions(dropdownName);

    return () => {
      subscribers.get(dropdownName)?.delete(notify);
    };
  }, [dropdownName]);

  return { options, loading };
}

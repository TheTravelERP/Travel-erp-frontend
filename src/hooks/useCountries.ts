// src/hooks/useCountries.ts
import { useEffect, useState } from "react";
import { getCountries } from "../services/public.service";

export interface Country {
  iso_code: string;
  label: string;
  nationality: string;
  phone_code: string;
  flag_url: string;
}

/**
 * country_master is a small (~245 rows), global, effectively-static list —
 * cache it once per app session (mirrors useDropdownOptions.ts's pattern)
 * so every consumer (Country picker, Nationality picker, Passport Issue
 * Country picker, filters, etc.) shares a single fetch instead of each
 * re-requesting the same 245 rows independently.
 */
let cache: Country[] | null = null;
let inflight: Promise<Country[]> | null = null;
const subscribers = new Set<(v: Country[]) => void>();

function load(): Promise<Country[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;

  inflight = getCountries()
    .then((res) => {
      const items = res.items || [];
      cache = items;
      subscribers.forEach((notify) => notify(items));
      return items;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function useCountries(): { countries: Country[]; loading: boolean } {
  const [countries, setCountries] = useState<Country[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;

    const notify = (v: Country[]) => {
      setCountries(v);
      setLoading(false);
    };
    subscribers.add(notify);
    load().catch(() => setLoading(false));

    return () => {
      subscribers.delete(notify);
    };
  }, []);

  return { countries, loading };
}

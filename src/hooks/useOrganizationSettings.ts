// src/hooks/useOrganizationSettings.ts
import { useEffect, useState } from "react";
import { fetchOrganizationSettings, type OrganizationProfile } from "../services/organization.service";

/**
 * Module-level cache so every component that needs org-level settings
 * (e.g. financial_year_start_month) shares a single fetch per app session,
 * mirroring the pattern in useDropdownOptions.ts.
 */
let cache: OrganizationProfile | null = null;
let inflight: Promise<OrganizationProfile> | null = null;
const subscribers = new Set<(v: OrganizationProfile) => void>();

function load(): Promise<OrganizationProfile> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;

  inflight = fetchOrganizationSettings()
    .then((data) => {
      cache = data;
      subscribers.forEach((notify) => notify(data));
      return data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function useOrganizationSettings(): OrganizationProfile | null {
  const [data, setData] = useState<OrganizationProfile | null>(cache);

  useEffect(() => {
    if (cache) return;

    const notify = (v: OrganizationProfile) => setData(v);
    subscribers.add(notify);
    load().catch(() => {});

    return () => {
      subscribers.delete(notify);
    };
  }, []);

  return data;
}

/** Convenience for callers that only need the FY start month; defaults to 1 (January) while loading. */
export function useFinancialYearStartMonth(): number {
  return useOrganizationSettings()?.financial_year_start_month ?? 1;
}

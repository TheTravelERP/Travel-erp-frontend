// src/hooks/useLocalizationProfile.ts
import { useEffect, useState } from "react";
import { fetchEffectiveFormatSettings, type EffectiveFormatSettings } from "../services/localizationFormat.service";

/**
 * Module-level cache so every table/view that needs date/time/number
 * formatting shares a single fetch per app session, mirroring the pattern
 * in useOrganizationSettings.ts.
 */
let cache: EffectiveFormatSettings | null = null;
let inflight: Promise<EffectiveFormatSettings> | null = null;
const subscribers = new Set<(v: EffectiveFormatSettings) => void>();

function load(): Promise<EffectiveFormatSettings> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;

  inflight = fetchEffectiveFormatSettings()
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

/** Returns null while loading — formatters fall back to sane defaults (YYYY-MM-DD, 24h, western) until this resolves. */
export function useLocalizationProfile(): EffectiveFormatSettings | null {
  const [data, setData] = useState<EffectiveFormatSettings | null>(cache);

  useEffect(() => {
    if (cache) return;

    const notify = (v: EffectiveFormatSettings) => setData(v);
    subscribers.add(notify);
    load().catch(() => {});

    return () => {
      subscribers.delete(notify);
    };
  }, []);

  return data;
}

// src/hooks/useDropdownOptions.ts
import { useEffect, useState } from "react";
import { getDropdownOptions } from "../services/dropdown.service";

export function useDropdownOptions(dropdownName: string) {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dropdownName) return;

    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getDropdownOptions({
          dropdown_name: dropdownName,
        });

        if (active) setOptions(data);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [dropdownName]);

  return { options, loading };
}

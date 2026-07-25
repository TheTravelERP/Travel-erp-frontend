// src/components/common/CountryAutocomplete.tsx

import { Autocomplete, TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import { useCountries } from "../../hooks/useCountries";

/**
 * Country-master-backed picker. `field` selects which property of the
 * matched country row is the value/display for this instance — so the
 * same country_master list can back a "Country" picker (field="label")
 * and a "Nationality" picker (field="nationality") side by side without
 * either one re-fetching or duplicating Autocomplete boilerplate.
 */
interface CountryAutocompleteProps {
  label: string;
  field: "label" | "nationality";

  // React Hook Form mode (default) — requires `control`/`name`.
  name?: string;
  control?: any;
  useForm?: boolean;

  // Filter mode (useForm={false}) — plain controlled value/onChange.
  value?: string | null;
  onChange?: (value: string | null) => void;

  disabled?: boolean;
}

export default function CountryAutocomplete({
  label,
  field,
  name,
  control,
  useForm = true,
  value,
  onChange,
  disabled = false,
}: CountryAutocompleteProps) {
  const { countries, loading } = useCountries();

  const renderAutocomplete = (
    currentValue: string | null | undefined,
    handleChange: (value: string | null) => void,
    error?: boolean,
    helperText?: string,
  ) => (
    <Autocomplete
      options={countries}
      loading={loading}
      disabled={disabled}
      value={countries.find((c) => c[field] === currentValue) || null}
      // Multiple countries can legitimately share the same nationality demonym
      // (e.g. Guernsey/Jersey are both "Channel Islander") — iso_code is the
      // one field guaranteed unique per row, so it (not the display field) is
      // what identifies an option and keys it in the list. Matching/keying by
      // the display string instead caused React key collisions that garbled
      // the dropdown (duplicated/stale-looking entries, filtering breaking).
      getOptionKey={(option) => option.iso_code}
      isOptionEqualToValue={(option, val) => option.iso_code === val?.iso_code}
      getOptionLabel={(option) => option?.[field] || ""}
      onChange={(_, val) => handleChange(val?.[field] || null)}
      renderInput={(params) => (
        <TextField {...params} label={label} fullWidth error={error} helperText={helperText} />
      )}
    />
  );

  if (useForm && control && name) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field: rhfField, fieldState }) =>
          renderAutocomplete(
            rhfField.value,
            rhfField.onChange,
            !!fieldState.error,
            fieldState.error?.message,
          )
        }
      />
    );
  }

  return renderAutocomplete(value, onChange ?? (() => {}));
}

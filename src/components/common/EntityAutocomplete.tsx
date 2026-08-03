// src/components/common/EntityAutocomplete.tsx

import React from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { useEntityDropdown } from "../../hooks/useEntityDropdown";

/* ---------------- TYPES ---------------- */

interface EntityAutocompleteProps {
  name: string;
  label: string;
  dropdownName: string;
  pageSize?: number;
  disabled?: boolean;

  // Scopes the dropdown's rows to a specific Document Type (by its stable
  // code, e.g. "QTN") — only applies to entities that carry a
  // document_type_id FK on the backend, a no-op otherwise.
  documentTypeCode?: string;

  // React Hook Form mode (default) — requires `control`.
  control?: any;
  useForm?: boolean;

  // Filter mode (useForm={false}) — plain controlled value/onChange, no form.
  value?: string | null;
  onChange?: (value: string | null) => void;

  // Optional features
  onAddNew?: () => void;
  allowAdd?: boolean;

  // Restrict the dropdown to a subset of options (e.g. only the document
  // types that are actually printable) without touching the backend
  // dropdown_config — evaluated against the raw {label, value} option.
  filterOption?: (option: { label: string; value: string }) => boolean;

  // Generic autofill mapping (React Hook Form mode only)
  setValue?: any;
  autoFillMap?: Record<string, string>;

  // Custom per-option rendering (e.g. a status chip) — passed straight
  // through to MUI's Autocomplete. Option shape is {label, value, ...meta_columns}.
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement> & { key?: any },
    option: any,
  ) => React.ReactNode;

  // Fires with the complete raw option object (all meta_columns included,
  // not just the fields covered by autoFillMap) whenever the selection
  // changes — lets a caller react to more than one field at once without
  // stitching together several autoFillMap-driven setValue calls.
  onOptionSelected?: (option: any | null) => void;
}

/* ---------------- COMPONENT ---------------- */

export default function EntityAutocomplete({
  name,
  label,
  control,
  dropdownName,
  pageSize = 20,
  disabled = false,
  documentTypeCode,
  onAddNew,
  allowAdd = false,
  setValue,
  autoFillMap,
  useForm = true,
  value,
  onChange,
  filterOption,
  renderOption,
  onOptionSelected,
}: EntityAutocompleteProps) {
  const { options: rawOptions, loading, setSearch, loadMore, ensureOptionLoaded } = useEntityDropdown({
    dropdownName,
    pageSize,
    documentTypeCode,
  });

  const options = filterOption ? rawOptions.filter(filterOption) : rawOptions;

  const renderAutocomplete = (
    currentValue: string | null | undefined,
    handleChange: (value: string | null) => void,
    error?: boolean,
    helperText?: string,
  ) => {
    const selected =
      options.find((o) => o.value === currentValue) ||
      (currentValue
        ? { label: "Loading...", value: currentValue }
        : null);

    // Fire-and-forget: resolves the currently selected value into `options`
    // when it falls outside the first unsearched page (e.g. editing a
    // record whose stored value isn't near the top of an alphabetical
    // list) — without this, `selected` above falls back to a permanent
    // "Loading..." placeholder that never resolves. Guarded internally
    // (resolvedValuesRef) so this is a no-op once the value is loaded.
    void ensureOptionLoaded(currentValue);

    return (
      <Autocomplete
        value={selected}
        options={options}
        loading={loading}
        disabled={disabled}
        {...(renderOption ? { renderOption } : {})}

        /* ---------------- LABEL ---------------- */
        getOptionLabel={(option: any) => option?.label || ""}

        /* ---------------- EQUALITY ---------------- */
        isOptionEqualToValue={(opt: any, val: any) =>
          opt?.value === val?.value
        }

        /* ---------------- SEARCH ---------------- */
        onInputChange={(_, value, reason) => {
          if (reason === "input") {
            setSearch(value);
          }
        }}

        /* ---------------- CHANGE ---------------- */
        onChange={(_, val: any) => {
          // 🔹 ADD NEW
          if (val?.value === "__add__") {
            onAddNew?.();
            return;
          }

          handleChange(val ? val.value : null);
          onOptionSelected?.(val ?? null);

          // 🔹 GENERIC AUTOFILL (REUSABLE, form mode only)
          if (val && setValue && autoFillMap) {
            Object.entries(autoFillMap).forEach(
              ([formField, key]) => {
                if (val[key] !== undefined) {
                  setValue(formField, val[key]);
                }
              }
            );
          }
        }}

        /* ---------------- ADD NEW OPTION ---------------- */
        filterOptions={(opts, params) => {
          const filtered = [...opts];

          const exists = opts.some(
            (o: any) =>
              o.label?.toLowerCase() ===
              params.inputValue.toLowerCase()
          );

          if (allowAdd && params.inputValue !== "" && !exists) {
            filtered.push({
              label: `Add "${params.inputValue}"`,
              value: "__add__",
            });
          }

          return filtered;
        }}

        /* ---------------- INFINITE SCROLL ---------------- */
        ListboxProps={{
          onScroll: (e: any) => {
            const node = e.currentTarget;

            if (
              node.scrollTop + node.clientHeight >=
                node.scrollHeight - 20 &&
              !loading
            ) {
              loadMore();
            }
          },
        }}

        /* ---------------- INPUT ---------------- */
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            fullWidth
            error={error}
            helperText={helperText}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && (
                    <CircularProgress size={18} />
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    );
  };

  // ✅ FORM MODE
  if (useForm && control) {
    return (
      <Controller
        name={name}
        control={control}
        defaultValue={null}
        render={({ field, fieldState }) =>
          renderAutocomplete(field.value, field.onChange, !!fieldState.error, fieldState.error?.message)
        }
      />
    );
  }

  // ✅ FILTER MODE
  return renderAutocomplete(value, onChange ?? (() => {}));
}

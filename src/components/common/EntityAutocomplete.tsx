// src/components/common/EntityAutocomplete.tsx

import React, { useRef, useState } from "react";
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

  // Scopes the dropdown's rows to a specific Package (e.g. Departures on
  // the Booking form) — only applies to entities that carry a pkg_id FK on
  // the backend, a no-op otherwise.
  pkgUuid?: string | null;

  // Scopes the dropdown's rows to a specific Country (e.g. the Location
  // form's State/Province picker) — only applies to entities that carry a
  // country_code column on the backend, a no-op otherwise.
  countryCode?: string | null;

  // Scopes the dropdown's rows to a specific Product (the Quotation form's
  // Product Price picker) — only applies to entities that carry a
  // product_id column on the backend, a no-op otherwise.
  productUuid?: string | null;

  // Scopes the dropdown's rows to Products applicable to this quotation
  // service type (the Quotation form's Product picker) — only applies to
  // entities that carry a service_type relationship on the backend, a
  // no-op otherwise.
  quotationServiceType?: string | null;

  // Static options always prepended ahead of the fetched list, unaffected
  // by search text (this component's own filterOptions never client-side
  // filters — see below) — used for a permanent synthetic first choice,
  // e.g. the Quotation form's Product picker offering "Manual" as its
  // first-ever option regardless of what's typed.
  staticOptions?: { label: string; value: string }[];

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

  // Seeds the dropdown's first fetch AND the visible input text with a
  // search term (e.g. an Enquiry's customer-name snapshot), so the options
  // list arrives already filtered instead of a general/blank listing. Only
  // ever read once at mount — when omitted (every existing caller), the
  // input stays fully uncontrolled exactly as before this prop existed.
  initialInputValue?: string;
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
  pkgUuid,
  countryCode,
  productUuid,
  quotationServiceType,
  staticOptions,
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
  initialInputValue,
}: EntityAutocompleteProps) {
  const { options: rawOptions, loading, setSearch, loadMore, ensureOptionLoaded } = useEntityDropdown({
    dropdownName,
    pageSize,
    documentTypeCode,
    pkgUuid,
    countryCode,
    productUuid,
    quotationServiceType,
    initialSearch: initialInputValue,
  });

  // Mirrors MUI Autocomplete's own inputValue so a caller-seeded
  // initialInputValue actually shows in the text box on mount (Autocomplete
  // is otherwise fully uncontrolled here) — only spread onto the element
  // below when initialInputValue was provided at all, so every other caller
  // keeps today's exact uncontrolled behavior.
  const [inputValue, setInputValue] = useState(initialInputValue ?? "");

  const searchedOptions = filterOption ? rawOptions.filter(filterOption) : rawOptions;
  const options = staticOptions?.length ? [...staticOptions, ...searchedOptions] : searchedOptions;

  // Caches the resolved option object per value, keyed by value — MUI's
  // Autocomplete resets its displayed input text back to getOptionLabel(value)
  // whenever the `value` prop's object *reference* changes, even if it's the
  // same logical selection. Recomputing `selected` as a fresh object literal
  // every render (as this used to do) meant every keystroke — which refetches
  // `options` via setSearch and produces a new array/object each time — handed
  // Autocomplete a "changed" value and it stomped the user's in-progress edit,
  // snapping the field back to the full original label. Backspacing into an
  // already-selected value looked broken; only the Clear button (which nulls
  // currentValue, so there's nothing to snap back to) reliably worked. Caching
  // by value keeps the same reference across re-renders/refetches, so typing
  // to search for something else no longer gets reverted mid-edit.
  const resolvedOptionsRef = useRef<Record<string, { label: string; value: string }>>({});

  const renderAutocomplete = (
    currentValue: string | null | undefined,
    handleChange: (value: string | null) => void,
    error?: boolean,
    helperText?: string,
  ) => {
    const found = options.find((o) => o.value === currentValue);
    if (found && currentValue) {
      resolvedOptionsRef.current[currentValue] = found;
    }
    const selected = currentValue
      ? resolvedOptionsRef.current[currentValue] ?? { label: "Loading...", value: currentValue }
      : null;

    // Fire-and-forget: resolves the currently selected value into `options`
    // when it falls outside the first unsearched page (e.g. editing a
    // record whose stored value isn't near the top of an alphabetical
    // list) — without this, `selected` above falls back to a permanent
    // "Loading..." placeholder that never resolves. Guarded internally
    // (resolvedValuesRef) so this is a no-op once the value is loaded.
    // Skip entirely for a staticOptions value (e.g. the Quotation Product
    // picker's "__manual__" sentinel) — it's never a real backend row, so
    // ensureOptionLoaded's by-value lookup would just 404/500 every render.
    const isStaticValue = staticOptions?.some((o) => o.value === currentValue);
    if (!isStaticValue) void ensureOptionLoaded(currentValue);

    return (
      <Autocomplete
        value={selected}
        options={options}
        loading={loading}
        disabled={disabled}
        {...(renderOption ? { renderOption } : {})}
        {...(initialInputValue !== undefined ? { inputValue } : {})}

        /* ---------------- LABEL ---------------- */
        getOptionLabel={(option: any) => option?.label || ""}

        // Rows key on their (unique) uuid, never the label — two unrelated
        // records can legitimately share a display name (e.g. two Packages
        // both named "Full Cycle Test Package"), which would otherwise
        // collide as React keys in the dropdown list (MUI's default key
        // falls back to the label when none is given).
        getOptionKey={(option: any) => option?.value ?? ""}

        /* ---------------- EQUALITY ---------------- */
        isOptionEqualToValue={(opt: any, val: any) =>
          opt?.value === val?.value
        }

        /* ---------------- SEARCH ---------------- */
        onInputChange={(_, value, reason) => {
          setInputValue(value);
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

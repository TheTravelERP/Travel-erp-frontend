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
  control: any;
  dropdownName: string;
  pageSize?: number;

  // Optional features
  onAddNew?: () => void;
  allowAdd?: boolean;

  // Generic autofill mapping
  setValue?: any;
  autoFillMap?: Record<string, string>;
}

/* ---------------- COMPONENT ---------------- */

export default function EntityAutocomplete({
  name,
  label,
  control,
  dropdownName,
  pageSize = 20,
  onAddNew,
  allowAdd = false,
  setValue,
  autoFillMap,
}: EntityAutocompleteProps) {
  const { options, loading, setSearch, loadMore } = useEntityDropdown({
    dropdownName,
    pageSize,
  });

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={null}
      render={({ field, fieldState }) => {
        /* ---------------- HANDLE SELECTED ---------------- */

        const selected =
          options.find((o) => o.value === field.value) ||
          (field.value
            ? { label: "Loading...", value: field.value }
            : null);

        return (
          <Autocomplete
            value={selected}
            options={options}
            loading={loading}

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

              field.onChange(val ? val.value : null);

              // 🔹 GENERIC AUTOFILL (REUSABLE)
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
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
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
      }}
    />
  );
}
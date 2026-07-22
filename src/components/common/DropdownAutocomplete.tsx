// src/components/common/DropdownAutocomplete.tsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import {
  TextField,
  Autocomplete,
  CircularProgress,
  createFilterOptions,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  getDropdownOptions,
  createDropdownOption,
} from "../../services/dropdown.service";

const filter = createFilterOptions<any>();

export default function DropdownAutocomplete({
  name,
  label,
  control,
  value,
  onChange,

  useForm = false,   // ⭐ controls Controller usage
  allowAdd = false,  // ⭐ controls "Add New"

  pagination = false,
  pageSize = 20,

  // Defaults to `name` — only pass this when the form field name and the
  // dropdown_option lookup key genuinely differ (e.g. field "status" backed
  // by dropdown_option rows stored under "package_status").
  dropdownName,
}: any) {
  const lookupName = dropdownName ?? name;
  const { t } = useTranslation();
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");

  const requestRef = useRef(0);

  /* ================= LOAD OPTIONS ================= */

  const loadOptions = useCallback(
    async (
      currentSearch: string,
      currentPage: number,
      isFirstLoad: boolean,
      signal?: AbortSignal,
    ) => {
      const requestId = ++requestRef.current;
      setLoading(true);

      try {
        const params: any = {
          dropdown_name: lookupName,
          search: currentSearch,
        };

        if (pagination) {
          params.page = currentPage;
          params.page_size = pageSize;
        }

        const data = await getDropdownOptions(params, signal);

        if (requestId !== requestRef.current) return;

        setOptions((prev) => (isFirstLoad ? data : [...prev, ...data]));

        setHasMore(pagination ? data.length === pageSize : false);
      } catch (err) {
        if (!axios.isCancel(err)) throw err;
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [lookupName, pageSize, pagination]
  );

  useEffect(() => {
    const controller = new AbortController();
    setPage(1);
    loadOptions(search, 1, true, controller.signal);
    return () => controller.abort();
  }, [search, loadOptions]);

  /* ================= AUTOCOMPLETE UI ================= */

  const renderAutocomplete = (
    currentValue: any,
    handleChange: any,
    error?: boolean,
    helperText?: string,
  ) => {
    const selectedValue =
      options.find((opt) => opt.value === currentValue) || null;

    return (
      <Autocomplete
        value={selectedValue}
        options={options}
        loading={loading}
        autoHighlight={false}

        /* ---------- ADD NEW LOGIC ---------- */
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          if (!allowAdd) return filtered;

          const { inputValue } = params;

          const isExisting = options.some(
            (option) =>
              inputValue.toLowerCase() === option.label.toLowerCase()
          );

          if (inputValue !== "" && !isExisting) {
            filtered.push({
              inputValue,
              label: `Add "${inputValue}"`,
              value: "__add_new__",
            });
          }

          return filtered;
        }}

        onInputChange={(_, newInputValue) => {
          setSearch(newInputValue);
        }}

        onChange={async (_, newValue: any) => {
          if (allowAdd && newValue?.value === "__add_new__") {
            const created = await createDropdownOption(
              lookupName,
              newValue.inputValue,
              newValue.inputValue
            );
            setOptions((prev) => [created, ...prev]);
            handleChange(created.value);
          } else {
            handleChange(newValue ? newValue.value : "");
          }
        }}

        getOptionLabel={(option) =>
          option.value === "__add_new__"
            ? option.label || ""
            : t(`dropdown.${name}.${option.value}`, { defaultValue: option.label || "" })
        }
        isOptionEqualToValue={(option, val) =>
          option.value === val.value
        }

        /* ---------- PAGINATION ---------- */
        ListboxProps={{
          onScroll: (event: React.SyntheticEvent) => {
            if (!pagination) return;

            const listboxNode = event.currentTarget;

            if (
              listboxNode.scrollTop + listboxNode.clientHeight >=
              listboxNode.scrollHeight - 10
            ) {
              if (hasMore && !loading) {
                const nextPage = page + 1;
                setPage(nextPage);
                loadOptions(search, nextPage, false);
              }
            }
          },
        }}

        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            error={error}
            helperText={helperText}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress size={18} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    );
  };

  /* ================= RETURN ================= */

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
  return renderAutocomplete(value, onChange);
}
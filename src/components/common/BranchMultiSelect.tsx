// src/components/common/BranchMultiSelect.tsx
//
// Reusable "Allowed Branches" picker — used by Package and Departure forms
// to set an optional visibility restriction (empty selection = unrestricted,
// every branch may use/sell it). No existing multi-select-of-entities
// component exists in this codebase (EntityAutocomplete/DropdownAutocomplete
// are both single-value only), so this is a small, purpose-built variant:
// fetches the org's branch list once (orgs have a small branch count, no
// need for EntityAutocomplete's infinite-scroll/search machinery) and binds
// through React Hook Form like every other form field in the app.
import { useEffect, useState } from "react";
import { Autocomplete, Chip, TextField, CircularProgress } from "@mui/material";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { getBranches } from "../../features/settings/branch/branch.api";
import type { BranchListItem } from "../../features/settings/branch/branch.types";

interface Props {
  name: string;
  label: string;
  control: any;
  helperText?: string;
}

export default function BranchMultiSelect({ name, label, control, helperText }: Props) {
  const { t } = useTranslation();
  const [options, setOptions] = useState<BranchListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getBranches({ page_size: 100, is_active: true })
      .then((res) => { if (active) setOptions(res.data); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={[]}
      render={({ field }) => {
        const selected = options.filter((o) => (field.value || []).includes(o.uuid));
        return (
          <Autocomplete
            multiple
            options={options}
            loading={loading}
            value={selected}
            getOptionLabel={(o) => o.branch_name}
            isOptionEqualToValue={(o, v) => o.uuid === v.uuid}
            onChange={(_, newValue) => field.onChange(newValue.map((o) => o.uuid))}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option.uuid} label={option.branch_name} size="small" />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                helperText={helperText ?? t("common.allowedBranchesHelper")}
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
      }}
    />
  );
}

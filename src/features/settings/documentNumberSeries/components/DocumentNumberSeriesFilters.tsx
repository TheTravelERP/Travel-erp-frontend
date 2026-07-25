// src/features/settings/documentNumberSeries/components/DocumentNumberSeriesFilters.tsx

import {
  Autocomplete,
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Typography,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import QuickDateRangeFilter from "../../../../components/common/QuickDateRangeFilter";
import { useEntityDropdown } from "../../../../hooks/useEntityDropdown";

/* ================= TYPES ================= */

export interface DocumentNumberSeriesFilterValues {
  search?: string;
  branch_uuid?: string;
  document_type_uuid?: string;
  is_active?: string;
  from_date?: string;
  to_date?: string;
}

interface DocumentNumberSeriesFiltersProps {
  value: DocumentNumberSeriesFilterValues;
  onChange: (v: Partial<DocumentNumberSeriesFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

/* ================= COMPONENT ================= */

export default function DocumentNumberSeriesFilters({
  value,
  onChange,
  onApply,
  onReset,
}: DocumentNumberSeriesFiltersProps) {
  const { t } = useTranslation();

  // Standalone (non react-hook-form) entity search — reuses the same data hook
  // EntityAutocomplete uses internally, since that component only supports
  // react-hook-form's Controller and this is a plain filter panel.
  const {
    options: branchOptions,
    loading: branchLoading,
    setSearch: setBranchSearch,
  } = useEntityDropdown({ dropdownName: "branch" });
  const selectedBranch =
    branchOptions.find((o) => o.value === value.branch_uuid) || null;

  const {
    options: documentTypeOptions,
    loading: documentTypeLoading,
    setSearch: setDocumentTypeSearch,
  } = useEntityDropdown({ dropdownName: "document_type" });
  const selectedDocumentType =
    documentTypeOptions.find((o) => o.value === value.document_type_uuid) || null;

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "grey.50",
        borderRadius: 2,
        mb: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={1.5} mb={2}>
        <Typography variant="h6" color="primary">
          {t("common.filters")}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <QuickDateRangeFilter
          fromDate={value.from_date}
          toDate={value.to_date}
          onChange={onChange}
        />

        <Grid size={{ xs: 12, md: 4 }}>
          <Autocomplete
            options={branchOptions}
            loading={branchLoading}
            value={selectedBranch}
            getOptionLabel={(option: any) => option?.label || ""}
            isOptionEqualToValue={(opt: any, val: any) => opt?.value === val?.value}
            onInputChange={(_, val, reason) => {
              if (reason === "input") setBranchSearch(val);
            }}
            onChange={(_, val: any) => onChange({ branch_uuid: val?.value || undefined })}
            renderInput={(params) => (
              <TextField {...params} label={t("documentNumberSeries.branch")} fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Autocomplete
            options={documentTypeOptions}
            loading={documentTypeLoading}
            value={selectedDocumentType}
            getOptionLabel={(option: any) => option?.label || ""}
            isOptionEqualToValue={(opt: any, val: any) => opt?.value === val?.value}
            onInputChange={(_, val, reason) => {
              if (reason === "input") setDocumentTypeSearch(val);
            }}
            onChange={(_, val: any) => onChange({ document_type_uuid: val?.value || undefined })}
            renderInput={(params) => (
              <TextField {...params} label={t("documentNumberSeries.documentType")} fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            fullWidth
            label={t("common.active")}
            value={value.is_active ?? ""}
            onChange={(e) => onChange({ is_active: e.target.value || undefined })}
          >
            <MenuItem value="">{t("common.all")}</MenuItem>
            <MenuItem value="true">{t("common.active")}</MenuItem>
            <MenuItem value="false">{t("common.inactive")}</MenuItem>
          </TextField>
        </Grid>

        <Grid size={12} display="flex" justifyContent="flex-end" gap={1} mt={1}>
          <Button color="inherit" onClick={onReset}>
            {t("common.reset")}
          </Button>
          <Button variant="contained" onClick={onApply}>
            {t("common.applyFilters")}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

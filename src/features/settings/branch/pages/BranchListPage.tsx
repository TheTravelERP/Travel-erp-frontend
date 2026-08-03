// src/features/settings/branch/pages/BranchListPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Grid, MenuItem, Paper, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

import AddIcon from "@mui/icons-material/Add";
import ListAltIcon from "@mui/icons-material/ListAlt";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";

import { useNavigate, useSearchParams } from "react-router-dom";

import { SearchInput } from "../../../../components/ui/SearchInput";
import ListPageToolbar from "../../../../components/common/ListPageToolbar";
import ImportResultDialog from "../../../../components/common/ImportResultDialog";
import BranchTable from "../components/BranchTable";

import { usePermission } from "../../../../hooks/usePermission";
import { useCsvImport } from "../../../../hooks/useCsvImport";
import { getBranches, importBranchesFromCsv } from "../branch.api";
import type { BranchListItem } from "../branch.types";

export default function BranchListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const perms = usePermission("settings.branch_master");
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("page_size") || 10);

  const isTrash = searchParams.get("is_deleted") === "true";

  const sortBy = searchParams.get("sort_by") || undefined;
  const sortOrder = (searchParams.get("sort_order") as "asc" | "desc") || undefined;

  const statusFilter = searchParams.get("is_active") ?? "";
  const headOfficeFilter = searchParams.get("is_head_office") ?? "";
  const countryFilter = searchParams.get("country") || "";

  const handleSortChange = (columnId: string) => {
    const nextOrder = sortBy === columnId && sortOrder === "asc" ? "desc" : "asc";
    updateURL({ sort_by: columnId, sort_order: nextOrder, page: 1 });
  };

  const search = searchParams.get("search") || "";
  const [draftSearch, setDraftSearch] = useState(search);
  const [draftCountry, setDraftCountry] = useState(countryFilter);

  const applyWildSearch = () => {
    updateURL({ search: draftSearch, page: 1 });
  };

  const clearWildSearch = () => {
    setDraftSearch("");
    updateURL({ search: undefined, page: 1 });
  };

  const [rows, setRows] = useState<BranchListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);

      const res = await getBranches(
        {
          page,
          page_size: pageSize,
          is_deleted: isTrash,
          is_active: statusFilter === "" ? undefined : statusFilter === "true",
          is_head_office: headOfficeFilter === "" ? undefined : headOfficeFilter === "true",
          country: countryFilter || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
          search,
        },
        signal,
      );

      setRows(res.data);
      setTotal(res.pagination.total);
    } catch (err) {
      if (!axios.isCancel(err)) throw err;
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [searchParams]);

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const params = new URLSearchParams(location.search);
    params.set("format", format);
    window.open(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/branches/export?${params}`,
      "_blank",
    );
  };

  const {
    fileInputRef,
    result: importResult,
    dialogOpen: importDialogOpen,
    closeDialog: closeImportDialog,
    openFilePicker,
    onFileInputChange,
  } = useCsvImport(importBranchesFromCsv, fetchData);

  const updateURL = (params: Record<string, any>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, String(value));
    });

    setSearchParams(next);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <ListPageToolbar
        title={isTrash ? t("common.trash") : t("menu.settings.branch_master")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: isTrash ? t("common.trash") : t("menu.settings.branch_master") },
        ]}
        primaryAction={
          isTrash
            ? {
                key: "view",
                label: t("menu.settings.branch_master"),
                icon: <ListAltIcon />,
                variant: "contained",
                onClick: () => updateURL({ is_deleted: undefined, page: 1 }),
              }
            : {
                key: "add",
                label: t("common.add"),
                icon: <AddIcon />,
                variant: "contained",
                show: perms.can_create,
                onClick: () => navigate("/app/settings/branch-master/create"),
              }
        }
        secondaryActions={[]}
        overflowActions={[
          {
            key: "view-trash",
            label: t("common.viewTrash"),
            show: perms.can_delete && !isTrash,
            onClick: () => updateURL({ is_deleted: true, page: 1 }),
          },
          {
            key: "export",
            label: t("common.export"),
            icon: <DownloadIcon />,
            show: perms.can_export && !isTrash,
            menuItems: [
              { label: t("common.exportCsv"), onClick: () => handleExport("csv") },
              { label: t("common.exportExcel"), onClick: () => handleExport("excel") },
              { label: t("common.exportPdf"), onClick: () => handleExport("pdf") },
            ],
          },
          {
            key: "import",
            label: t("common.importCsv"),
            icon: <UploadIcon />,
            show: perms.can_import && !isTrash,
            onClick: openFilePicker,
          },
        ]}
      />

      <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={onFileInputChange} />
      <ImportResultDialog open={importDialogOpen} result={importResult} onClose={closeImportDialog} />

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 5 }}>
            <SearchInput
              placeholder={t("common.searchByCodeName")}
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              onSearch={applyWildSearch}
              onClear={clearWildSearch}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("common.status")}
              value={statusFilter}
              onChange={(e) => updateURL({ is_active: e.target.value || undefined, page: 1 })}
            >
              <MenuItem value="">{t("common.all")}</MenuItem>
              <MenuItem value="true">{t("common.active")}</MenuItem>
              <MenuItem value="false">{t("common.inactive")}</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("branch.headOffice")}
              value={headOfficeFilter}
              onChange={(e) => updateURL({ is_head_office: e.target.value || undefined, page: 1 })}
            >
              <MenuItem value="">{t("common.all")}</MenuItem>
              <MenuItem value="true">{t("common.yes")}</MenuItem>
              <MenuItem value="false">{t("common.no")}</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              label={t("branch.country")}
              value={draftCountry}
              onChange={(e) => setDraftCountry(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateURL({ country: draftCountry || undefined, page: 1 });
              }}
              onBlur={() => updateURL({ country: draftCountry || undefined, page: 1 })}
            />
          </Grid>
        </Grid>

        <BranchTable
          rows={rows}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          isTrash={isTrash}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onPageChange={(p) => updateURL({ page: p })}
          onPageSizeChange={(s) => updateURL({ page_size: s, page: 1 })}
          onRefresh={fetchData}
        />
      </Paper>
    </Box>
  );
}

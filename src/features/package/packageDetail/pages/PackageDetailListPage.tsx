// src/features/package/packageDetail/pages/PackageDetailListPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Collapse, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";

import AddIcon from "@mui/icons-material/Add";
import ListAltIcon from "@mui/icons-material/ListAlt";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import FilterListIcon from "@mui/icons-material/FilterList";

import { useNavigate, useSearchParams } from "react-router-dom";

import { SearchInput } from "../../../../components/ui/SearchInput";
import ListPageToolbar from "../../../../components/common/ListPageToolbar";
import ImportResultDialog from "../../../../components/common/ImportResultDialog";
import PackageDetailTable from "../components/PackageDetailTable";
import PackageDetailFilters, {
  type PackageDetailFilterValues,
} from "../components/PackageDetailFilters";

import { usePermission } from "../../../../hooks/usePermission";
import { useCsvImport } from "../../../../hooks/useCsvImport";
import { getPackageDetails, importPackageDetailsFromCsv } from "../packageDetail.api";
import type { PackageDetailListItem } from "../packageDetail.types";

/* ================= COMPONENT ================= */

export default function PackageDetailListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const perms = usePermission("packages.details");
  const [searchParams, setSearchParams] = useSearchParams();

  /* ---------- FILTERS UI ---------- */
  const [showFilters, setShowFilters] = useState(false);

  /* ---------- PAGINATION (URL SOURCE OF TRUTH) ---------- */
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("page_size") || 10);

  /* ---------- CURRENT VIEW ---------- */
  const isTrash = searchParams.get("is_deleted") === "true";

  /* ---------- SORTING (URL SOURCE OF TRUTH) ---------- */
  const sortBy = searchParams.get("sort_by") || undefined;
  const sortOrder = (searchParams.get("sort_order") as "asc" | "desc") || undefined;

  const handleSortChange = (columnId: string) => {
    const nextOrder = sortBy === columnId && sortOrder === "asc" ? "desc" : "asc";
    updateURL({ sort_by: columnId, sort_order: nextOrder, page: 1 });
  };

  const search = searchParams.get("search") || "";
  const [draftSearch, setDraftSearch] = useState(search);

  const applyWildSearch = () => {
    updateURL({ search: draftSearch, page: 1 });
  };

  const clearWildSearch = () => {
    setDraftSearch("");
    updateURL({ search: undefined, page: 1 });
  };

  /* ---------- APPLIED FILTERS (FROM URL) ---------- */
  const appliedFilters: PackageDetailFilterValues = {
    search,
    is_active: searchParams.get("is_active") || "",
    from_date: searchParams.get("from_date") || "",
    to_date: searchParams.get("to_date") || "",
  };

  /* ---------- DRAFT FILTERS (UI ONLY) ---------- */
  const [draftFilters, setDraftFilters] =
    useState<PackageDetailFilterValues>(appliedFilters);

  /* ---------- DATA ---------- */
  const [rows, setRows] = useState<PackageDetailListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);

      const res = await getPackageDetails(
        {
          page,
          page_size: pageSize,
          is_deleted: isTrash,
          sort_by: sortBy,
          sort_order: sortOrder,
          search,
          is_active:
            appliedFilters.is_active === undefined || appliedFilters.is_active === ""
              ? undefined
              : appliedFilters.is_active === "true",
          from_date: appliedFilters.from_date || undefined,
          to_date: appliedFilters.to_date || undefined,
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

  /* ---------- EXPORT ---------- */
  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const params = new URLSearchParams(location.search);
    params.set("format", format);

    window.open(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/package-details/export?${params}`,
      "_blank",
    );
  };

  /* ---------- IMPORT ---------- */
  const {
    fileInputRef,
    result: importResult,
    dialogOpen: importDialogOpen,
    closeDialog: closeImportDialog,
    openFilePicker,
    onFileInputChange,
  } = useCsvImport(importPackageDetailsFromCsv, fetchData);

  /* ---------- HELPERS ---------- */
  const updateURL = (params: Record<string, any>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(params).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, String(value));
    });

    setSearchParams(next);
  };

  /* ================= RENDER ================= */

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <ListPageToolbar
        title={isTrash ? t("common.trash") : t("menu.packages.details")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: isTrash ? t("common.trash") : t("menu.packages.details") },
        ]}
        primaryAction={
          isTrash
            ? {
                key: "view",
                label: t("menu.packages.details"),
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
                onClick: () => navigate("/app/packages/details/create"),
              }
        }
        secondaryActions={[
          {
            key: "filters",
            label: t("common.filters"),
            icon: <FilterListIcon />,
            variant: showFilters ? "contained" : "outlined",
            onClick: () => setShowFilters((v) => !v),
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
        overflowActions={[
          {
            key: "view-trash",
            label: t("common.viewTrash"),
            show: perms.can_delete && !isTrash,
            onClick: () => updateURL({ is_deleted: true, page: 1 }),
          },
        ]}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        hidden
        onChange={onFileInputChange}
      />
      <ImportResultDialog open={importDialogOpen} result={importResult} onClose={closeImportDialog} />

      <Paper sx={{ p: 2 }}>
        <Collapse in={showFilters}>
          <PackageDetailFilters
            value={draftFilters}
            onChange={(v) => setDraftFilters((prev) => ({ ...prev, ...v }))}
            onApply={() => updateURL({ ...draftFilters, page: 1 })}
            onReset={() => {
              setDraftFilters({});
              setSearchParams({ page: "1", page_size: String(pageSize) });
            }}
          />
        </Collapse>

        <SearchInput
          placeholder={t("packageDetail.searchPlaceholder")}
          value={draftSearch}
          onChange={(e) => setDraftSearch(e.target.value)}
          onSearch={applyWildSearch}
          onClear={clearWildSearch}
          sx={{ mb: 2 }}
        />

        <PackageDetailTable
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

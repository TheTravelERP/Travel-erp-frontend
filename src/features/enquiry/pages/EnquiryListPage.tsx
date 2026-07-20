// src/features/enquiry/pages/EnquiryListPage.tsx
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Box, Paper, Collapse } from "@mui/material";
import { useTranslation } from "react-i18next";

import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import ListAltIcon from "@mui/icons-material/ListAlt";

import { useNavigate, useSearchParams } from "react-router-dom";

import { SearchInput } from "../../../components/ui/SearchInput";
import ListPageToolbar from "../../../components/common/ListPageToolbar";
import EnquiryTable from "../components/EnquiryTable";
import EnquiryFilters, {
  type EnquiryFilterValues,
} from "../components/EnquiryFilters";

import { usePermission } from "../../../hooks/usePermission";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getEnquiries, importEnquiriesFromCsv } from "../enquiry.api";
import type { EnquiryListItem } from "../enquiry.types";

/* ================= COMPONENT ================= */

export default function EnquiryListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const perms = usePermission('crm.enquiries');
  const [searchParams, setSearchParams] = useSearchParams();

  /* ---------- UI ---------- */
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

  /* ---------- APPLIED FILTERS (FROM URL) ---------- */
  const appliedFilters: EnquiryFilterValues = {
    search: searchParams.get("search") || "",
    conversion_status: searchParams.get("conversion_status") || "",
    enquiry_priority: searchParams.get("enquiry_priority") || "",
    lead_source: searchParams.get("lead_source") || "",
    from_date: searchParams.get("from_date") || "",
    to_date: searchParams.get("to_date") || "",
  };

  /* ---------- DRAFT FILTERS (UI ONLY) ---------- */
  const [draftFilters, setDraftFilters] =
    useState<EnquiryFilterValues>(appliedFilters);

  const applyWildSearch = () => {
    updateURL({
      search: draftFilters.search,
      page: 1,
    });
  };

  const clearWildSearch = () => {
    setDraftFilters((prev) => ({ ...prev, search: "" }));

    updateURL({
      search: undefined,
      page: 1,
    });
  };

  /* ---------- DATA ---------- */
  const [rows, setRows] = useState<EnquiryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ---------- FETCH (ON URL CHANGE, OR CALLED DIRECTLY TO REFRESH) ---------- */
  const fetchData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);

      const res = await getEnquiries(
        {
          page,
          page_size: pageSize,
          is_deleted: isTrash,
          sort_by: sortBy,
          sort_order: sortOrder,
          ...appliedFilters,
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

  /* ---------- HELPERS ---------- */
  const updateURL = (params: Record<string, any>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(params).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, String(value));
    });

    setSearchParams(next);
  };

  /* ----------- EXPORT --------- */
  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const params = new URLSearchParams(location.search);
    params.set("format", format);

    window.open(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/enquiries/export?${params}`,
      "_blank",
    );
  };

  /* ------------- IMPORT -------------------- */
  const { showSnackbar } = useSnackbar();

  const handleImport = async (file: File) => {
    try {
      const result = await importEnquiriesFromCsv(file);

      showSnackbar({
        message:
          result.failed > 0
            ? t("common.importedSummary", {
                imported: result.imported,
                total: result.total_rows,
                failed: result.failed,
              })
            : t("common.importedSuccess", { count: result.imported }),
        severity: result.failed > 0 ? "warning" : "success",
      });

      fetchData();
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail ?? t("common.importFailed"),
        severity: "error",
      });
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ================= RENDER ================= */

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      {/* HEADER */}
      <ListPageToolbar
        title={isTrash ? t("common.trash") : t('menu.crm.enquiries')}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: isTrash ? t("common.trash") : t('menu.crm.enquiries') },
        ]}
        primaryAction={
          isTrash
            ? {
                key: "view",
                label: t('menu.crm.enquiries'),
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
                onClick: () => navigate("/app/enquiries/create"),
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
            show: perms.can_export,
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
            show: perms.can_import,
            onClick: () => fileInputRef.current?.click(),
          },
        ]}
        overflowActions={[
          {
            key: "view-trash",
            label: t("common.viewTrash"),
            show: perms.can_delete && !isTrash,
            onClick: () => updateURL({ is_deleted: true, page: 1 }),
          },
          {
            key: "bulk-assign",
            label: t("common.bulkAssign"),
            disabled: true,
            disabledReason: t("common.comingSoon"),
          },
        ]}
      />

      {/* CONTENT */}
      <Paper sx={{ p: 2 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          hidden
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleImport(e.target.files[0]);
              e.target.value = ""; // allow re-upload same file
            }
          }}
        />
        <Collapse in={showFilters}>
          <EnquiryFilters
            value={draftFilters}
            onChange={(v) => setDraftFilters((prev) => ({ ...prev, ...v }))}
            onApply={() => {
              updateURL({ ...draftFilters, page: 1 });
            }}
            onReset={() => {
              setDraftFilters({});
              setSearchParams({ page: "1", page_size: String(pageSize) });
            }}
          />
        </Collapse>

        {/* WILD SEARCH */}
        <SearchInput
          placeholder={t("enquiry.searchPlaceholder")}
          value={draftFilters.search || ""}
          onChange={(e) =>
            setDraftFilters({ ...draftFilters, search: e.target.value })
          }
          onSearch={applyWildSearch}
          onClear={clearWildSearch}
          sx={{ mb: 2 }}
        />

        <EnquiryTable
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

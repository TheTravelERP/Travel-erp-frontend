// src/features/crm/followup/pages/FollowupListPage.tsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Box, Paper, Collapse } from "@mui/material";
import { useTranslation } from "react-i18next";

import AddIcon from "@mui/icons-material/Add";
import ListAltIcon from "@mui/icons-material/ListAlt";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";

import { useNavigate, useSearchParams } from "react-router-dom";

import { SearchInput } from "../../../../components/ui/SearchInput";
import ListPageToolbar from "../../../../components/common/ListPageToolbar";
import ImportResultDialog from "../../../../components/common/ImportResultDialog";
import FollowupTable from "../components/FollowupTable";
import FollowupFilters, { type FollowupFilterValues } from "../components/FollowupFilters";
import FollowupContextCard from "../components/FollowupContextCard";
import QuotationContextCard from "../components/QuotationContextCard";

import { usePermission } from "../../../../hooks/usePermission";
import { useCsvImport } from "../../../../hooks/useCsvImport";
import { getFollowups, importFollowupsFromCsv } from "../followup.api";
import type { FollowupListItem } from "../followup.types";
import { getEnquiryByUuid } from "../../../enquiry/enquiry.api";
import type { EnquiryDetail } from "../../../enquiry/enquiry.types";
import { getQuotationByUuid } from "../../quotation/quotation.api";
import type { QuotationDetail } from "../../quotation/quotation.types";

export default function FollowupListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const perms = usePermission("crm.followups");
  const [searchParams, setSearchParams] = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("page_size") || 10);

  const isTrash = searchParams.get("is_deleted") === "true";

  const sortBy = searchParams.get("sort_by") || undefined;
  const sortOrder = (searchParams.get("sort_order") as "asc" | "desc") || undefined;

  const handleSortChange = (columnId: string) => {
    const nextOrder = sortBy === columnId && sortOrder === "asc" ? "desc" : "asc";
    updateURL({ sort_by: columnId, sort_order: nextOrder, page: 1 });
  };

  const appliedFilters: FollowupFilterValues = {
    search: searchParams.get("search") || "",
    enquiry_uuid: searchParams.get("enquiry_uuid") || "",
    quotation_uuid: searchParams.get("quotation_uuid") || "",
    assigned_user_uuid: searchParams.get("assigned_user_uuid") || "",
    followup_type: searchParams.get("followup_type") || "",
    status: searchParams.get("status") || "",
    priority: searchParams.get("priority") || "",
    from_date: searchParams.get("from_date") || "",
    to_date: searchParams.get("to_date") || "",
    next_from_date: searchParams.get("next_from_date") || "",
    next_to_date: searchParams.get("next_to_date") || "",
    overdue: searchParams.get("overdue") === "true" ? true : undefined,
  };

  const [draftFilters, setDraftFilters] = useState<FollowupFilterValues>(appliedFilters);

  // Once the user explicitly hits Reset, the default-date-injection effect
  // below must not silently re-add from_date=today right after — that would
  // make Reset look like a no-op (URL shows all data for an instant, then
  // the default filter reappears). Stays true for the rest of this page's
  // lifetime; a fresh mount (e.g. navigating away and back) starts clean.
  const suppressDefaultDateRef = useRef(false);

  // The draft filter panel is local state, so a fresh deep link (e.g. from
  // the Enquiry list's "Follow-ups" action) needs to seed it once the URL
  // param is present — otherwise the Enquiry field in the (collapsed)
  // filter panel would look empty even though the list is already filtered.
  useEffect(() => {
    setDraftFilters(appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("enquiry_uuid")]);

  const applyWildSearch = () => {
    updateURL({ search: draftFilters.search, page: 1 });
  };

  const clearWildSearch = () => {
    setDraftFilters((prev) => ({ ...prev, search: "" }));
    updateURL({ search: undefined, page: 1 });
  };

  const [rows, setRows] = useState<FollowupListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [contextEnquiry, setContextEnquiry] = useState<EnquiryDetail | null>(null);
  const [contextLoading, setContextLoading] = useState(false);

  const [contextQuotation, setContextQuotation] = useState<QuotationDetail | null>(null);
  const [contextQuotationLoading, setContextQuotationLoading] = useState(false);

  const fetchData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);

      const res = await getFollowups(
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

  // Context card — mirrors the enquiry_uuid filter exactly: appears when an
  // Enquiry is selected (however it got there), disappears the moment it's
  // cleared. Independent of the main list fetch so clearing/reselecting the
  // enquiry doesn't need to be threaded through the table's loading state.
  useEffect(() => {
    const enquiryUuid = appliedFilters.enquiry_uuid;
    if (!enquiryUuid) {
      setContextEnquiry(null);
      return;
    }

    const controller = new AbortController();
    setContextLoading(true);

    getEnquiryByUuid(enquiryUuid)
      .then((data) => {
        if (!controller.signal.aborted) setContextEnquiry(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setContextEnquiry(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setContextLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters.enquiry_uuid]);

  // Quotation context card — independent, second query-string filter mirroring
  // the enquiry_uuid context card above.
  useEffect(() => {
    const quotationUuid = appliedFilters.quotation_uuid;
    if (!quotationUuid) {
      setContextQuotation(null);
      return;
    }

    const controller = new AbortController();
    setContextQuotationLoading(true);

    getQuotationByUuid(quotationUuid)
      .then((data) => {
        if (!controller.signal.aborted) setContextQuotation(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setContextQuotation(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setContextQuotationLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters.quotation_uuid]);

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const params = new URLSearchParams(location.search);
    params.set("format", format);
    window.open(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/enquiry-followups/export?${params}`,
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
  } = useCsvImport(importFollowupsFromCsv, fetchData);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateURL = (params: Record<string, any>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(params).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, String(value));
    });

    setSearchParams(next);
  };

  // Default view shows only today-onward follow-ups (hides stale past
  // entries by default) unless the user explicitly picks a Follow-up Date
  // range — Reset lands back here too, since "today onward" is the
  // steady-state default, not "show every follow-up ever logged". Trash is
  // exempt: deleted rows aren't time-scoped the same way. Also exempt
  // whenever the Today/Tomorrow/This Week/Overdue quick filters are active
  // (next_from_date/next_to_date/overdue) — those target
  // next_followup_datetime, a field that's routinely on entries logged
  // well before today, and re-injecting this default would silently AND
  // against them and hide the very records they're meant to surface.
  useEffect(() => {
    if (isTrash) return;
    if (suppressDefaultDateRef.current) return;
    if (searchParams.get("from_date") || searchParams.get("to_date")) return;
    if (
      searchParams.get("next_from_date") ||
      searchParams.get("next_to_date") ||
      searchParams.get("overdue")
    ) return;

    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    updateURL({ from_date: iso });
    // Keep the visible From Date input honest about what's actually
    // filtering the list — without this, the URL/API are scoped to today
    // but the filter panel shows an empty field, looking like a bug.
    setDraftFilters((prev) => ({ ...prev, from_date: iso }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isTrash]);

  const addFollowupHref = appliedFilters.enquiry_uuid
    ? `/app/crm/followups/create?enquiry_uuid=${appliedFilters.enquiry_uuid}`
    : "/app/crm/followups/create";

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <ListPageToolbar
        title={isTrash ? t("common.trash") : t("menu.crm.followups")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: isTrash ? t("common.trash") : t("menu.crm.followups") },
        ]}
        primaryAction={
          isTrash
            ? {
                key: "view",
                label: t("menu.crm.followups"),
                icon: <ListAltIcon />,
                variant: "contained",
                onClick: () => updateURL({ is_deleted: undefined, page: 1 }),
              }
            : {
                key: "add",
                label: t("followup.addFollowup"),
                icon: <AddIcon />,
                variant: "contained",
                show: perms.can_create,
                onClick: () => navigate(addFollowupHref),
              }
        }
        secondaryActions={[
          {
            key: "workspace",
            label: t("followup.reminderWorkspace"),
            icon: <DashboardIcon />,
            show: !isTrash,
            onClick: () => navigate("/app/crm/followups/workspace"),
          },
          {
            key: "filters",
            label: t("common.filters"),
            icon: <FilterListIcon />,
            variant: showFilters ? "contained" : "outlined",
            onClick: () => setShowFilters((v) => !v),
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

      {(contextEnquiry || contextLoading) && (
        <FollowupContextCard enquiry={contextEnquiry} loading={contextLoading} />
      )}

      {(contextQuotation || contextQuotationLoading) && (
        <QuotationContextCard quotation={contextQuotation} loading={contextQuotationLoading} />
      )}

      <Paper sx={{ p: 2 }}>
        <Collapse in={showFilters}>
          <FollowupFilters
            value={draftFilters}
            onChange={(v) => setDraftFilters((prev) => ({ ...prev, ...v }))}
            onApply={() => updateURL({ ...draftFilters, page: 1 })}
            onReset={() => {
              suppressDefaultDateRef.current = true;
              setDraftFilters({});
              setSearchParams({ page: "1", page_size: String(pageSize) });
            }}
          />
        </Collapse>

        <SearchInput
          placeholder={t("followup.searchPlaceholder")}
          value={draftFilters.search || ""}
          onChange={(e) => setDraftFilters({ ...draftFilters, search: e.target.value })}
          onSearch={applyWildSearch}
          onClear={clearWildSearch}
          sx={{ mb: 2 }}
        />

        <FollowupTable
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

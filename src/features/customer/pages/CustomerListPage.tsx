// src/features/customer/pages/CustomerListPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Paper, Collapse } from "@mui/material";
import { useTranslation } from "react-i18next";

import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import ListAltIcon from "@mui/icons-material/ListAlt";

import { useNavigate, useSearchParams } from "react-router-dom";

import { SearchInput } from "../../../components/ui/SearchInput";
import ListPageToolbar from "../../../components/common/ListPageToolbar";
import CustomerTable from "../components/CustomerTable";
import CustomerFilters, {
  type CustomerFilterValues,
} from "../components/CustomerFilters";

import { usePermission } from "../../../hooks/usePermission";
import { getCustomers } from "../customer.api";
import type { CustomerListItem } from "../customer.types";

/* ================= COMPONENT ================= */

export default function CustomerListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const perms = usePermission("crm.customers");
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
  const appliedFilters: CustomerFilterValues = {
    search: searchParams.get("search") || "",
    nationality: searchParams.get("nationality") || "",
    gender: searchParams.get("gender") || "",
  };

  /* ---------- DRAFT FILTERS (UI ONLY) ---------- */
  const [draftFilters, setDraftFilters] =
    useState<CustomerFilterValues>(appliedFilters);

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
  const [rows, setRows] = useState<CustomerListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ---------- FETCH (ON URL CHANGE, OR CALLED DIRECTLY TO REFRESH) ---------- */
  const fetchData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);

      const res = await getCustomers(
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

  /* ================= RENDER ================= */

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      {/* HEADER */}
      <ListPageToolbar
        title={isTrash ? t("common.trash") : t("menu.crm.customers")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: isTrash ? t("common.trash") : t("menu.crm.customers") },
        ]}
        primaryAction={
          isTrash
            ? {
                key: "view",
                label: t("menu.crm.customers"),
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
                onClick: () => navigate("/app/crm/customers/create"),
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

      {/* CONTENT */}
      <Paper sx={{ p: 2 }}>
        <Collapse in={showFilters}>
          <CustomerFilters
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
          placeholder={t("customer.searchPlaceholder")}
          value={draftFilters.search || ""}
          onChange={(e) =>
            setDraftFilters({ ...draftFilters, search: e.target.value })
          }
          onSearch={applyWildSearch}
          onClear={clearWildSearch}
          sx={{ mb: 2 }}
        />

        <CustomerTable
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

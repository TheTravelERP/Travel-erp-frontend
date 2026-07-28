// src/features/settings/communicationProviders/pages/CommunicationProviderListPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Paper, Collapse } from "@mui/material";
import { useTranslation } from "react-i18next";

import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import ListAltIcon from "@mui/icons-material/ListAlt";

import { useNavigate, useSearchParams } from "react-router-dom";

import { SearchInput } from "../../../../components/ui/SearchInput";
import ListPageToolbar from "../../../../components/common/ListPageToolbar";
import CommunicationProviderTable from "../components/CommunicationProviderTable";
import CommunicationProviderFilters, {
  type CommunicationProviderFilterValues,
} from "../components/CommunicationProviderFilters";

import { usePermission } from "../../../../hooks/usePermission";
import { getCommunicationProviders } from "../communicationProvider.api";
import type { CommunicationProviderListItem } from "../communicationProvider.types";

export default function CommunicationProviderListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const perms = usePermission("settings.communication_settings");
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

  const appliedFilters: CommunicationProviderFilterValues = {
    search: searchParams.get("search") || "",
    provider_category: (searchParams.get("provider_category") as any) || "",
    from_date: searchParams.get("from_date") || "",
    to_date: searchParams.get("to_date") || "",
  };

  const [draftFilters, setDraftFilters] = useState<CommunicationProviderFilterValues>(appliedFilters);

  const applyWildSearch = () => {
    updateURL({ search: draftFilters.search, page: 1 });
  };

  const clearWildSearch = () => {
    setDraftFilters((prev) => ({ ...prev, search: "" }));
    updateURL({ search: undefined, page: 1 });
  };

  const [rows, setRows] = useState<CommunicationProviderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res = await getCommunicationProviders(
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

  const updateURL = (params: Record<string, any>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <ListPageToolbar
        title={isTrash ? t("common.trash") : t("menu.settings.communication_settings")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: isTrash ? t("common.trash") : t("menu.settings.communication_settings") },
        ]}
        primaryAction={
          isTrash
            ? {
                key: "view",
                label: t("menu.settings.communication_settings"),
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
                onClick: () => navigate("/app/settings/communication-settings/create"),
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

      <Paper sx={{ p: 2 }}>
        <Collapse in={showFilters}>
          <CommunicationProviderFilters
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
          placeholder={t("common.search")}
          value={draftFilters.search || ""}
          onChange={(e) => setDraftFilters({ ...draftFilters, search: e.target.value })}
          onSearch={applyWildSearch}
          onClear={clearWildSearch}
          sx={{ mb: 2 }}
        />

        <CommunicationProviderTable
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

// src/features/settings/location/pages/LocationListPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Paper, Collapse, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";

import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import ListAltIcon from "@mui/icons-material/ListAlt";

import { useNavigate, useSearchParams } from "react-router-dom";

import { SearchInput } from "../../../../components/ui/SearchInput";
import ListPageToolbar from "../../../../components/common/ListPageToolbar";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import LocationTable from "../components/LocationTable";

import { usePermission } from "../../../../hooks/usePermission";
import { getLocations } from "../location.api";
import type { LocationListItem } from "../location.types";

export default function LocationListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const perms = usePermission("settings.location_master");
  const [searchParams, setSearchParams] = useSearchParams();

  /* ---------- UI ---------- */
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

  /* ---------- APPLIED FILTERS (FROM URL) ---------- */
  const appliedSearch = searchParams.get("search") || "";
  const appliedCountryCode = searchParams.get("country_code") || "";

  /* ---------- DRAFT FILTERS (UI ONLY) ---------- */
  const [draftSearch, setDraftSearch] = useState(appliedSearch);
  const [draftCountryCode, setDraftCountryCode] = useState(appliedCountryCode);

  const applyWildSearch = () => {
    updateURL({ search: draftSearch, page: 1 });
  };

  const clearWildSearch = () => {
    setDraftSearch("");
    updateURL({ search: undefined, page: 1 });
  };

  const [rows, setRows] = useState<LocationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);

      const res = await getLocations(
        {
          page,
          page_size: pageSize,
          is_deleted: isTrash,
          sort_by: sortBy,
          sort_order: sortOrder,
          search: appliedSearch,
          country_code: appliedCountryCode,
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
        title={isTrash ? t("common.trash") : t("menu.settings.location_master")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: isTrash ? t("common.trash") : t("menu.settings.location_master") },
        ]}
        primaryAction={
          isTrash
            ? {
                key: "view",
                label: t("menu.settings.location_master"),
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
                onClick: () => navigate("/app/settings/location-master/create"),
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
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <EntityAutocomplete
                name="country_code"
                label={t("common.country")}
                dropdownName="country"
                useForm={false}
                value={draftCountryCode || null}
                onChange={(v) => {
                  setDraftCountryCode(v || "");
                  updateURL({ country_code: v || undefined, page: 1 });
                }}
              />
            </Grid>
          </Grid>
        </Collapse>

        <SearchInput
          placeholder={t("common.searchByCodeName")}
          value={draftSearch}
          onChange={(e) => setDraftSearch(e.target.value)}
          onSearch={applyWildSearch}
          onClear={clearWildSearch}
          sx={{ mb: 2 }}
        />

        <LocationTable
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

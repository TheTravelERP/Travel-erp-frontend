// src/features/booking/pages/BookingListPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Collapse, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import ListAltIcon from "@mui/icons-material/ListAlt";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate, useSearchParams } from "react-router-dom";

import { SearchInput } from "../../../components/ui/SearchInput";
import ListPageToolbar from "../../../components/common/ListPageToolbar";
import BookingTable from "../components/BookingTable";
import BookingFilters, { type BookingFilterValues } from "../components/BookingFilters";
import { usePermission } from "../../../hooks/usePermission";
import { getBookingsList } from "../booking.api";
import type { BookingListItem } from "../booking.types";

export default function BookingListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const perms = usePermission("packages.bookings");
  const [searchParams, setSearchParams] = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("page_size") || 10);
  const sortBy = searchParams.get("sort_by") || undefined;
  const sortOrder = (searchParams.get("sort_order") as "asc" | "desc") || undefined;
  const search = searchParams.get("search") || "";

  const isTrash = searchParams.get("is_deleted") === "true";

  const appliedFilters: BookingFilterValues = {
    status: searchParams.get("status") || "",
    business_type: searchParams.get("business_type") || "",
    enquiry_uuid: searchParams.get("enquiry_uuid") || "",
    cust_uuid: searchParams.get("cust_uuid") || "",
    travel_from_date: searchParams.get("travel_from_date") || "",
    travel_to_date: searchParams.get("travel_to_date") || "",
    is_active: searchParams.get("is_active") || "",
  };

  const [draftFilters, setDraftFilters] = useState<BookingFilterValues>(appliedFilters);
  const [searchDraft, setSearchDraft] = useState(search);

  const [rows, setRows] = useState<BookingListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const updateURL = (params: Record<string, any>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  const handleSortChange = (columnId: string) => {
    const nextOrder = sortBy === columnId && sortOrder === "asc" ? "desc" : "asc";
    updateURL({ sort_by: columnId, sort_order: nextOrder, page: 1 });
  };

  const fetchData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res = await getBookingsList(
        {
          page, page_size: pageSize, is_deleted: isTrash, sort_by: sortBy, sort_order: sortOrder, search,
          status: appliedFilters.status || undefined,
          business_type: appliedFilters.business_type || undefined,
          enquiry_uuid: appliedFilters.enquiry_uuid || undefined,
          cust_uuid: appliedFilters.cust_uuid || undefined,
          travel_from_date: appliedFilters.travel_from_date || undefined,
          travel_to_date: appliedFilters.travel_to_date || undefined,
          is_active:
            appliedFilters.is_active === undefined || appliedFilters.is_active === ""
              ? undefined
              : appliedFilters.is_active === "true",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <ListPageToolbar
        title={isTrash ? t("common.trash") : t("menu.packages.bookings")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: isTrash ? t("common.trash") : t("menu.packages.bookings") },
        ]}
        primaryAction={
          isTrash
            ? {
                key: "view",
                label: t("menu.packages.bookings"),
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
                onClick: () => navigate("/app/bookings/list/create"),
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
          <BookingFilters
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
          placeholder={t("common.searchByCodeName")}
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          onSearch={() => updateURL({ search: searchDraft, page: 1 })}
          onClear={() => { setSearchDraft(""); updateURL({ search: undefined, page: 1 }); }}
          sx={{ mb: 2 }}
        />

        <BookingTable
          rows={rows} loading={loading} page={page} pageSize={pageSize} total={total}
          isTrash={isTrash}
          sortBy={sortBy} sortOrder={sortOrder} onSortChange={handleSortChange}
          onPageChange={(p) => updateURL({ page: p })}
          onPageSizeChange={(s) => updateURL({ page_size: s, page: 1 })}
          onRefresh={fetchData}
        />
      </Paper>
    </Box>
  );
}

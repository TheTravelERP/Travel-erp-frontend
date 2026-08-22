// src/features/reports/bookings/pages/BookingReportPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Grid, MenuItem, Paper, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import ListPageToolbar from "../../../../components/common/ListPageToolbar";
import { SearchInput } from "../../../../components/ui/SearchInput";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import QuickDateRangeFilter from "../../../../components/common/QuickDateRangeFilter";
import BookingReportTable from "../components/BookingReportTable";
import { getBookingReport } from "../bookingReport.api";
import type { BookingReportRow } from "../bookingReport.types";
import { BOOKING_STATUSES } from "../../../booking/booking.types";

export default function BookingReportPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("page_size") || 20);
  const search = searchParams.get("search") || "";
  const departureUuid = searchParams.get("departure_uuid") || "";
  const packageUuid = searchParams.get("package_uuid") || "";
  const status = searchParams.get("status") || "";
  const fromDate = searchParams.get("from_date") || "";
  const toDate = searchParams.get("to_date") || "";

  const [draftSearch, setDraftSearch] = useState(search);

  const [rows, setRows] = useState<BookingReportRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const updateURL = (params: Record<string, unknown>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getBookingReport(
      {
        page, page_size: pageSize, search: search || undefined,
        departure_uuid: departureUuid || undefined,
        package_uuid: packageUuid || undefined,
        status: status || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      },
      controller.signal,
    )
      .then((res) => {
        setRows(res.data);
        setTotal(res.pagination.total);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) throw err;
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <ListPageToolbar
        title={t("reports.bookingReportTitle")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: t("reports.bookingReportTitle") },
        ]}
      />

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <EntityAutocomplete
              name="departure_uuid"
              label={t("booking.departure")}
              dropdownName="departures"
              value={departureUuid || null}
              onChange={(val: string | null) => updateURL({ departure_uuid: val || undefined, page: 1 })}
              useForm={false}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <EntityAutocomplete
              name="package_uuid"
              label={t("booking.package")}
              dropdownName="packages"
              value={packageUuid || null}
              onChange={(val: string | null) => updateURL({ package_uuid: val || undefined, page: 1 })}
              useForm={false}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              label={t("common.status")}
              value={status}
              onChange={(e) => updateURL({ status: e.target.value || undefined, page: 1 })}
            >
              <MenuItem value="">{t("common.all")}</MenuItem>
              {BOOKING_STATUSES.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <QuickDateRangeFilter
            fromDate={fromDate}
            toDate={toDate}
            onChange={(v) => updateURL({ ...v, page: 1 })}
          />
        </Grid>

        <SearchInput
          placeholder={t("common.searchByCodeName")}
          value={draftSearch}
          onChange={(e) => setDraftSearch(e.target.value)}
          onSearch={() => updateURL({ search: draftSearch || undefined, page: 1 })}
          onClear={() => { setDraftSearch(""); updateURL({ search: undefined, page: 1 }); }}
          sx={{ mb: 2, maxWidth: 360 }}
        />

        <BookingReportTable
          rows={rows}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={(p) => updateURL({ page: p })}
          onPageSizeChange={(s) => updateURL({ page_size: s, page: 1 })}
        />
      </Paper>
    </Box>
  );
}

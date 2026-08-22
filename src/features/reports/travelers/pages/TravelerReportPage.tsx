// src/features/reports/travelers/pages/TravelerReportPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Grid, MenuItem, Paper, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import ListPageToolbar from "../../../../components/common/ListPageToolbar";
import { SearchInput } from "../../../../components/ui/SearchInput";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import TravelerReportTable from "../components/TravelerReportTable";
import { getTravelerReport } from "../travelerReport.api";
import type { TravelerReportRow } from "../travelerReport.types";
import { TRAVELLER_TYPES } from "../../../booking/traveller.types";

export default function TravelerReportPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("page_size") || 20);
  const search = searchParams.get("search") || "";
  const departureUuid = searchParams.get("departure_uuid") || "";
  const travellerType = searchParams.get("traveller_type") || "";
  const nationality = searchParams.get("nationality") || "";
  const visaStatus = searchParams.get("visa_status") || "";

  const [draftSearch, setDraftSearch] = useState(search);
  const [draftNationality, setDraftNationality] = useState(nationality);
  const [draftVisaStatus, setDraftVisaStatus] = useState(visaStatus);

  const [rows, setRows] = useState<TravelerReportRow[]>([]);
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
    getTravelerReport(
      {
        page, page_size: pageSize, search: search || undefined,
        departure_uuid: departureUuid || undefined,
        traveller_type: travellerType || undefined,
        nationality: nationality || undefined,
        visa_status: visaStatus || undefined,
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
        title={t("reports.travelerReportTitle")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: t("reports.travelerReportTitle") },
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

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              label={t("booking.travellerType")}
              value={travellerType}
              onChange={(e) => updateURL({ traveller_type: e.target.value || undefined, page: 1 })}
            >
              <MenuItem value="">{t("common.all")}</MenuItem>
              {TRAVELLER_TYPES.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              fullWidth
              label={t("booking.nationality")}
              value={draftNationality}
              onChange={(e) => setDraftNationality(e.target.value)}
              onBlur={() => updateURL({ nationality: draftNationality || undefined, page: 1 })}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              fullWidth
              label={t("booking.visaStatus", { defaultValue: "Visa Status" })}
              value={draftVisaStatus}
              onChange={(e) => setDraftVisaStatus(e.target.value)}
              onBlur={() => updateURL({ visa_status: draftVisaStatus || undefined, page: 1 })}
            />
          </Grid>
        </Grid>

        <SearchInput
          placeholder={t("common.searchByCodeName")}
          value={draftSearch}
          onChange={(e) => setDraftSearch(e.target.value)}
          onSearch={() => updateURL({ search: draftSearch || undefined, page: 1 })}
          onClear={() => { setDraftSearch(""); updateURL({ search: undefined, page: 1 }); }}
          sx={{ mb: 2, maxWidth: 360 }}
        />

        <TravelerReportTable
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

// src/features/departure/components/DepartureTravellersTable.tsx
//
// Cross-booking, read-only rollup for the Departure workspace — not the
// per-booking TravellerList.tsx, which is wired to one booking's own
// add/edit/delete actions. This view spans every booking under the
// departure and offers no mutation, consistent with "Bulk Actions
// (future-ready only)" from the module spec.
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import type { TravellerDetail } from "../../booking/traveller.types";
import { getDepartureTravellers } from "../departure.api";
import SortableTableCell from "../../../components/common/SortableTableCell";
import { SearchInput } from "../../../components/ui/SearchInput";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";

interface Props {
  departureUuid: string;
  onCountChange?: (count: number) => void;
}

export default function DepartureTravellersTable({ departureUuid, onCountChange }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const [rows, setRows] = useState<TravellerDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>();

  const [search, setSearch] = useState("");
  const [draftSearch, setDraftSearch] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getDepartureTravellers(departureUuid, { page, page_size: pageSize, search, sort_by: sortBy, sort_order: sortOrder }, controller.signal)
      .then((res) => {
        setRows(res.data);
        setTotal(res.pagination.total);
        onCountChange?.(res.pagination.total);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departureUuid, page, pageSize, search, sortBy, sortOrder]);

  function handleSortChange(columnId: string) {
    const nextOrder = sortBy === columnId && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(columnId);
    setSortOrder(nextOrder);
  }

  return (
    <Box>
      <SearchInput
        placeholder={t("common.searchByCodeName")}
        value={draftSearch}
        onChange={(e) => setDraftSearch(e.target.value)}
        onSearch={() => { setSearch(draftSearch); setPage(1); }}
        onClear={() => { setDraftSearch(""); setSearch(""); setPage(1); }}
        sx={{ mb: 2, maxWidth: 360 }}
      />

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("booking.bookingNo")}</TableCell>
              <SortableTableCell id="traveller_type" label={t("booking.travellerType")} sortable sortBy={sortBy} sortOrder={sortOrder} onSort={handleSortChange} />
              <SortableTableCell id="first_name" label={t("common.name")} sortable sortBy={sortBy} sortOrder={sortOrder} onSort={handleSortChange} />
              <TableCell>{t("common.age")}</TableCell>
              <SortableTableCell id="passport_no" label={t("booking.passportNo")} sortable sortBy={sortBy} sortOrder={sortOrder} onSort={handleSortChange} />
              <TableCell>{t("booking.visaStatus", { defaultValue: "Visa" })}</TableCell>
              <SortableTableCell id="nationality" label={t("booking.nationality")} sortable sortBy={sortBy} sortOrder={sortOrder} onSort={handleSortChange} />
              <SortableTableCell id="status" label={t("common.status")} sortable sortBy={sortBy} sortOrder={sortOrder} onSort={handleSortChange} />
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    {t("common.noRecordsFound")}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={row.uuid} hover>
                <TableCell>{row.booking_no || "-"}</TableCell>
                <TableCell>{row.traveller_type}</TableCell>
                <TableCell>{row.full_name}</TableCell>
                <TableCell>{row.age ?? "-"}</TableCell>
                <TableCell>{row.passport_no || "-"}</TableCell>
                <TableCell>{row.visa_status || "-"}</TableCell>
                <TableCell>{row.nationality || "-"}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        rowsPerPage={pageSize}
        onPageChange={(_, p) => setPage(p + 1)}
        onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}
      />
    </Box>
  );
}

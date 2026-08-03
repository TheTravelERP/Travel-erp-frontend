// src/features/departure/components/DepartureBranchBreakdownTable.tsx
//
// Per-branch rollup for the Departure Summary tab — which branches sold
// this departure and how much. Departure itself carries no branch (see
// the org-centric redesign); this is purely a Booking.branch_id groupby.
import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { getDepartureBranchBreakdown } from "../departure.api";
import type { DepartureBranchBreakdownItem } from "../departure.types";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";

interface Props {
  departureUuid: string;
}

export default function DepartureBranchBreakdownTable({ departureUuid }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [rows, setRows] = useState<DepartureBranchBreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDepartureBranchBreakdown(departureUuid)
      .then((res) => { if (active) setRows(res.data); })
      .catch(() => showSnackbar({ message: t("common.loadFailed"), severity: "error" }))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departureUuid]);

  if (!loading && rows.length === 0) {
    return null;
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t("departure.branchBreakdown.branch")}</TableCell>
            <TableCell align="right">{t("departure.branchBreakdown.bookings")}</TableCell>
            <TableCell align="right">{t("departure.branchBreakdown.travellers")}</TableCell>
            <TableCell align="right">{t("departure.branchBreakdown.revenue")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.branch_uuid} hover>
              <TableCell>
                <Typography variant="body2">{row.branch_name}</Typography>
                <Typography variant="caption" color="text.secondary">{row.branch_code}</Typography>
              </TableCell>
              <TableCell align="right">{row.total_bookings}</TableCell>
              <TableCell align="right">{row.total_travellers}</TableCell>
              <TableCell align="right">{row.revenue.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

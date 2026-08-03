// src/features/departure/components/DeparturePaymentsTable.tsx
//
// Deliberately no Paid/Balance/Payment Status columns — no Payment/Receipt
// ledger exists anywhere in this codebase yet (Booking has net_amount only).
// Shows each booking's Total Amount and a revenue rollup, per the confirmed
// scope trim; a future Finance module would extend this, not this file.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { getDeparturePayments } from "../departure.api";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";

interface Props {
  departureUuid: string;
}

const STATUS_COLOR: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
  Draft: "default",
  Confirmed: "success",
  "Partially Confirmed": "warning",
  "Travel Started": "primary",
  Completed: "success",
  Cancelled: "error",
  Closed: "default",
};

export default function DeparturePaymentsTable({ departureUuid }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [rows, setRows] = useState<{ booking_uuid: string; booking_no: string; customer_name?: string; status: string; net_amount: number }[]>([]);
  const [totalNetAmount, setTotalNetAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDeparturePayments(departureUuid)
      .then((res) => {
        if (!active) return;
        setRows(res.data);
        setTotalNetAmount(res.total_net_amount);
      })
      .catch(() => showSnackbar({ message: t("common.loadFailed"), severity: "error" }))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departureUuid]);

  return (
    <Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("departure.payments.bookingNo")}</TableCell>
              <TableCell>{t("common.customer")}</TableCell>
              <TableCell>{t("common.status")}</TableCell>
              <TableCell align="right">{t("departure.payments.totalAmount")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    {t("common.noRecordsFound")}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow
                key={row.booking_uuid}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/app/bookings/list/${row.booking_uuid}`)}
              >
                <TableCell>{row.booking_no}</TableCell>
                <TableCell>{row.customer_name || "-"}</TableCell>
                <TableCell><Chip size="small" color={STATUS_COLOR[row.status] ?? "default"} label={row.status} /></TableCell>
                <TableCell align="right">{row.net_amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {rows.length > 0 && (
        <Typography variant="subtitle1" fontWeight={600} textAlign="right" mt={2}>
          {t("departure.payments.totalRevenue")}: {totalNetAmount.toFixed(2)}
        </Typography>
      )}
    </Box>
  );
}

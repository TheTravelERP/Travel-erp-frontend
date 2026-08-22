// src/features/reports/bookings/components/BookingReportTable.tsx
import {
  Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";

import type { BookingReportRow } from "../bookingReport.types";

interface Props {
  rows: BookingReportRow[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function BookingReportTable({
  rows, loading, page, pageSize, total, onPageChange, onPageSizeChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("booking.bookingNo")}</TableCell>
              <TableCell>{t("common.customer")}</TableCell>
              <TableCell>{t("booking.package")}</TableCell>
              <TableCell>{t("booking.departure")}</TableCell>
              <TableCell align="right">{t("booking.totalTravellers")}</TableCell>
              <TableCell>{t("booking.bookingDate")}</TableCell>
              <TableCell>{t("common.status")}</TableCell>
              <TableCell align="right">{t("booking.netAmount")}</TableCell>
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
                <TableCell>
                  <RouterLink to={`/app/bookings/list/${row.uuid}`}>{row.booking_no}</RouterLink>
                </TableCell>
                <TableCell>{row.customer_name || "-"}</TableCell>
                <TableCell>{row.package_name || "-"}</TableCell>
                <TableCell>{row.departure_code || "-"}</TableCell>
                <TableCell align="right">{row.traveller_count}</TableCell>
                <TableCell>{row.booking_date}</TableCell>
                <TableCell><Chip size="small" label={row.status} /></TableCell>
                <TableCell align="right">{row.currency_code} {row.net_amount.toFixed(2)}</TableCell>
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
        rowsPerPageOptions={[20, 50, 100]}
        onPageChange={(_, p) => onPageChange(p + 1)}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
      />
    </>
  );
}

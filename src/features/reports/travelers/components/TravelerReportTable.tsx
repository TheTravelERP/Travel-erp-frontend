// src/features/reports/travelers/components/TravelerReportTable.tsx
import {
  Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import type { TravelerReportRow } from "../travelerReport.types";
import { passportStatusChipColor } from "./passportStatusChipColor";

interface Props {
  rows: TravelerReportRow[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function TravelerReportTable({
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
              <TableCell>{t("booking.travellerType")}</TableCell>
              <TableCell>{t("common.name")}</TableCell>
              <TableCell>{t("common.age")}</TableCell>
              <TableCell>{t("booking.nationality")}</TableCell>
              <TableCell>{t("booking.passportNo")}</TableCell>
              <TableCell>{t("booking.passportStatus")}</TableCell>
              <TableCell>{t("booking.visaStatus", { defaultValue: "Visa Status" })}</TableCell>
              <TableCell>{t("common.status")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
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
                <TableCell>{row.nationality || "-"}</TableCell>
                <TableCell>{row.passport_no || "-"}</TableCell>
                <TableCell>
                  {row.passport_status && (
                    <Chip size="small" label={row.passport_status} color={passportStatusChipColor(row.passport_status)} />
                  )}
                </TableCell>
                <TableCell>{row.visa_status || "-"}</TableCell>
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
        rowsPerPageOptions={[20, 50, 100]}
        onPageChange={(_, p) => onPageChange(p + 1)}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
      />
    </>
  );
}

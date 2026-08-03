// src/features/departure/components/DepartureServicesTable.tsx
import { useEffect, useState } from "react";
import {
  Box, Chip, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { getDepartureServices } from "../departure.api";
import type { DepartureServiceSummaryItem } from "../departure.types";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";

interface Props {
  departureUuid: string;
}

export default function DepartureServicesTable({ departureUuid }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [rows, setRows] = useState<DepartureServiceSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDepartureServices(departureUuid)
      .then((res) => { if (active) setRows(res.data); })
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
              <TableCell>{t("departure.services.serviceType")}</TableCell>
              <TableCell align="right">{t("departure.services.bookingCount")}</TableCell>
              <TableCell align="right">{t("departure.services.travellerCount")}</TableCell>
              <TableCell>{t("common.status")}</TableCell>
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
              <TableRow key={row.service_type} hover>
                <TableCell>{row.service_type}</TableCell>
                <TableCell align="right">{row.booking_count}</TableCell>
                <TableCell align="right">{row.traveller_count}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {Object.entries(row.status_counts).map(([status, count]) => (
                      <Chip key={status} size="small" label={`${status}: ${count}`} />
                    ))}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

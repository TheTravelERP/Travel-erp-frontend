// src/features/reports/notificationLogs/components/NotificationLogTable.tsx
import { useMemo } from "react";
import {
  Box,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InboxIcon from "@mui/icons-material/Inbox";
import { useTranslation } from "react-i18next";

import type { NotificationLogListItem } from "../notificationLog.types";
import { statusChipColor } from "./statusChipColor";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../../utils/formatters/localization";

interface Props {
  rows: NotificationLogListItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetail: (uuid: string) => void;
}

export default function NotificationLogTable({
  rows,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();
  const { formatDateTime } = useMemo(() => createFormatters(localizationProfile), [localizationProfile]);

  if (isMobile) {
    return (
      <Box>
        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} height={110} sx={{ mb: 2 }} />)
        ) : rows.length ? (
          rows.map((row) => (
            <Paper key={row.uuid} sx={{ mb: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack spacing={0.5}>
                    <Typography fontWeight={600}>{row.event_code}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.recipient_address} &bull; {formatDateTime(row.created_at)}
                    </Typography>
                  </Stack>
                  <IconButton size="small" onClick={() => onViewDetail(row.uuid)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip size="small" label={row.channel} />
                  <Chip size="small" color={statusChipColor(row.status)} label={row.status} />
                </Stack>
              </CardContent>
            </Paper>
          ))
        ) : (
          <Box textAlign="center" py={5}>
            <InboxIcon sx={{ fontSize: 48, opacity: 0.4 }} />
            <Typography>{t("common.noRecordsFound")}</Typography>
          </Box>
        )}

        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          rowsPerPage={pageSize}
          onPageChange={(_, p) => onPageChange(p + 1)}
          onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        />
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 160 }}>{t("notificationLog.colDate")}</TableCell>
              <TableCell sx={{ minWidth: 160 }}>{t("notificationLog.colEvent")}</TableCell>
              <TableCell sx={{ minWidth: 180 }}>{t("notificationLog.colRecipient")}</TableCell>
              <TableCell sx={{ minWidth: 100 }}>{t("notificationLog.colChannel")}</TableCell>
              <TableCell sx={{ minWidth: 140 }}>{t("notificationLog.colProvider")}</TableCell>
              <TableCell sx={{ minWidth: 100 }}>{t("notificationLog.colStatus")}</TableCell>
              <TableCell sx={{ minWidth: 160 }}>{t("notificationLog.colSentTime")}</TableCell>
              <TableCell sx={{ minWidth: 80 }}>{t("notificationLog.colRetryCount")}</TableCell>
              <TableCell align="right">{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading &&
              [...Array(pageSize)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={9}>
                    <Skeleton height={40} />
                  </TableCell>
                </TableRow>
              ))}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box textAlign="center" py={5}>
                    <InboxIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                    <Typography>{t("common.noRecordsFound")}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              rows.map((row) => (
                <TableRow key={row.uuid} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateTime(row.created_at)}</TableCell>
                  <TableCell>{row.event_code}</TableCell>
                  <TableCell>{row.recipient_address}</TableCell>
                  <TableCell>{row.channel}</TableCell>
                  <TableCell>{row.provider_name || "—"}</TableCell>
                  <TableCell>
                    <Chip size="small" color={statusChipColor(row.status)} label={row.status} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {row.sent_time ? formatDateTime(row.sent_time) : "—"}
                  </TableCell>
                  <TableCell>{row.retry_count}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => onViewDetail(row.uuid)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
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
        onPageChange={(_, p) => onPageChange(p + 1)}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
      />
    </>
  );
}

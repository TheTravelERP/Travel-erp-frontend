// src/features/settings/auditLog/components/AuditLogTable.tsx
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

import type { AuditLogListItem } from "../auditLog.types";
import { actionChipColor } from "./actionChipColor";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../../utils/formatters/localization";

interface Props {
  rows: AuditLogListItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetail: (uuid: string) => void;
}

export default function AuditLogTable({
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

  const actorLabel = (row: AuditLogListItem) =>
    row.actor_name || row.actor_email || t("auditLog.systemActor");

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
                    <Typography fontWeight={600}>{row.entity_type}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {actorLabel(row)} &bull; {formatDateTime(row.created_at)}
                    </Typography>
                  </Stack>
                  <IconButton size="small" onClick={() => onViewDetail(row.uuid)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Chip size="small" color={actionChipColor(row.action)} label={row.action} sx={{ mt: 1 }} />
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
              <TableCell sx={{ minWidth: 180 }}>{t("auditLog.colTimestamp")}</TableCell>
              <TableCell sx={{ minWidth: 150 }}>{t("auditLog.colEntityType")}</TableCell>
              <TableCell sx={{ minWidth: 120 }}>{t("auditLog.colAction")}</TableCell>
              <TableCell sx={{ minWidth: 180 }}>{t("auditLog.colActor")}</TableCell>
              <TableCell sx={{ minWidth: 200 }}>{t("auditLog.colChanges")}</TableCell>
              <TableCell align="right">{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading &&
              [...Array(pageSize)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton height={40} />
                  </TableCell>
                </TableRow>
              ))}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
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
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatDateTime(row.created_at)}
                  </TableCell>
                  <TableCell>{row.entity_type}</TableCell>
                  <TableCell>
                    <Chip size="small" color={actionChipColor(row.action)} label={row.action} />
                  </TableCell>
                  <TableCell>{actorLabel(row)}</TableCell>
                  <TableCell>
                    {row.changed_columns && row.changed_columns.length > 0
                      ? row.changed_columns.join(", ")
                      : "—"}
                  </TableCell>
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

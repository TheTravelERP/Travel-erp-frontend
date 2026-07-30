// src/features/notifications/components/NotificationCenterTable.tsx
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
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DoneIcon from "@mui/icons-material/Done";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import InboxIcon from "@mui/icons-material/Inbox";
import { useTranslation } from "react-i18next";

import type { NotificationListItem } from "../notification.types";
import { getRelatedRecordPath } from "../notification.utils";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../utils/formatters/localization";

interface Props {
  rows: NotificationListItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onMarkRead: (row: NotificationListItem) => void;
  onArchive: (row: NotificationListItem) => void;
  onOpenRecord: (path: string) => void;
}

function priorityColor(priority: string): "error" | "warning" | "default" {
  if (priority === "HIGH") return "error";
  if (priority === "LOW") return "default";
  return "warning";
}

export default function NotificationCenterTable({
  rows,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onMarkRead,
  onArchive,
  onOpenRecord,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();
  const { formatDateTime } = useMemo(() => createFormatters(localizationProfile), [localizationProfile]);

  const renderActions = (row: NotificationListItem) => {
    const path = getRelatedRecordPath(row.related_entity_type, row.related_entity_uuid);
    return (
      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
        {!row.is_read && (
          <Tooltip title={t("common.markRead")}>
            <IconButton size="small" onClick={() => onMarkRead(row)}>
              <DoneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {path && (
          <Tooltip title={t("notificationCenter.openRecord")}>
            <IconButton size="small" onClick={() => onOpenRecord(path)}>
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {!row.is_archived && (
          <Tooltip title={t("common.archive")}>
            <IconButton size="small" onClick={() => onArchive(row)}>
              <ArchiveOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    );
  };

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
                  <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                    <Typography fontWeight={row.is_read ? 400 : 700} noWrap>
                      {row.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {row.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(row.created_at)}
                    </Typography>
                  </Stack>
                  <Chip size="small" color={priorityColor(row.priority)} label={row.priority} />
                </Stack>
                <Box sx={{ mt: 1 }}>{renderActions(row)}</Box>
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
              <TableCell sx={{ minWidth: 160 }}>{t("notificationCenter.colDate")}</TableCell>
              <TableCell sx={{ minWidth: 200 }}>{t("notificationCenter.colTitle")}</TableCell>
              <TableCell sx={{ minWidth: 260 }}>{t("notificationCenter.colMessage")}</TableCell>
              <TableCell sx={{ minWidth: 100 }}>{t("notificationCenter.colPriority")}</TableCell>
              <TableCell sx={{ minWidth: 90 }}>{t("common.unread")}</TableCell>
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
                <TableRow key={row.uuid} hover selected={!row.is_read}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateTime(row.created_at)}</TableCell>
                  <TableCell sx={{ fontWeight: row.is_read ? 400 : 700 }}>{row.title}</TableCell>
                  <TableCell
                    sx={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {row.message}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" color={priorityColor(row.priority)} label={row.priority} />
                  </TableCell>
                  <TableCell>{!row.is_read && <Chip size="small" color="primary" label={t("common.unread")} />}</TableCell>
                  <TableCell align="right">{renderActions(row)}</TableCell>
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

// src/features/crm/followup/components/ReminderWorkspaceTable.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import DoneIcon from "@mui/icons-material/Done";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InboxIcon from "@mui/icons-material/Inbox";

import type { FollowupListItem, ReminderBucket } from "../followup.types";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import ReminderRescheduleDialog from "./ReminderRescheduleDialog";
import ReminderAssignDialog from "./ReminderAssignDialog";
import { completeFollowup, cancelFollowup } from "../followup.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../../utils/formatters/localization";

interface Props {
  bucket: ReminderBucket;
  rows: FollowupListItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRefresh: () => void;
}

const PRIORITY_COLOR: Record<string, "error" | "warning" | "default"> = {
  High: "error",
  Medium: "warning",
  Low: "default",
};

export default function ReminderWorkspaceTable({
  bucket,
  rows,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onRefresh,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const localizationProfile = useLocalizationProfile();
  const { formatDateTime } = useMemo(() => createFormatters(localizationProfile), [localizationProfile]);

  const [completeUuid, setCompleteUuid] = useState<string | null>(null);
  const [cancelUuid, setCancelUuid] = useState<string | null>(null);
  const [rescheduleUuid, setRescheduleUuid] = useState<string | null>(null);
  const [assignUuid, setAssignUuid] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isActionable = bucket !== "completed";

  const handleComplete = async () => {
    if (!completeUuid) return;
    setActionLoading(true);
    try {
      await completeFollowup(completeUuid);
      showSnackbar({ message: t("followup.completeSuccess"), severity: "success" });
      onRefresh();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("followup.completeFailed")), severity: "error" });
    } finally {
      setActionLoading(false);
      setCompleteUuid(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelUuid) return;
    setActionLoading(true);
    try {
      await cancelFollowup(cancelUuid);
      showSnackbar({ message: t("followup.cancelSuccess"), severity: "success" });
      onRefresh();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("followup.cancelFailed")), severity: "error" });
    } finally {
      setActionLoading(false);
      setCancelUuid(null);
    }
  };

  const renderActions = (row: FollowupListItem) => (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      <Tooltip title={t("common.view")}>
        <IconButton size="small" onClick={() => navigate(`/app/crm/followups/${row.uuid}`)}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {isActionable && (
        <>
          <Tooltip title={t("followup.complete")}>
            <IconButton size="small" color="success" onClick={() => setCompleteUuid(row.uuid)}>
              <DoneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("followup.rescheduleOrSnooze")}>
            <IconButton size="small" onClick={() => setRescheduleUuid(row.uuid)}>
              <ScheduleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("followup.assign")}>
            <IconButton size="small" onClick={() => setAssignUuid(row.uuid)}>
              <PersonAddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("followup.cancelReminder")}>
            <IconButton size="small" color="error" onClick={() => setCancelUuid(row.uuid)}>
              <CancelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Stack>
  );

  const dialogs = (
    <>
      <ConfirmDialog
        open={Boolean(completeUuid)}
        title={t("followup.complete")}
        message={t("followup.completeConfirmMessage")}
        confirmText={t("followup.complete")}
        loading={actionLoading}
        onClose={() => setCompleteUuid(null)}
        onConfirm={handleComplete}
      />
      <ConfirmDialog
        open={Boolean(cancelUuid)}
        title={t("followup.cancelReminder")}
        message={t("followup.cancelConfirmMessage")}
        confirmText={t("followup.cancelReminder")}
        loading={actionLoading}
        onClose={() => setCancelUuid(null)}
        onConfirm={handleCancel}
      />
      <ReminderRescheduleDialog uuid={rescheduleUuid} onClose={() => setRescheduleUuid(null)} onDone={onRefresh} />
      <ReminderAssignDialog uuid={assignUuid} onClose={() => setAssignUuid(null)} onDone={onRefresh} />
    </>
  );

  if (isMobile) {
    return (
      <Box>
        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} height={120} sx={{ mb: 2 }} />)
        ) : rows.length ? (
          rows.map((row) => (
            <Paper key={row.uuid} sx={{ mb: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                    <Typography fontWeight={600} noWrap>
                      {row.customer_name || row.enquiry_no}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {row.discussion_notes}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.next_followup_datetime ? formatDateTime(row.next_followup_datetime) : "-"}
                      {" • "}
                      {row.assigned_user_name || "-"}
                    </Typography>
                  </Stack>
                  <Chip size="small" color={PRIORITY_COLOR[row.priority] ?? "default"} label={row.priority} />
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
        {dialogs}
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 160 }}>{t("followup.colNextFollowup")}</TableCell>
              <TableCell sx={{ minWidth: 170 }}>{t("followup.colCustomer")}</TableCell>
              <TableCell sx={{ minWidth: 220 }}>{t("followup.colDiscussion")}</TableCell>
              <TableCell sx={{ minWidth: 150 }}>{t("followup.colAssignedUser")}</TableCell>
              <TableCell sx={{ minWidth: 100 }}>{t("followup.priority")}</TableCell>
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
                    {row.next_followup_datetime ? formatDateTime(row.next_followup_datetime) : "-"}
                  </TableCell>
                  <TableCell>
                    {row.customer_name}
                    {row.customer_mobile && (
                      <Typography variant="caption" color="text.secondary" component="div">
                        {row.customer_mobile}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>
                    <Typography variant="body2" noWrap title={row.discussion_notes}>
                      {row.discussion_notes}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.assigned_user_name || "-"}</TableCell>
                  <TableCell>
                    <Chip size="small" color={PRIORITY_COLOR[row.priority] ?? "default"} label={row.priority} />
                  </TableCell>
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
      {dialogs}
    </>
  );
}

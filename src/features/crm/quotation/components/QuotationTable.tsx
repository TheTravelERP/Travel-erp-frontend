// src/features/crm/quotation/components/QuotationTable.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  CardContent,
  Typography,
  TablePagination,
  Divider,
  Stack,
  Skeleton,
  Paper,
  IconButton,
  Chip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import InboxIcon from "@mui/icons-material/Inbox";

import type { QuotationListItem } from "../quotation.types";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import SortableTableCell from "../../../../components/common/SortableTableCell";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../../utils/formatters/localization";
import { deleteQuotationByUuid } from "../quotation.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

interface Props {
  rows: QuotationListItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (columnId: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRefresh: () => void;
}

const STATUS_COLOR: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
  Draft: "default",
  Sent: "primary",
  Revised: "warning",
  Accepted: "success",
  Rejected: "error",
  Expired: "error",
  Converted: "success",
};

function getColumns(t: TFunction) {
  return [
    { id: "quotation_no", label: t("quotation.quotationNo"), sortable: true, minWidth: 130 },
    { id: "customer_name", label: t("common.customer"), minWidth: 150 },
    { id: "enquiry_no", label: t("quotation.enquiry"), minWidth: 110 },
    { id: "status", label: t("common.status"), sortable: true, minWidth: 100 },
    { id: "quotation_date", label: t("quotation.quotationDate"), sortable: true, minWidth: 110 },
    { id: "net_amount", label: t("quotation.netAmount"), sortable: true, minWidth: 110, align: "right" as const },
  ];
}

export default function QuotationTable({
  rows, loading, page, pageSize, total, sortBy, sortOrder, onSortChange, onPageChange, onPageSizeChange, onRefresh,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { t } = useTranslation();
  const columns = useMemo(() => getColumns(t), [t]);
  const localizationProfile = useLocalizationProfile();
  const { formatDate } = useMemo(() => createFormatters(localizationProfile), [localizationProfile]);
  const { showSnackbar } = useSnackbar();

  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleDeleteConfirm() {
    if (!deleteUuid) return;
    try {
      setDeleteLoading(true);
      await deleteQuotationByUuid(deleteUuid);
      showSnackbar({ message: t("common.deletedSuccess"), severity: "success" });
      onRefresh();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.deleteFailed")), severity: "error" });
    } finally {
      setDeleteLoading(false);
      setDeleteUuid(null);
    }
  }

  function renderActions(row: QuotationListItem) {
    return (
      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
        <IconButton size="small" onClick={() => navigate(`/app/crm/quotations/${row.uuid}`)}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
        {row.status === "Draft" && (
          <IconButton size="small" color="error" onClick={() => setDeleteUuid(row.uuid)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
    );
  }

  if (isMobile) {
    return (
      <Box>
        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} height={110} sx={{ mb: 2 }} />)
        ) : rows.length ? (
          rows.map((row) => (
            <Paper key={row.uuid} sx={{ mb: 1 }} onClick={() => navigate(`/app/crm/quotations/${row.uuid}`)}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={600}>{row.quotation_no}</Typography>
                  <Chip size="small" color={STATUS_COLOR[row.status] ?? "default"} label={row.status} />
                </Stack>
                <Typography variant="caption">{row.customer_name} &bull; {row.enquiry_no}</Typography>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">{formatDate(row.quotation_date)}</Typography>
                  <Typography variant="body2" fontWeight={600}>{row.currency_code} {row.net_amount.toFixed(2)}</Typography>
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
          component="div" count={total} page={page - 1} rowsPerPage={pageSize}
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
              {columns.map((col) => (
                <SortableTableCell
                  key={col.id} id={col.id} label={col.label} sortable={col.sortable}
                  align={col.align} minWidth={col.minWidth}
                  sortBy={sortBy} sortOrder={sortOrder} onSort={onSortChange}
                />
              ))}
              <TableCell align="right">{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && [...Array(pageSize)].map((_, i) => (
              <TableRow key={i}><TableCell colSpan={7}><Skeleton height={40} /></TableCell></TableRow>
            ))}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box textAlign="center" py={5}>
                    <InboxIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                    <Typography>{t("common.noRecordsFound")}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {!loading && rows.map((row) => (
              <TableRow key={row.uuid} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/app/crm/quotations/${row.uuid}`)}>
                <TableCell>{row.quotation_no}{row.revision_no > 1 ? ` (Rev ${row.revision_no})` : ""}</TableCell>
                <TableCell>{row.customer_name}</TableCell>
                <TableCell>{row.enquiry_no}</TableCell>
                <TableCell><Chip size="small" color={STATUS_COLOR[row.status] ?? "default"} label={row.status} /></TableCell>
                <TableCell>{formatDate(row.quotation_date)}</TableCell>
                <TableCell align="right">{row.currency_code} {row.net_amount.toFixed(2)}</TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>{renderActions(row)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div" count={total} page={page - 1} rowsPerPage={pageSize}
        onPageChange={(_, p) => onPageChange(p + 1)}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
      />

      <ConfirmDialog
        open={Boolean(deleteUuid)} title={t("common.delete")} message={t("common.deleteConfirmMessageShort")}
        confirmText={t("common.delete")} loading={deleteLoading}
        onClose={() => setDeleteUuid(null)} onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

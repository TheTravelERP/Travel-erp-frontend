// src/features/settings/documentTemplates/components/DocumentTemplateConfigTable.tsx

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

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import InboxIcon from "@mui/icons-material/Inbox";

import type { DocumentTemplateConfigListItem } from "../documentTemplateConfig.types";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import SortableTableCell from "../../../../components/common/SortableTableCell";
import {
  deleteDocumentTemplateConfigByUuid,
  restoreDocumentTemplateConfigByUuid,
} from "../documentTemplateConfig.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

interface Props {
  rows: DocumentTemplateConfigListItem[];
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
  showTrash?: boolean;
}

interface TableColumn {
  id: keyof DocumentTemplateConfigListItem | string;
  label: string;
  sortable?: boolean;
  minWidth?: number;
}

function getColumns(t: TFunction): TableColumn[] {
  return [
    { id: "document_type_name", label: t("documentTemplateConfig.documentType"), minWidth: 160 },
    { id: "paper_size", label: t("documentTemplateConfig.paperSize"), minWidth: 100 },
    { id: "orientation", label: t("documentTemplateConfig.orientation"), minWidth: 100 },
    { id: "show_watermark", label: t("documentTemplateConfig.showWatermark"), minWidth: 100 },
    { id: "is_active", label: t("common.status"), sortable: true, minWidth: 100 },
  ];
}

function renderTriState(t: TFunction, value: boolean | null | undefined) {
  if (value === null || value === undefined) return t("documentTemplateConfig.inheritDefault");
  return value ? t("common.yes") : t("common.no");
}

export default function DocumentTemplateConfigTable({
  rows,
  loading,
  page,
  pageSize,
  total,
  sortBy,
  sortOrder,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  showTrash = false,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { t } = useTranslation();
  const columns = useMemo(() => getColumns(t), [t]);
  const { showSnackbar } = useSnackbar();

  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [restoreUuid, setRestoreUuid] = useState<string | null>(null);

  async function handleDeleteConfirm() {
    if (!deleteUuid) return;
    try {
      setDeleteLoading(true);
      await deleteDocumentTemplateConfigByUuid(deleteUuid);
      showSnackbar({ message: t("common.deletedSuccess"), severity: "success" });
      onRefresh();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.deleteFailed")), severity: "error" });
    } finally {
      setDeleteLoading(false);
      setDeleteUuid(null);
    }
  }

  async function handleRestore(uuid: string) {
    try {
      setRestoreUuid(uuid);
      await restoreDocumentTemplateConfigByUuid(uuid);
      showSnackbar({ message: t("common.restoredSuccess"), severity: "success" });
      onRefresh();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setRestoreUuid(null);
    }
  }

  function renderActions(row: DocumentTemplateConfigListItem) {
    if (showTrash) {
      return (
        <IconButton size="small" disabled={restoreUuid === row.uuid} onClick={() => handleRestore(row.uuid)}>
          <RestoreIcon fontSize="small" />
        </IconButton>
      );
    }
    return (
      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
        <IconButton size="small" onClick={() => navigate(`/app/settings/document-templates/config/${row.uuid}/edit`)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => setDeleteUuid(row.uuid)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    );
  }

  if (isMobile) {
    return (
      <Box>
        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} height={100} sx={{ mb: 2 }} />)
        ) : rows.length ? (
          rows.map((row) => (
            <Paper key={row.uuid} sx={{ mb: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={600}>{row.document_type_name}</Typography>
                  <Chip
                    size="small"
                    color={row.is_active ? "success" : "default"}
                    label={row.is_active ? t("common.active") : t("common.inactive")}
                  />
                </Stack>

                <Typography variant="caption">
                  {row.paper_size || t("documentTemplateConfig.inheritDefault")} &bull; {row.orientation || t("documentTemplateConfig.inheritDefault")}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" justifyContent="flex-end">
                  {renderActions(row)}
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

        <ConfirmDialog
          open={Boolean(deleteUuid)}
          title={t("common.delete")}
          message={t("common.deleteConfirmMessageShort")}
          confirmText={t("common.delete")}
          loading={deleteLoading}
          onClose={() => setDeleteUuid(null)}
          onConfirm={handleDeleteConfirm}
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
                  key={col.id}
                  id={col.id as string}
                  label={col.label}
                  sortable={col.sortable}
                  minWidth={col.minWidth}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={onSortChange}
                />
              ))}
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                {t("common.actions")}
              </TableCell>
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
                  <TableCell>{row.document_type_name}</TableCell>
                  <TableCell>{row.paper_size || t("documentTemplateConfig.inheritDefault")}</TableCell>
                  <TableCell>{row.orientation || t("documentTemplateConfig.inheritDefault")}</TableCell>
                  <TableCell>{renderTriState(t, row.show_watermark)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={row.is_active ? "success" : "default"}
                      label={row.is_active ? t("common.active") : t("common.inactive")}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    {renderActions(row)}
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

      <ConfirmDialog
        open={Boolean(deleteUuid)}
        title={t("common.delete")}
        message={t("common.deleteConfirmMessageShort")}
        confirmText={t("common.delete")}
        loading={deleteLoading}
        onClose={() => setDeleteUuid(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

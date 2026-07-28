// src/features/settings/documentNumberSeries/components/DocumentNumberSeriesTable.tsx

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
  Tooltip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import InboxIcon from "@mui/icons-material/Inbox";
import LockIcon from "@mui/icons-material/Lock";

import type { DocumentNumberSeriesListItem, CloneDocumentNumberSeriesInput } from "../documentNumberSeries.types";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import SortableTableCell from "../../../../components/common/SortableTableCell";
import CloneSeriesDialog from "./CloneSeriesDialog";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../../utils/formatters/localization";
import {
  deleteDocumentNumberSeriesByUuid,
  getDocumentNumberSeriesByUuid,
  updateDocumentNumberSeriesByUuid,
  cloneDocumentNumberSeriesByUuid,
} from "../documentNumberSeries.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

interface Props {
  rows: DocumentNumberSeriesListItem[];
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

interface TableColumn {
  id: keyof DocumentNumberSeriesListItem | string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  minWidth?: number;
}

function getColumns(t: TFunction): TableColumn[] {
  return [
    { id: "series_name", label: t("documentNumberSeries.seriesName"), sortable: true, minWidth: 130 },
    { id: "branch_code", label: t("documentNumberSeries.branch"), minWidth: 100 },
    { id: "document_type_code", label: t("documentNumberSeries.documentType"), minWidth: 120 },
    { id: "prefix", label: t("documentNumberSeries.prefix"), sortable: true, minWidth: 90 },
    { id: "is_default", label: t("documentNumberSeries.default"), sortable: true, minWidth: 90 },
    { id: "effective_from", label: t("documentNumberSeries.effectiveFrom"), sortable: true, minWidth: 110 },
    { id: "effective_to", label: t("documentNumberSeries.effectiveTo"), minWidth: 110 },
    { id: "last_generated_at", label: t("documentNumberSeries.lastGeneratedAt"), minWidth: 150 },
    { id: "is_active", label: t("common.status"), sortable: true, minWidth: 100 },
  ];
}

export default function DocumentNumberSeriesTable({
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
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { t } = useTranslation();
  const columns = useMemo(() => getColumns(t), [t]);
  const localizationProfile = useLocalizationProfile();
  const { formatDate, formatDateTime } = useMemo(() => createFormatters(localizationProfile), [localizationProfile]);
  const { showSnackbar } = useSnackbar();

  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleUuid, setToggleUuid] = useState<string | null>(null);
  const [cloneRow, setCloneRow] = useState<DocumentNumberSeriesListItem | null>(null);
  const [cloneLoading, setCloneLoading] = useState(false);

  async function handleDeleteConfirm() {
    if (!deleteUuid) return;
    try {
      setDeleteLoading(true);
      await deleteDocumentNumberSeriesByUuid(deleteUuid);
      showSnackbar({ message: t("common.deletedSuccess"), severity: "success" });
      onRefresh();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.deleteFailed")), severity: "error" });
    } finally {
      setDeleteLoading(false);
      setDeleteUuid(null);
    }
  }

  async function handleToggleActive(row: DocumentNumberSeriesListItem) {
    try {
      setToggleUuid(row.uuid);
      const detail = await getDocumentNumberSeriesByUuid(row.uuid);
      await updateDocumentNumberSeriesByUuid(row.uuid, { ...detail, is_active: !detail.is_active });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      onRefresh();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setToggleUuid(null);
    }
  }

  async function handleCloneConfirm(payload: CloneDocumentNumberSeriesInput) {
    if (!cloneRow) return;
    try {
      setCloneLoading(true);
      await cloneDocumentNumberSeriesByUuid(cloneRow.uuid, payload);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      onRefresh();
      setCloneRow(null);
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.createFailed")), severity: "error" });
    } finally {
      setCloneLoading(false);
    }
  }

  function renderActions(row: DocumentNumberSeriesListItem) {
    return (
      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
        <IconButton size="small" onClick={() => navigate(`/app/settings/doc-numbering/${row.uuid}/edit`)}>
          <EditIcon fontSize="small" />
        </IconButton>

        <Tooltip title={t("common.clone")}>
          <IconButton size="small" onClick={() => setCloneRow(row)}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={row.is_active ? t("common.active") : t("common.inactive")}>
          <span>
            <IconButton size="small" disabled={toggleUuid === row.uuid} onClick={() => handleToggleActive(row)}>
              {row.is_active ? <ToggleOnIcon fontSize="small" color="success" /> : <ToggleOffIcon fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>

        {row.is_locked ? (
          <Tooltip title={t("documentNumberSeries.cannotDeleteGenerated")}>
            <span>
              <IconButton size="small" disabled>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
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
          [...Array(3)].map((_, i) => <Skeleton key={i} height={130} sx={{ mb: 2 }} />)
        ) : rows.length ? (
          rows.map((row) => (
            <Paper key={row.uuid} sx={{ mb: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={600}>{row.series_name}</Typography>
                  <Stack direction="row" spacing={0.5}>
                    {row.is_default && <Chip size="small" color="primary" label={t("documentNumberSeries.default")} />}
                    {row.is_locked && <Chip size="small" icon={<LockIcon fontSize="small" />} label={t("documentNumberSeries.locked")} />}
                    <Chip
                      size="small"
                      color={row.is_active ? "success" : "default"}
                      label={row.is_active ? t("common.active") : t("common.inactive")}
                    />
                  </Stack>
                </Stack>

                <Typography variant="caption">
                  {row.branch_code} &bull; {row.document_type_code} &bull; {row.prefix}
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

        {cloneRow && (
          <CloneSeriesDialog
            open={Boolean(cloneRow)}
            sourceSeriesName={cloneRow.series_name}
            loading={cloneLoading}
            onClose={() => setCloneRow(null)}
            onConfirm={handleCloneConfirm}
          />
        )}
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
                  align={col.align}
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
                  <TableCell colSpan={10}>
                    <Skeleton height={40} />
                  </TableCell>
                </TableRow>
              ))}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={10}>
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
                  <TableCell>
                    {row.series_name}
                    {row.is_locked && (
                      <Tooltip title={t("documentNumberSeries.locked")}>
                        <LockIcon fontSize="inherit" sx={{ ml: 0.5, verticalAlign: "middle", opacity: 0.7 }} />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>{row.branch_code}</TableCell>
                  <TableCell>{row.document_type_code}</TableCell>
                  <TableCell>{row.prefix}</TableCell>
                  <TableCell>
                    {row.is_default && <Chip size="small" color="primary" label={t("documentNumberSeries.default")} />}
                  </TableCell>
                  <TableCell>{row.effective_from ? formatDate(row.effective_from) : "-"}</TableCell>
                  <TableCell>{row.effective_to ? formatDate(row.effective_to) : "-"}</TableCell>
                  <TableCell>{row.last_generated_at ? formatDateTime(row.last_generated_at) : "-"}</TableCell>
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

      {cloneRow && (
        <CloneSeriesDialog
          open={Boolean(cloneRow)}
          sourceSeriesName={cloneRow.series_name}
          loading={cloneLoading}
          onClose={() => setCloneRow(null)}
          onConfirm={handleCloneConfirm}
        />
      )}
    </>
  );
}

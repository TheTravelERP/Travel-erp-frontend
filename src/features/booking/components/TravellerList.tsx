// src/features/booking/components/TravellerList.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Button, Checkbox, Chip, Collapse, Grid, IconButton, Menu, MenuItem, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
  TableRow, TextField, Tooltip, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import HistoryIcon from "@mui/icons-material/History";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import UploadIcon from "@mui/icons-material/Upload";
import FilterListIcon from "@mui/icons-material/FilterList";
import ListAltIcon from "@mui/icons-material/ListAlt";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslation } from "react-i18next";

import { TRAVELLER_STATUSES, TRAVELLER_TYPES, type TravellerDetail, type TravellerFormInput } from "../traveller.types";
import {
  bulkDeleteTravellers, bulkRestoreTravellers, createTraveller, createTravellerFromCustomer,
  deleteTraveller, exportTravellersUrl, getDeletedTravellers, getTravellers,
  importTravellersFromCsv, restoreTraveller, updateTraveller,
} from "../traveller.api";
import TravellerFormDialog from "./TravellerFormDialog";
import TravellerSummaryCards from "./TravellerSummaryCards";
import TravellerEmptyState from "./TravellerEmptyState";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import ImportResultDialog from "../../../components/common/ImportResultDialog";
import RowActionsMenu from "../../../components/common/RowActionsMenu";
import SortableTableCell from "../../../components/common/SortableTableCell";
import { SearchInput } from "../../../components/ui/SearchInput";
import { useCsvImport } from "../../../hooks/useCsvImport";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../utils/errorMessage";

type ChipColor = "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";

const TRAVELLER_TYPE_COLOR: Record<string, ChipColor> = {
  Adult: "primary",
  Child: "info",
  Infant: "default",
};

const TRAVELLER_STATUS_COLOR: Record<string, ChipColor> = {
  Active: "success",
  Cancelled: "error",
  "No Show": "warning",
};

const VISA_STATUS_COLOR: Record<string, ChipColor> = {
  Approved: "success",
  Pending: "warning",
  Rejected: "error",
  Expired: "error",
};

const VISA_STATUS_OPTIONS = ["Pending", "Approved", "Rejected", "Expired"];

const FULL_SET_PAGE_SIZE = 200; // pragmatic cap for travellers-per-booking, used only for summary/completion stats

interface Perms {
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_import: boolean;
}

interface Props {
  bookingUuid: string;
  perms: Perms;
  primaryCustomerUuid?: string | null;
  onCountChange?: (count: number) => void;
  // Domestic packages never need passport/visa tracking (see
  // TravellerSummaryCards.tsx) — passed through from BookingViewPage.tsx.
  hidePassportVisa?: boolean;
}

interface Filters {
  traveller_type: string;
  nationality: string;
  status: string;
  visa_status: string;
}

const emptyFilters: Filters = { traveller_type: "", nationality: "", status: "", visa_status: "" };

type DialogMode = "create" | "edit" | "view";

export default function TravellerList({ bookingUuid, perms, primaryCustomerUuid, onCountChange, hidePassportVisa }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const [rows, setRows] = useState<TravellerDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [fullTravellers, setFullTravellers] = useState<TravellerDetail[]>([]);
  const [fullLoading, setFullLoading] = useState(true);

  const [isTrash, setIsTrash] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>();

  const [search, setSearch] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [expandedSection, setExpandedSection] = useState<"documents" | "activity" | undefined>();
  const [editing, setEditing] = useState<TravellerDetail | null>(null);
  const [actionUuid, setActionUuid] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [moreAnchorEl, setMoreAnchorEl] = useState<HTMLElement | null>(null);

  const load = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const params = {
        page, page_size: pageSize, search, sort_by: sortBy, sort_order: sortOrder, ...filters,
      };
      const res = isTrash
        ? await getDeletedTravellers(bookingUuid, { page, page_size: pageSize, search }, signal)
        : await getTravellers(bookingUuid, params, signal);
      setRows(res.data);
      setTotal(res.pagination.total);
    } catch (err) {
      if (!axios.isCancel(err)) showSnackbar({ message: t("common.loadFailed"), severity: "error" });
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  const loadFullSet = async (signal?: AbortSignal) => {
    setFullLoading(true);
    try {
      const res = await getTravellers(bookingUuid, { page: 1, page_size: FULL_SET_PAGE_SIZE }, signal);
      setFullTravellers(res.data);
      onCountChange?.(res.pagination.total);
    } catch (err) {
      if (!axios.isCancel(err)) {
        // Summary cards/completion are supplementary — fail silently rather than
        // showing a second error toast alongside the paginated table's own.
      }
    } finally {
      if (!signal?.aborted) setFullLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingUuid, isTrash, page, pageSize, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    const controller = new AbortController();
    loadFullSet(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingUuid]);

  useEffect(() => {
    setSelected(new Set());
  }, [rows, isTrash]);

  function handleSortChange(columnId: string) {
    const nextOrder = sortBy === columnId && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(columnId);
    setSortOrder(nextOrder);
  }

  async function handleSubmit(data: TravellerFormInput) {
    try {
      if (editing) {
        await updateTraveller(bookingUuid, editing.uuid, { ...data, version_no: editing.version_no });
        showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      } else {
        await createTraveller(bookingUuid, data);
        showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      }
      setDialogOpen(false);
      setEditing(null);
      load();
      loadFullSet();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    }
  }

  async function handleAddPrimaryCustomer() {
    setBusy(true);
    try {
      await createTravellerFromCustomer(bookingUuid);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      load();
      loadFullSet();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.createFailed")), severity: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function handleActionConfirm() {
    if (!actionUuid) return;
    setBusy(true);
    try {
      if (isTrash) {
        await restoreTraveller(bookingUuid, actionUuid);
        showSnackbar({ message: t("common.restoredSuccess"), severity: "success" });
      } else {
        await deleteTraveller(bookingUuid, actionUuid);
        showSnackbar({ message: t("common.deletedSuccess"), severity: "success" });
      }
      load();
      loadFullSet();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, isTrash ? t("common.restoreFailed") : t("common.deleteFailed")), severity: "error" });
    } finally {
      setBusy(false);
      setActionUuid(null);
    }
  }

  function toggleRow(uuid: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid); else next.add(uuid);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.uuid))));
  }

  async function handleBulkConfirm() {
    const uuids = Array.from(selected);
    if (!uuids.length) return;
    setBulkLoading(true);
    try {
      const result = isTrash
        ? await bulkRestoreTravellers(bookingUuid, uuids)
        : await bulkDeleteTravellers(bookingUuid, uuids);
      showSnackbar({ message: result.message, severity: "success" });
      setSelected(new Set());
      load();
      loadFullSet();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setBulkLoading(false);
      setBulkConfirmOpen(false);
    }
  }

  const { fileInputRef, result: importResult, dialogOpen: importDialogOpen, closeDialog: closeImportDialog, openFilePicker, onFileInputChange } =
    useCsvImport((file) => importTravellersFromCsv(bookingUuid, file), () => { load(); loadFullSet(); });

  function handleExport(format: "csv" | "excel" | "pdf") {
    window.open(exportTravellersUrl(bookingUuid, format, { search, ...filters }), "_blank");
    setMoreAnchorEl(null);
  }

  function openDialog(row: TravellerDetail | null, mode: DialogMode, section?: "documents" | "activity") {
    setEditing(row);
    setDialogMode(mode);
    setExpandedSection(section);
    setDialogOpen(true);
  }

  const selectionBar = selected.size > 0 && (
    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, mb: 1, borderRadius: 1, bgcolor: "action.selected" }}>
      <Typography variant="body2" fontWeight={600}>{t("common.selectedCount", { count: selected.size })}</Typography>
      <Stack direction="row" spacing={1}>
        <Button size="small" onClick={() => setSelected(new Set())}>{t("common.clear")}</Button>
        <Button
          size="small" variant="contained" color={isTrash ? "success" : "error"}
          startIcon={isTrash ? <RestoreFromTrashIcon fontSize="small" /> : <DeleteIcon fontSize="small" />}
          onClick={() => setBulkConfirmOpen(true)}
        >
          {isTrash ? t("common.restoreSelected") : t("common.deleteSelected")}
        </Button>
      </Stack>
    </Box>
  );

  const showRichEmptyState = !isTrash && !fullLoading && fullTravellers.length === 0
    && !search && Object.values(filters).every((v) => !v);

  const primaryAlreadyAdded = Boolean(primaryCustomerUuid)
    && fullTravellers.some((tr) => tr.customer_uuid === primaryCustomerUuid);

  return (
    <Box>
      {!isTrash && <TravellerSummaryCards travellers={fullTravellers} loading={fullLoading} hidePassportVisa={hidePassportVisa} />}

      <Stack direction="row" spacing={1.5} mb={2} flexWrap="wrap" useFlexGap alignItems="center">
        {!isTrash && perms.can_create && (
          <>
            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => openDialog(null, "create")}>
              {t("booking.addTraveller")}
            </Button>
            <Tooltip title={primaryAlreadyAdded ? t("booking.customerAlreadyTraveller", "This customer has already been added as a traveller.") : ""}>
              <span>
                <Button
                  size="small" variant="outlined" startIcon={<PersonAddIcon />}
                  disabled={busy || primaryAlreadyAdded}
                  onClick={handleAddPrimaryCustomer}
                >
                  {t("booking.addCustomerAsTraveller", "Add Customer as Traveller")}
                </Button>
              </span>
            </Tooltip>
          </>
        )}
        <Button
          size="small" variant={showFilters ? "contained" : "outlined"} startIcon={<FilterListIcon />}
          onClick={() => setShowFilters((v) => !v)}
        >
          {t("common.filters")}
        </Button>

        <SearchInput
          placeholder={t("booking.searchTravellers", "Search by name, passport or nationality")}
          value={draftSearch}
          onChange={(e) => setDraftSearch(e.target.value)}
          onSearch={() => { setSearch(draftSearch); setPage(1); }}
          onClear={() => { setDraftSearch(""); setSearch(""); setPage(1); }}
          sx={{ minWidth: 280, flexGrow: 1, maxWidth: 480 }}
        />

        {(perms.can_export || perms.can_import || perms.can_delete) && (
          <>
            <IconButton size="small" onClick={(e) => setMoreAnchorEl(e.currentTarget)} aria-label={t("common.more", "More")}>
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={moreAnchorEl} open={Boolean(moreAnchorEl)} onClose={() => setMoreAnchorEl(null)}>
              {perms.can_export && !isTrash && [
                <MenuItem key="export-csv" onClick={() => handleExport("csv")}>{t("common.exportCsv")}</MenuItem>,
                <MenuItem key="export-excel" onClick={() => handleExport("excel")}>{t("common.exportExcel")}</MenuItem>,
                <MenuItem key="export-pdf" onClick={() => handleExport("pdf")}>{t("common.exportPdf")}</MenuItem>,
              ]}
              {perms.can_import && !isTrash && (
                <MenuItem onClick={() => { openFilePicker(); setMoreAnchorEl(null); }}>
                  {t("common.importCsv")}
                </MenuItem>
              )}
              {perms.can_delete && (
                <MenuItem onClick={() => { setIsTrash((v) => !v); setPage(1); setMoreAnchorEl(null); }}>
                  {isTrash ? t("booking.travellers") : t("common.viewTrash")}
                </MenuItem>
              )}
            </Menu>
          </>
        )}
      </Stack>

      <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={onFileInputChange} />

      <Collapse in={showFilters}>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField select size="small" fullWidth label={t("booking.travellerType")}
              value={draftFilters.traveller_type} onChange={(e) => setDraftFilters((p) => ({ ...p, traveller_type: e.target.value }))}
            >
              <MenuItem value="">-</MenuItem>
              {TRAVELLER_TYPES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField select size="small" fullWidth label={t("booking.visaStatus", "Visa")}
              value={draftFilters.visa_status} onChange={(e) => setDraftFilters((p) => ({ ...p, visa_status: e.target.value }))}
            >
              <MenuItem value="">-</MenuItem>
              {VISA_STATUS_OPTIONS.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField size="small" fullWidth label={t("booking.nationality")}
              value={draftFilters.nationality} onChange={(e) => setDraftFilters((p) => ({ ...p, nationality: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField select size="small" fullWidth label={t("common.status")}
              value={draftFilters.status} onChange={(e) => setDraftFilters((p) => ({ ...p, status: e.target.value }))}
            >
              <MenuItem value="">-</MenuItem>
              {TRAVELLER_STATUSES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }} display="flex" alignItems="center" gap={1}>
            <Button size="small" variant="contained" onClick={() => { setFilters(draftFilters); setPage(1); }}>
              {t("common.filters")}
            </Button>
            <Button size="small" onClick={() => { setDraftFilters(emptyFilters); setFilters(emptyFilters); setPage(1); }}>
              {t("common.reset")}
            </Button>
          </Grid>
        </Grid>
      </Collapse>

      {selectionBar}

      {showRichEmptyState ? (
        <TravellerEmptyState
          canCreate={perms.can_create}
          onAddTraveller={() => openDialog(null, "create")}
          onAddCustomerAsTraveller={handleAddPrimaryCustomer}
        />
      ) : (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {(perms.can_delete) && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selected.size > 0 && selected.size < rows.length}
                        checked={rows.length > 0 && selected.size === rows.length}
                        onChange={toggleSelectAll}
                        disabled={rows.length === 0}
                      />
                    </TableCell>
                  )}
                  <TableCell>#</TableCell>
                  <SortableTableCell id="first_name" label={t("booking.traveller", "Traveller")} sortable sortBy={sortBy} sortOrder={sortOrder} onSort={handleSortChange} />
                  <SortableTableCell id="traveller_type" label={t("booking.travellerType")} sortable sortBy={sortBy} sortOrder={sortOrder} onSort={handleSortChange} />
                  <TableCell>{t("settings.gender", "Gender")}</TableCell>
                  <TableCell>{t("common.age")}</TableCell>
                  <SortableTableCell id="passport_no" label={t("booking.passportNo")} sortable sortBy={sortBy} sortOrder={sortOrder} onSort={handleSortChange} />
                  <TableCell>{t("booking.visaStatus", "Visa Status")}</TableCell>
                  <SortableTableCell id="nationality" label={t("booking.nationality")} sortable sortBy={sortBy} sortOrder={sortOrder} onSort={handleSortChange} />
                  <TableCell>{t("booking.primaryTraveller", "Primary Traveller")}</TableCell>
                  <SortableTableCell id="status" label={t("common.status")} sortable sortBy={sortBy} sortOrder={sortOrder} onSort={handleSortChange} />
                  <TableCell align="right">{t("common.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={12}>
                      <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                        {t("common.noRecordsFound")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {rows.map((row, idx) => {
                  const missingPassport = !hidePassportVisa && !row.passport_no;
                  const pendingVisa = !hidePassportVisa && (!row.visa_status || row.visa_status === "Pending");
                  const missingDob = !row.date_of_birth;
                  const isPrimary = Boolean(primaryCustomerUuid) && row.customer_uuid === primaryCustomerUuid;

                  return (
                    <TableRow key={row.uuid} hover selected={selected.has(row.uuid)}>
                      {perms.can_delete && (
                        <TableCell padding="checkbox">
                          <Checkbox checked={selected.has(row.uuid)} onChange={() => toggleRow(row.uuid)} />
                        </TableCell>
                      )}
                      <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <span>{row.full_name}</span>
                          {missingDob && (
                            <Tooltip title={t("booking.dobMissing", "DOB Missing")}>
                              <WarningAmberIcon fontSize="inherit" color="warning" />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={row.traveller_type} color={TRAVELLER_TYPE_COLOR[row.traveller_type] ?? "default"} />
                      </TableCell>
                      <TableCell>{row.gender || t("common.notSet", "Not Set")}</TableCell>
                      <TableCell>{row.age != null ? row.age : t("booking.dobMissing", "DOB Missing")}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <span>{row.passport_no || t("booking.passportMissing", "Passport Missing")}</span>
                          {missingPassport && (
                            <Tooltip title={t("booking.passportMissing", "Passport Missing")}>
                              <WarningAmberIcon fontSize="inherit" color="warning" />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Chip
                            size="small"
                            label={row.visa_status || t("booking.visaNotApplied", "Visa Not Applied")}
                            color={row.visa_status ? (VISA_STATUS_COLOR[row.visa_status] ?? "default") : "default"}
                          />
                          {pendingVisa && (
                            <Tooltip title={t("booking.visaPending", "Visa Pending")}>
                              <WarningAmberIcon fontSize="inherit" color="warning" />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>{row.nationality || t("booking.nationalityNotAvailable", "Nationality Not Available")}</TableCell>
                      <TableCell>
                        {isPrimary && <Chip size="small" variant="outlined" color="primary" label={t("booking.primary", "Primary")} />}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={row.status} color={TRAVELLER_STATUS_COLOR[row.status] ?? "default"} />
                      </TableCell>
                      <TableCell align="right">
                        {isTrash ? (
                          perms.can_delete && (
                            <IconButton size="small" color="success" onClick={() => setActionUuid(row.uuid)}>
                              <RestoreFromTrashIcon fontSize="small" />
                            </IconButton>
                          )
                        ) : (
                          <RowActionsMenu
                            ariaLabel={t("common.actions")}
                            groups={[
                              [
                                {
                                  key: "view",
                                  label: t("common.view"),
                                  icon: <VisibilityIcon fontSize="small" />,
                                  onClick: () => openDialog(row, "view"),
                                },
                                {
                                  key: "edit",
                                  label: t("common.edit"),
                                  icon: <EditIcon fontSize="small" />,
                                  show: perms.can_edit,
                                  onClick: () => openDialog(row, "edit"),
                                },
                              ],
                              [
                                {
                                  key: "documents",
                                  label: t("common.attachments"),
                                  icon: <AttachFileIcon fontSize="small" />,
                                  onClick: () => openDialog(row, "view", "documents"),
                                },
                                {
                                  key: "timeline",
                                  label: t("common.activity"),
                                  icon: <HistoryIcon fontSize="small" />,
                                  onClick: () => openDialog(row, "view", "activity"),
                                },
                              ],
                              [
                                {
                                  key: "delete",
                                  label: t("common.delete"),
                                  icon: <DeleteIcon fontSize="small" />,
                                  color: "error",
                                  show: perms.can_delete,
                                  onClick: () => setActionUuid(row.uuid),
                                },
                              ],
                            ]}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page - 1}
            rowsPerPage={pageSize}
            onPageChange={(_, p) => setPage(p + 1)}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}
          />
        </>
      )}

      <TravellerFormDialog
        open={dialogOpen}
        traveller={editing}
        mode={dialogMode}
        initialExpandedSection={expandedSection}
        canEdit={perms.can_edit}
        onClose={() => { setDialogOpen(false); setEditing(null); setExpandedSection(undefined); }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(actionUuid)}
        title={isTrash ? t("common.restore") : t("common.delete")}
        message={isTrash ? t("common.restoreConfirmMessage") : t("common.deleteConfirmMessageShort")}
        confirmText={isTrash ? t("common.restore") : t("common.delete")}
        loading={busy}
        onClose={() => setActionUuid(null)}
        onConfirm={handleActionConfirm}
      />

      <ConfirmDialog
        open={bulkConfirmOpen}
        title={isTrash ? t("common.restore") : t("common.delete")}
        message={isTrash ? t("common.restoreBulkConfirmMessage", { count: selected.size }) : t("common.deleteBulkConfirmMessage", { count: selected.size })}
        confirmText={isTrash ? t("common.restore") : t("common.delete")}
        loading={bulkLoading}
        onClose={() => setBulkConfirmOpen(false)}
        onConfirm={handleBulkConfirm}
      />

      <ImportResultDialog open={importDialogOpen} result={importResult} onClose={closeImportDialog} />
    </Box>
  );
}

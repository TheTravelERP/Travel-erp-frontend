// src/features/settings/users/components/UserPermissionOverrides.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  TextField,
  MenuItem,
  Grid,
  Stack,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import {
  listUserPermissionOverrides,
  upsertUserPermissionOverride,
  deleteUserPermissionOverride,
} from "../userPermissionOverride.api";
import type {
  UserPermissionOverrideFormInput,
  UserPermissionOverrideItem,
  DataScope,
} from "../userPermissionOverride.types";

interface Props {
  userUuid: string;
}

const FLAGS: { key: keyof UserPermissionOverrideFormInput; label: string }[] = [
  { key: "can_view", label: "View" },
  { key: "can_add", label: "Add" },
  { key: "can_edit", label: "Edit" },
  { key: "can_delete", label: "Delete" },
  { key: "can_export", label: "Export" },
  { key: "can_import", label: "Import" },
];

const DATA_SCOPES: DataScope[] = ["OWN", "TEAM", "ORG", "GLOBAL"];

const emptyValues: UserPermissionOverrideFormInput = {
  menu_id: null,
  can_view: false,
  can_add: false,
  can_edit: false,
  can_delete: false,
  can_export: false,
  can_import: false,
  data_scope: "OWN",
  override_type: "ALLOW",
  remarks: "",
};

export default function UserPermissionOverrides({ userUuid }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const [rows, setRows] = useState<UserPermissionOverrideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm<UserPermissionOverrideFormInput>({
    defaultValues: emptyValues,
  });

  const fetchData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const data = await listUserPermissionOverrides(userUuid, signal);
      setRows(data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userUuid]);

  const openDialog = () => {
    reset(emptyValues);
    setDialogOpen(true);
  };

  const onSave = async (data: UserPermissionOverrideFormInput) => {
    if (!data.menu_id) {
      showSnackbar({ message: t("userPermissionOverride.menuRequired"), severity: "error" });
      return;
    }

    setSaving(true);
    try {
      const updated = await upsertUserPermissionOverride(userUuid, data);
      setRows(updated);
      setDialogOpen(false);
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteUuid) return;
    setDeleteLoading(true);
    try {
      const updated = await deleteUserPermissionOverride(userUuid, deleteUuid);
      setRows(updated);
      showSnackbar({ message: t("common.deletedSuccess"), severity: "success" });
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.deleteFailed")), severity: "error" });
    } finally {
      setDeleteLoading(false);
      setDeleteUuid(null);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" color="primary">
          {t("userPermissionOverride.title")}
        </Typography>
        <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={openDialog}>
          {t("userPermissionOverride.add")}
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={24} />
        </Box>
      ) : rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t("userPermissionOverride.empty")}
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("userPermissionOverride.colMenu")}</TableCell>
              <TableCell>{t("userPermissionOverride.colFlags")}</TableCell>
              <TableCell>{t("userPermissionOverride.colType")}</TableCell>
              <TableCell>{t("branch.remarks")}</TableCell>
              <TableCell align="right">{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.uuid} hover>
                <TableCell>{row.menu_title}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {FLAGS.filter((f) => row[f.key as keyof UserPermissionOverrideItem]).map((f) => (
                      <Chip key={f.key} size="small" label={f.label} />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={row.override_type}
                    color={row.override_type === "ALLOW" ? "success" : "error"}
                  />
                </TableCell>
                <TableCell>{row.remarks || "-"}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => setDeleteUuid(row.uuid)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("userPermissionOverride.add")}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <EntityAutocomplete
                name="menu_id"
                label={t("userPermissionOverride.colMenu")}
                control={control}
                dropdownName="menus"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="override_type"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label={t("userPermissionOverride.colType")} fullWidth>
                    <MenuItem value="ALLOW">ALLOW</MenuItem>
                    <MenuItem value="DENY">DENY</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="data_scope"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label={t("role.colDataScope")} fullWidth>
                    {DATA_SCOPES.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {FLAGS.map((f) => (
                  <Controller
                    key={f.key}
                    name={f.key as any}
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label={f.label}
                      />
                    )}
                  />
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="remarks"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label={t("branch.remarks")} fullWidth multiline rows={2} />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t("common.discard")}</Button>
          <Button variant="contained" disabled={saving} onClick={handleSubmit(onSave)}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteUuid)}
        title={t("common.delete")}
        message={t("common.deleteConfirmMessage")}
        confirmText={t("common.delete")}
        loading={deleteLoading}
        onClose={() => setDeleteUuid(null)}
        onConfirm={confirmDelete}
      />
    </Paper>
  );
}

// src/features/enquiry/pages/EnquiryViewPage.tsx

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import {
  getEnquiryByUuid,
  linkCustomerForEnquiry,
  cloneEnquiry,
  markEnquiryLost,
  reopenEnquiry,
  assignEnquiryAgent,
  assignEnquiryBranch,
} from "../enquiry.api";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../hooks/usePermission";
import DropdownColorChip from "../../../components/common/DropdownColorChip";
import FormPageLayout from "../../../components/forms/FormPageLayout";
import CommunicationHistory from "../../../components/common/CommunicationHistory";
import AttachmentList from "../../../components/common/AttachmentList";
import NoteList from "../../../components/common/NoteList";
import ActivityTimeline from "../../../components/common/ActivityTimeline";
import TaskList from "../../../components/common/TaskList";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import EntityAutocomplete from "../../../components/common/EntityAutocomplete";
import { getErrorMessage } from "../../../utils/errorMessage";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../utils/formatters/localization";
import { getQuotationsList } from "../../crm/quotation/quotation.api";
import type { QuotationListItem } from "../../crm/quotation/quotation.types";

import type { EnquiryFormInput } from "../enquiry.types";

const QUOTATION_STATUS_COLOR: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
  Draft: "default", Sent: "primary", Revised: "warning",
  Accepted: "success", Rejected: "error", Expired: "error", Converted: "success",
};

export default function EnquiryViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission('crm.enquiries');
  const quotationPerms = usePermission('crm.quotations');
  const localizationProfile = useLocalizationProfile();
  const { formatDate } = createFormatters(localizationProfile);

  const [loading, setLoading] = useState(true);
  const [enquiry, setEnquiry] = useState<EnquiryFormInput | null>(null);
  const [linking, setLinking] = useState(false);

  const [quotations, setQuotations] = useState<QuotationListItem[]>([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [cloneConfirmOpen, setCloneConfirmOpen] = useState(false);
  const [reopenConfirmOpen, setReopenConfirmOpen] = useState(false);
  const [markLostOpen, setMarkLostOpen] = useState(false);
  const [lostReason, setLostReason] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignAgentUuid, setAssignAgentUuid] = useState<string | null>(null);
  const [assignBranchUuid, setAssignBranchUuid] = useState<string | null>(null);

  useEffect(() => {
    if (uuid) {
      loadEnquiry();
      loadQuotations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  // Arriving from the Enquiry list's "View Quotations" row action — the
  // Quotations section is already rendered inline above, just scroll to it
  // once the list has finished loading. Guarded to fire only once per mount.
  const scrolledToQuotationsRef = useRef(false);
  useEffect(() => {
    if (quotationsLoading || scrolledToQuotationsRef.current) return;
    if (window.location.hash === "#quotations") {
      scrolledToQuotationsRef.current = true;
      document.getElementById("quotations")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [quotationsLoading]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadEnquiry() {
    try {
      const data = await getEnquiryByUuid(uuid!, isTrash);

      setEnquiry(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/enquiries");
    } finally {
      setLoading(false);
    }
  }

  async function loadQuotations() {
    if (!uuid) return;
    setQuotationsLoading(true);
    try {
      const res = await getQuotationsList({
        enquiry_uuid: uuid,
        page_size: 50,
        sort_by: "quotation_date",
        sort_order: "desc",
      });
      setQuotations(res.data);
    } catch {
      // Non-critical panel — a failed fetch just leaves it empty rather
      // than blocking the rest of the enquiry page.
    } finally {
      setQuotationsLoading(false);
    }
  }

  async function handleLinkCustomer() {
    if (!uuid) return;

    setLinking(true);
    try {
      const result = await linkCustomerForEnquiry(uuid);
      await loadEnquiry();

      showSnackbar({
        message: result.created
          ? t("enquiry.customerCreatedAndLinked", { name: result.customer.name })
          : t("enquiry.customerLinkedExisting", { name: result.customer.name }),
        severity: "success",
      });
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.updateFailed"),
        severity: "error",
      });
    } finally {
      setLinking(false);
    }
  }

  async function handleClone() {
    if (!uuid) return;
    setActionLoading(true);
    try {
      const cloned = await cloneEnquiry(uuid);
      showSnackbar({ message: t("enquiry.cloneSuccess", { enquiryNo: cloned.enquiry_no }), severity: "success" });
      setCloneConfirmOpen(false);
      navigate(`/app/enquiries/${cloned.uuid}`);
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMarkLost() {
    if (!uuid) return;
    setActionLoading(true);
    try {
      await markEnquiryLost(uuid, lostReason);
      showSnackbar({ message: t("enquiry.markLostSuccess"), severity: "success" });
      setMarkLostOpen(false);
      setLostReason("");
      loadEnquiry();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReopen() {
    if (!uuid) return;
    setActionLoading(true);
    try {
      await reopenEnquiry(uuid);
      showSnackbar({ message: t("enquiry.reopenSuccess"), severity: "success" });
      setReopenConfirmOpen(false);
      loadEnquiry();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAssign() {
    if (!uuid || !assignAgentUuid || !assignBranchUuid) return;
    setActionLoading(true);
    try {
      if (assignAgentUuid !== enquiry?.agent_uuid) {
        await assignEnquiryAgent(uuid, assignAgentUuid);
      }
      if (assignBranchUuid !== enquiry?.branch_uuid) {
        await assignEnquiryBranch(uuid, assignBranchUuid);
      }
      showSnackbar({ message: t("enquiry.assignSuccess"), severity: "success" });
      setAssignOpen(false);
      loadEnquiry();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!enquiry) {
    return null;
  }

  const isLost = enquiry.conversion_status === "Lost";
  const isConverted = enquiry.conversion_status === "Converted";

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t('menu.crm.enquiries'), href: "/app/enquiries" },
        { label: t("common.view") },
      ]}
    >
        {/* ================= CUSTOMER ================= */}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
            sx={{ mb: 3 }}
          >
            <Typography variant="h6" color="primary">
              {t("enquiry.customerInformation")}
            </Typography>

            {!enquiry.cust_uuid && (
              <Box display="flex" alignItems="center" gap={2}>
                <Alert severity="warning" sx={{ py: 0 }}>
                  {t("enquiry.notLinkedToCustomer")}
                </Alert>

                {perms.can_edit && (
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={linking}
                    onClick={handleLinkCustomer}
                  >
                    {linking ? t("common.loading") : t("enquiry.linkCustomer")}
                  </Button>
                )}
              </Box>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("common.customerName")}</Typography>

              <Typography mt={0.5}>{enquiry.customer_name || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("common.mobile")}</Typography>

              <Typography mt={0.5}>{enquiry.customer_mobile || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("common.email")}</Typography>

              <Typography mt={0.5}>{enquiry.customer_email || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= PACKAGE ================= */}

        {enquiry.business_type === "Package" && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
              {t("enquiry.packageSelection")}
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption">{t("enquiry.packageName")}</Typography>

                <Typography mt={0.5}>{enquiry.package_name || "-"}</Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* ================= ENQUIRY ================= */}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("enquiry.enquiryDetails")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("enquiry.businessType")}</Typography>

              <Typography mt={0.5}>{enquiry.business_type}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("enquiry.paxCount")}</Typography>

              <Typography mt={0.5}>{enquiry.pax_count}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("common.source")}</Typography>

              <Typography mt={0.5}>{enquiry.lead_source}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("common.priority")}</Typography>

              <Box mt={0.5}>
                <DropdownColorChip
                  dropdownName="enquiry_priority"
                  value={enquiry.enquiry_priority}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("common.status")}</Typography>

              <Box mt={0.5}>
                <DropdownColorChip
                  dropdownName="enquiry_status"
                  value={enquiry.conversion_status}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("booking.salesExecutive")}</Typography>

              <Typography mt={0.5}>{enquiry.agent_name || "-"}</Typography>
            </Grid>

            {isLost && enquiry.lost_reason && (
              <Grid size={{ xs: 12, md: 9 }}>
                <Typography variant="caption">{t("enquiry.lostReason")}</Typography>

                <Typography mt={0.5} whiteSpace="pre-wrap">{enquiry.lost_reason}</Typography>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("common.notes")}</Typography>

              <Typography mt={0.5} whiteSpace="pre-wrap">
                {enquiry.description || "-"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= QUOTATIONS ================= */}

        {!isTrash && (
          <Paper id="quotations" variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              {t("enquiry.quotations")}
            </Typography>

            {quotationsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}><CircularProgress size={24} /></Box>
            ) : quotations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">{t("enquiry.noQuotationsYet")}</Typography>
            ) : (
              <Stack spacing={1.5} divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />}>
                {quotations.map((q) => (
                  <Box
                    key={q.uuid}
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/app/crm/quotations/${q.uuid}`)}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                          {q.quotation_no}{q.revision_no > 1 ? ` (Rev ${q.revision_no})` : ""}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(q.quotation_date)}
                        </Typography>
                      </Stack>
                      <Chip size="small" color={QUOTATION_STATUS_COLOR[q.status] ?? "default"} label={q.status} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {q.currency_code} {q.net_amount.toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        )}

        {/* ================= DOCUMENTS ================= */}

        {!isTrash && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              {t("common.attachments")}
            </Typography>
            <AttachmentList entityType="enquiry" entityUuid={uuid!} menuKey="crm.enquiries" canEdit={perms.can_edit} />
          </Paper>
        )}

        {/* ================= TASKS ================= */}

        {!isTrash && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              {t("menu.tasks")}
            </Typography>
            <TaskList linkedEntityType="enquiry" linkedEntityUuid={uuid!} />
          </Paper>
        )}

        {/* ================= NOTES ================= */}

        {!isTrash && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              {t("common.notes")}
            </Typography>
            <NoteList entityType="enquiry" entityUuid={uuid!} canEdit={perms.can_edit} />
          </Paper>
        )}

        {/* ================= COMMUNICATION HISTORY ================= */}

        {!isTrash && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
              {t("communicationHistory.title")}
            </Typography>
            <CommunicationHistory entityType="enquiry" entityUuid={uuid!} />
          </Paper>
        )}

        {/* ================= ACTIVITY ================= */}

        {!isTrash && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              {t("common.activity")}
            </Typography>
            <ActivityTimeline entityType="enquiry" entityUuid={uuid!} />
          </Paper>
        )}

        {/* ================= FOOTER ================= */}

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          {/* Left */}

          <Button
            variant="outlined"
            onClick={() => navigate("/app/enquiries")}
            size="large"
          >
            {t("common.back")}
          </Button>

          {/* Right */}

          <Box display="flex" gap={2} flexWrap="wrap">
            {!isTrash && perms.can_edit && (
              <Button variant="outlined" size="large" onClick={() => setCloneConfirmOpen(true)}>
                {t("enquiry.actionClone")}
              </Button>
            )}

            {!isTrash && perms.can_edit && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  setAssignAgentUuid(enquiry.agent_uuid ?? null);
                  setAssignBranchUuid(enquiry.branch_uuid ?? null);
                  setAssignOpen(true);
                }}
              >
                {t("enquiry.assignSalesExecutiveAndBranch")}
              </Button>
            )}

            {!isTrash && perms.can_edit && isLost && (
              <Button variant="outlined" size="large" onClick={() => setReopenConfirmOpen(true)}>
                {t("enquiry.actionReopen")}
              </Button>
            )}

            {!isTrash && perms.can_edit && !isLost && !isConverted && (
              <Button variant="outlined" color="error" size="large" onClick={() => setMarkLostOpen(true)}>
                {t("enquiry.actionMarkLost")}
              </Button>
            )}

            {!isTrash && quotationPerms.can_create && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate(`/app/crm/quotations/create?enquiry_uuid=${uuid}`)}
              >
                {quotations.length > 0 ? t("enquiry.actionNewQuotation") : t("enquiry.actionCreateQuotation")}
              </Button>
            )}

            {perms.can_edit && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/app/enquiries/${uuid}/edit`)}
              >
                {t("common.edit")}
              </Button>
            )}
          </Box>
        </Box>

        {/* ================= ACTION DIALOGS ================= */}

        <ConfirmDialog
          open={cloneConfirmOpen}
          title={t("enquiry.actionClone")}
          message={t("enquiry.cloneConfirmMessage")}
          confirmText={t("enquiry.actionClone")}
          loading={actionLoading}
          onClose={() => setCloneConfirmOpen(false)}
          onConfirm={handleClone}
        />

        <ConfirmDialog
          open={reopenConfirmOpen}
          title={t("enquiry.actionReopen")}
          message={t("enquiry.reopenConfirmMessage")}
          confirmText={t("enquiry.actionReopen")}
          loading={actionLoading}
          onClose={() => setReopenConfirmOpen(false)}
          onConfirm={handleReopen}
        />

        <Dialog open={markLostOpen} onClose={() => setMarkLostOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>{t("enquiry.actionMarkLost")}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth multiline minRows={2} sx={{ mt: 1 }}
              label={t("enquiry.markLostReason")}
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMarkLostOpen(false)}>{t("common.cancel")}</Button>
            <Button color="error" variant="contained" disabled={actionLoading} onClick={handleMarkLost}>
              {t("enquiry.actionMarkLost")}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>{t("enquiry.assignSalesExecutiveAndBranch")}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <EntityAutocomplete
                name="agent_uuid"
                label={t("booking.salesExecutive")}
                dropdownName="users"
                useForm={false}
                value={assignAgentUuid}
                onChange={(val) => setAssignAgentUuid(val)}
              />
              <EntityAutocomplete
                name="branch_uuid"
                label={t("enquiry.branch")}
                dropdownName="branch"
                useForm={false}
                value={assignBranchUuid}
                onChange={(val) => setAssignBranchUuid(val)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignOpen(false)}>{t("common.cancel")}</Button>
            <Button
              variant="contained"
              disabled={actionLoading || !assignAgentUuid || !assignBranchUuid}
              onClick={handleAssign}
            >
              {t("enquiry.assignSalesExecutiveAndBranch")}
            </Button>
          </DialogActions>
        </Dialog>
    </FormPageLayout>
  );
}

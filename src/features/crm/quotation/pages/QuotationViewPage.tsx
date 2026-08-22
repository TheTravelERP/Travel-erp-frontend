// src/features/crm/quotation/pages/QuotationViewPage.tsx
import { Fragment, useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LinkIcon from "@mui/icons-material/Link";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  getQuotationByUuid,
  reviseQuotation,
  acceptQuotation,
  rejectQuotation,
  convertQuotationToBooking,
  previewQuotationPdf,
  quotationPdfDownloadUrl,
} from "../quotation.api";
import type { QuotationDetail } from "../quotation.types";
import QuotationVersionSwitcher from "../components/QuotationVersionSwitcher";
import DocumentPreviewPanel from "../../../settings/documentTemplates/components/DocumentPreviewPanel";
import AttachmentList from "../../../../components/common/AttachmentList";
import CommunicationHistory from "../../../../components/common/CommunicationHistory";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../../utils/formatters/localization";
import { getFollowups } from "../../followup/followup.api";
import type { FollowupListItem } from "../../followup/followup.types";
import DropdownColorChip from "../../../../components/common/DropdownColorChip";
import { TREATMENT_LABEL_KEYS, TREATMENT_SOURCE_LABEL_KEYS, groupLinesByTreatment } from "../taxDisplay";

const STATUS_COLOR: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
  Draft: "default", Sent: "primary", Revised: "warning",
  Accepted: "success", Rejected: "error", Expired: "error", Converted: "success",
};

export default function QuotationViewPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const perms = usePermission("crm.quotations");
  const localizationProfile = useLocalizationProfile();
  const { formatDate, formatDateTime } = createFormatters(localizationProfile);

  const [quotation, setQuotation] = useState<QuotationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [lostReason, setLostReason] = useState("");

  const [followups, setFollowups] = useState<FollowupListItem[]>([]);
  const [followupsLoading, setFollowupsLoading] = useState(false);

  // Per-line expand/collapse — taxable value, resolved treatment, and the
  // itemized tax_breakdown stay out of the compact row (section 10) and
  // only show once a line is expanded.
  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set());
  function toggleLineExpanded(uuid: string) {
    setExpandedLines((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
  }

  const load = async () => {
    if (!uuid) return;
    setLoading(true);
    try {
      const data = await getQuotationByUuid(uuid);
      setQuotation(data);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const loadFollowups = async () => {
    if (!uuid) return;
    setFollowupsLoading(true);
    try {
      const res = await getFollowups({
        quotation_uuid: uuid,
        page_size: 50,
        sort_by: "followup_datetime",
        sort_order: "desc",
      });
      setFollowups(res.data);
    } catch {
      // Non-critical panel — a failed fetch just leaves it empty rather
      // than blocking the rest of the quotation page.
    } finally {
      setFollowupsLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadFollowups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  async function handleRevise() {
    if (!uuid) return;
    setActionLoading(true);
    try {
      const revised = await reviseQuotation(uuid);
      showSnackbar({ message: t("quotation.revisedSuccess"), severity: "success" });
      navigate(`/app/crm/quotations/${revised.uuid}`);
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAccept() {
    if (!uuid) return;
    setActionLoading(true);
    try {
      await acceptQuotation(uuid);
      showSnackbar({ message: t("quotation.acceptedSuccess"), severity: "success" });
      load();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!uuid) return;
    setActionLoading(true);
    try {
      await rejectQuotation(uuid, lostReason);
      showSnackbar({ message: t("quotation.rejectedSuccess"), severity: "success" });
      setRejectOpen(false);
      load();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConvert() {
    if (!uuid) return;
    setActionLoading(true);
    try {
      const booking = await convertQuotationToBooking(uuid);
      showSnackbar({ message: t("quotation.convertedSuccess"), severity: "success" });
      navigate(`/app/bookings/list/${booking.uuid}`);
    } catch (err: any) {
      showSnackbar({
        message: getErrorMessage(err, t("quotation.convertNotAvailable")),
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading || !quotation) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {quotation.quotation_no} {quotation.revision_no > 1 && `(Rev ${quotation.revision_no})`}
      </Typography>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/app/dashboard" underline="hover">
          {t("menu.dashboard")}
        </Link>
        <Link component={RouterLink} to="/app/crm/quotations" underline="hover">
          {t("menu.crm.quotations")}
        </Link>
        <Typography color="text.primary">{quotation.quotation_no}</Typography>
      </Breadcrumbs>

      <QuotationVersionSwitcher currentUuid={quotation.uuid} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Chip color={STATUS_COLOR[quotation.status] ?? "default"} label={quotation.status} />
              {quotation.is_locked && <Chip variant="outlined" label={t("quotation.locked")} />}
            </Stack>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">{t("common.customer")}</Typography><Typography>{quotation.customer_name}</Typography></Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">{t("quotation.enquiry")}</Typography>
                {quotation.enquiry_uuid ? (
                  <Link component={RouterLink} to={`/app/enquiries/${quotation.enquiry_uuid}`} underline="hover">
                    {quotation.enquiry_no}
                  </Link>
                ) : (
                  <Typography>{quotation.enquiry_no ?? "-"}</Typography>
                )}
              </Grid>
              <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">{t("quotation.businessType")}</Typography><Typography>{quotation.business_type}</Typography></Grid>
              {quotation.business_type === "Package" && (
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">{t("quotation.package")}</Typography>
                  <Typography>
                    {quotation.package_snapshot?.pkg_name ?? "-"}
                    {quotation.package_snapshot?.duration_days
                      ? ` (${quotation.package_snapshot.duration_days}D/${quotation.package_snapshot.duration_nights}N)`
                      : ""}
                  </Typography>
                </Grid>
              )}
              <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">{t("quotation.quotationDate")}</Typography><Typography>{formatDate(quotation.quotation_date!)}</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">{t("quotation.validUntil")}</Typography><Typography>{quotation.valid_until ? formatDate(quotation.valid_until) : "-"}</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">{t("quotation.travelDateFrom")}</Typography><Typography>{quotation.travel_date_from ? formatDate(quotation.travel_date_from) : "-"}</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">{t("quotation.travelDateTo")}</Typography><Typography>{quotation.travel_date_to ? formatDate(quotation.travel_date_to) : "-"}</Typography></Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">{t("quotation.summaryPax")}</Typography>
                <Typography>
                  {quotation.pax_adult} {t("quotation.paxAdult")}
                  {quotation.pax_child ? `, ${quotation.pax_child} ${t("quotation.paxChild")}` : ""}
                  {quotation.pax_infant ? `, ${quotation.pax_infant} ${t("quotation.paxInfant")}` : ""}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">{t("quotation.currencyCode")}</Typography><Typography>{quotation.currency_code}</Typography></Grid>
            </Grid>
          </Paper>

          {/* Package quotations flatten Occupancy Pricing into ordinary
              service lines server-side so they price/tax correctly (see
              _build_flat_package_pricing_lines on the backend) — the GET
              response splits them back out into occupancy_groups (see
              get_quotation_detail) so this view doesn't have to guess which
              service_lines rows are really occupancy data. */}
          {!!quotation.occupancy_groups?.length && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" color="primary" mb={2}>{t("quotation.occupancyGroups")}</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("packagePricing.occupancyType")}</TableCell>
                      <TableCell>{t("packagePricing.passengerType")}</TableCell>
                      <TableCell align="right">{t("quotation.quantity")}</TableCell>
                      <TableCell align="right">{t("quotation.sellingPrice")}</TableCell>
                      <TableCell align="right">{t("quotation.discountPercent")}</TableCell>
                      <TableCell align="right">{t("quotation.discountAmount")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quotation.occupancy_groups.map((group, index) => (
                      <TableRow key={index}>
                        <TableCell>{group.occupancy_type}</TableCell>
                        <TableCell>{group.passenger_type}</TableCell>
                        <TableCell align="right">{group.quantity}</TableCell>
                        <TableCell align="right">{(group.selling_price ?? 0).toFixed(2)}</TableCell>
                        <TableCell align="right">{(group.discount_percent ?? 0) > 0 ? `${(group.discount_percent ?? 0).toFixed(2)}%` : "-"}</TableCell>
                        <TableCell align="right">{(group.discount_amount ?? 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {!!quotation.service_lines?.length && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" color="primary" mb={2}>{t("quotation.serviceLines")}</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 40 }} />
                      <TableCell>{t("quotation.serviceType")}</TableCell>
                      <TableCell>{t("quotation.description")}</TableCell>
                      <TableCell sx={{ width: 44 }} />
                      <TableCell align="right">{t("quotation.quantity")}</TableCell>
                      <TableCell align="right">{t("quotation.sellingPrice")}</TableCell>
                      <TableCell align="right">{t("quotation.discountPercent")}</TableCell>
                      <TableCell align="right">{t("quotation.discountAmount")}</TableCell>
                      <TableCell align="right">{t("quotation.tax")}</TableCell>
                      <TableCell align="right">{t("quotation.netAmount")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quotation.service_lines.map((line) => {
                      const isExpanded = expandedLines.has(line.uuid);
                      const treatment = line.tax_context?.resolved_treatment;
                      const treatmentLabel = treatment
                        ? t(TREATMENT_LABEL_KEYS[treatment] ?? "", { defaultValue: treatment })
                        : undefined;
                      // Layer 3B, Task 16 — "master" | "localization_profile"
                      // | "manual", absent for the unconditional-always-
                      // standard service types (see taxDisplay.ts) — never
                      // guessed when absent.
                      const treatmentSource = line.tax_context?.resolved_treatment_source;
                      const treatmentSourceLabel = treatmentSource
                        ? t(TREATMENT_SOURCE_LABEL_KEYS[treatmentSource] ?? "", { defaultValue: treatmentSource })
                        : undefined;
                      const taxTooltip = [
                        `${t("quotation.tax")}: ${(line.tax_percent ?? 0).toFixed(2)}%`,
                        treatmentLabel ? `${t("quotation.treatment")}: ${treatmentLabel}` : null,
                      ].filter(Boolean).join(" · ");

                      return (
                        <Fragment key={line.uuid}>
                          <TableRow hover sx={{ cursor: "pointer" }} onClick={() => toggleLineExpanded(line.uuid)}>
                            <TableCell>
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleLineExpanded(line.uuid); }}>
                                {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                              </IconButton>
                            </TableCell>
                            <TableCell>{line.service_type}</TableCell>
                            <TableCell>{line.description}</TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              {line.line_source && (
                                <Tooltip
                                  title={line.line_source === "MASTER_DRIVEN" ? t("quotation.lineLinkedToMaster") : t("quotation.lineManualEntry")}
                                  arrow
                                >
                                  {line.line_source === "MASTER_DRIVEN"
                                    ? <LinkIcon fontSize="small" color="primary" />
                                    : <EditNoteIcon fontSize="small" color="disabled" />}
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell align="right">{line.quantity}</TableCell>
                            <TableCell align="right">{line.selling_price.toFixed(2)}</TableCell>
                            <TableCell align="right">{(line.discount_percent ?? 0) > 0 ? `${(line.discount_percent ?? 0).toFixed(2)}%` : "-"}</TableCell>
                            <TableCell align="right">{(line.discount_amount ?? 0).toFixed(2)}</TableCell>
                            <TableCell align="right">
                              <Tooltip title={taxTooltip} arrow placement="top">
                                <span>{line.tax_amount.toFixed(2)}</span>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="right">{line.net_amount.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={10} sx={{ py: 0, borderBottom: isExpanded ? undefined : "none" }}>
                              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Box sx={{ py: 1.5, px: 2, bgcolor: "action.hover", borderRadius: 1, my: 1 }}>
                                  <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                      <Typography variant="caption" color="text.secondary">{t("quotation.taxableValue")}</Typography>
                                      <Typography variant="body2">{quotation.currency_code} {line.taxable_amount.toFixed(2)}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                      <Typography variant="caption" color="text.secondary">{t("quotation.margin")}</Typography>
                                      <Typography variant="body2">{quotation.currency_code} {line.margin_amount.toFixed(2)}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                      <Typography variant="caption" color="text.secondary">{t("quotation.treatment")}</Typography>
                                      <Typography variant="body2">{treatmentLabel ?? "-"}</Typography>
                                      {treatmentSourceLabel && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          {t("quotation.adHocSourceLabel")}: {treatmentSourceLabel}
                                        </Typography>
                                      )}
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                      <Typography variant="caption" color="text.secondary">{t("quotation.placeOfSupply")}</Typography>
                                      <Typography variant="body2">{line.tax_context?.resolved_place_of_supply ?? "-"}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                      <Typography variant="caption" color="text.secondary">{t("quotation.taxCode")}</Typography>
                                      <Typography variant="body2">{line.tax_context?.resolved_tax_code ?? "-"}</Typography>
                                    </Grid>
                                    {line.disbursement_candidate && (
                                      <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="caption" color="text.secondary">{t("quotation.disbursementSectionTitle")}</Typography>
                                        <Typography variant="body2">
                                          {line.tax_context?.disbursement_test_result === "passed"
                                            ? t("quotation.disbursementResultPassed")
                                            : t("quotation.disbursementResultFailed")}
                                        </Typography>
                                      </Grid>
                                    )}
                                    {!!line.tax_breakdown?.length && (
                                      <Grid size={{ xs: 12 }}>
                                        <Typography variant="caption" color="text.secondary">{t("quotation.taxBreakdown")}</Typography>
                                        <Table size="small" sx={{ mt: 0.5, maxWidth: 360 }}>
                                          <TableBody>
                                            {line.tax_breakdown.map((component, idx) => (
                                              <TableRow key={idx}>
                                                <TableCell sx={{ border: 0, py: 0.25, pl: 0 }}>{component.tax_name}</TableCell>
                                                <TableCell sx={{ border: 0, py: 0.25 }} align="right">{component.tax_percent}%</TableCell>
                                                <TableCell sx={{ border: 0, py: 0.25 }} align="right">
                                                  {quotation.currency_code} {component.tax_amount.toFixed(2)}
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </Grid>
                                    )}
                                  </Grid>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" color="primary" mb={2}>{t("common.summary")}</Typography>
            <Stack spacing={0.5}>
              {/* Grouping subtotals — flexible, derived from whichever
                  distinct resolved treatments are actually present on this
                  quotation (section 10), never hardcoded to exactly two
                  categories. */}
              {groupLinesByTreatment(quotation.service_lines ?? []).map(({ treatment, taxableTotal }) => (
                <Stack key={treatment} direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    {t(TREATMENT_LABEL_KEYS[treatment] ?? "", { defaultValue: treatment })}
                  </Typography>
                  <Typography variant="body2">{quotation.currency_code} {taxableTotal.toFixed(2)}</Typography>
                </Stack>
              ))}

              <Divider sx={{ my: 0.5 }} />

              {quotation.cgst_total > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">{t("quotation.cgstTotal")}</Typography>
                  <Typography variant="body2">{quotation.currency_code} {quotation.cgst_total.toFixed(2)}</Typography>
                </Stack>
              )}
              {quotation.sgst_total > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">{t("quotation.sgstTotal")}</Typography>
                  <Typography variant="body2">{quotation.currency_code} {quotation.sgst_total.toFixed(2)}</Typography>
                </Stack>
              )}
              {quotation.igst_total > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">{t("quotation.igstTotal")}</Typography>
                  <Typography variant="body2">{quotation.currency_code} {quotation.igst_total.toFixed(2)}</Typography>
                </Stack>
              )}
              {quotation.other_tax_total > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">{t("quotation.otherTaxTotal")}</Typography>
                  <Typography variant="body2">{quotation.currency_code} {quotation.other_tax_total.toFixed(2)}</Typography>
                </Stack>
              )}

              <Divider sx={{ my: 0.5 }} />

              {(quotation.discount_amount ?? 0) > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">{t("quotation.discountAmount")}</Typography>
                  <Typography variant="body2">{quotation.currency_code} {(quotation.discount_amount ?? 0).toFixed(2)}</Typography>
                </Stack>
              )}
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">{t("quotation.gross")}</Typography>
                <Typography variant="body2">{quotation.currency_code} {quotation.gross_amount.toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">{t("quotation.margin")}</Typography>
                <Typography variant="body2">{quotation.currency_code} {quotation.total_margin_amount.toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" fontWeight={600}>{t("quotation.totalTax")}</Typography>
                <Typography variant="body2" fontWeight={600}>{quotation.currency_code} {quotation.tax_amount.toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">{t("quotation.total")}</Typography>
                <Typography variant="h6">{quotation.currency_code} {quotation.net_amount.toFixed(2)}</Typography>
              </Stack>

              {/* TCS — a separate, non-GST statutory track (section 7).
                  Never merged into the CGST/SGST/IGST breakdown above;
                  distinctly labeled so it's never mistaken for a GST
                  component. Review-only candidate value (Layer 3) — not an
                  automatic charge, so it's shown, not folded into Total. */}
              {quotation.tcs_applicable && (
                <>
                  <Divider sx={{ my: 0.5 }} />
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ p: 1, borderRadius: 1, bgcolor: "warning.50", border: "1px dashed", borderColor: "warning.main" }}
                  >
                    <Typography variant="body2" fontWeight={600} color="warning.dark">
                      {t("quotation.tcsLabel")} {quotation.tcs_rate_percent != null ? `@ ${quotation.tcs_rate_percent}%` : ""}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="warning.dark">
                      {quotation.currency_code} {(quotation.tcs_amount ?? 0).toFixed(2)}
                    </Typography>
                  </Stack>
                </>
              )}
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              {perms.can_edit && quotation.status === "Draft" && quotation.is_current_version && (
                <Button variant="outlined" onClick={() => navigate(`/app/crm/quotations/${quotation.uuid}/edit`)}>{t("common.edit")}</Button>
              )}
              {perms.can_edit && quotation.is_current_version && !["Converted", "Rejected", "Expired"].includes(quotation.status) && (
                <Button variant="outlined" disabled={actionLoading} onClick={handleRevise}>{t("quotation.revise")}</Button>
              )}
              {perms.can_edit && quotation.is_current_version && !["Accepted", "Converted"].includes(quotation.status) && (
                <Button variant="contained" color="success" disabled={actionLoading} onClick={handleAccept}>{t("quotation.accept")}</Button>
              )}
              {perms.can_edit && quotation.is_current_version && quotation.status !== "Rejected" && (
                <Button variant="outlined" color="error" disabled={actionLoading} onClick={() => setRejectOpen(true)}>{t("quotation.reject")}</Button>
              )}
              {perms.can_edit && quotation.status === "Accepted" && (
                <Button variant="contained" disabled={actionLoading} onClick={handleConvert}>{t("quotation.convertToBooking")}</Button>
              )}
              {perms.can_export && (
                <Button variant="outlined" href={quotationPdfDownloadUrl(quotation.uuid)} target="_blank" rel="noopener noreferrer">
                  {t("quotation.downloadPdf")}
                </Button>
              )}
              {perms.can_create && (
                <Button
                  variant="outlined"
                  onClick={() =>
                    navigate(
                      `/app/crm/followups/create?enquiry_uuid=${quotation.enquiry_uuid}&quotation_uuid=${quotation.uuid}`,
                    )
                  }
                >
                  {t("quotation.addFollowup")}
                </Button>
              )}
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" color="primary" mb={1}>{t("quotation.followups")}</Typography>
            {followupsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}><CircularProgress size={24} /></Box>
            ) : followups.length === 0 ? (
              <Typography variant="body2" color="text.secondary">{t("quotation.noFollowupsYet")}</Typography>
            ) : (
              <Stack spacing={1.5} divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />}>
                {followups.map((f) => (
                  <Box
                    key={f.uuid}
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/app/crm/followups/${f.uuid}`)}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={600}>{f.followup_type}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(f.followup_datetime)}
                        </Typography>
                      </Stack>
                      <DropdownColorChip dropdownName="followup_status" value={f.status} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" noWrap title={f.discussion_notes}>
                      {f.discussion_notes}
                    </Typography>
                    {f.next_followup_datetime && (
                      <Typography variant="caption" color="text.secondary">
                        {t("followup.contextNextFollowup")}: {formatDateTime(f.next_followup_datetime)}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" color="primary" mb={1}>{t("common.attachments")}</Typography>
            <AttachmentList entityType="quotation" entityUuid={quotation.uuid} menuKey="crm.quotations" canEdit={perms.can_edit} />
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" color="primary" mb={1}>{t("communicationHistory.title", { defaultValue: "Communication History" })}</Typography>
            <CommunicationHistory entityType="quotation" entityUuid={quotation.uuid} />
          </Paper>
        </Grid>

        {perms.can_export && (
          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper sx={{ p: 2 }}>
              <DocumentPreviewPanel
                values={quotation.uuid}
                fetchPreview={() => previewQuotationPdf(quotation.uuid)}
              />
            </Paper>
          </Grid>
        )}
      </Grid>

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("quotation.reject")}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth multiline minRows={2} sx={{ mt: 1 }}
            label={t("quotation.lostReason")}
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>{t("common.cancel")}</Button>
          <Button color="error" variant="contained" disabled={actionLoading} onClick={handleReject}>{t("quotation.reject")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// src/features/crm/followup/pages/FollowupViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Button, Divider, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getFollowupByUuid } from "../followup.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import FormPageLayout from "../../../../components/forms/FormPageLayout";
import DropdownColorChip from "../../../../components/common/DropdownColorChip";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { formatDateTime } from "../../../../utils/formatters/localization";

import type { FollowupDetail } from "../followup.types";

export default function FollowupViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("crm.followups");
  const localizationProfile = useLocalizationProfile();

  const [loading, setLoading] = useState(true);
  const [followup, setFollowup] = useState<FollowupDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadFollowup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadFollowup() {
    try {
      const data = await getFollowupByUuid(uuid!, isTrash);
      setFollowup(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/crm/followups");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!followup) {
    return null;
  }

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.crm.followups"), href: "/app/crm/followups" },
        { label: t("common.view") },
      ]}
    >
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
          {t("followup.title")}
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("followup.enquiry")}</Typography>
            <Typography mt={0.5}>{followup.enquiry_no}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("followup.contextCustomer")}</Typography>
            <Typography mt={0.5}>
              {followup.customer_name} {followup.customer_mobile ? `(${followup.customer_mobile})` : ""}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("followup.assignedUser")}</Typography>
            <Typography mt={0.5}>{followup.assigned_user_name || "-"}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("followup.type")}</Typography>
            <Typography mt={0.5}>{followup.followup_type}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("followup.status")}</Typography>
            <Typography mt={0.5} component="div">
              <DropdownColorChip dropdownName="followup_status" value={followup.status} />
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("followup.priority")}</Typography>
            <Typography mt={0.5} component="div">
              <DropdownColorChip dropdownName="followup_priority" value={followup.priority} />
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("followup.followupDatetime")}</Typography>
            <Typography mt={0.5}>{formatDateTime(followup.followup_datetime, localizationProfile)}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("followup.nextFollowupDatetime")}</Typography>
            <Typography mt={0.5}>
              {followup.next_followup_datetime
                ? formatDateTime(followup.next_followup_datetime, localizationProfile)
                : "-"}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("followup.outcome")}</Typography>
            <Typography mt={0.5}>{followup.outcome || "-"}</Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="caption">{t("followup.discussionNotes")}</Typography>
            <Typography mt={0.5} whiteSpace="pre-wrap">
              {followup.discussion_notes}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button variant="outlined" onClick={() => navigate("/app/crm/followups")} size="large">
          {t("common.back")}
        </Button>

        <Box display="flex" gap={2}>
          {perms.can_edit && !isTrash && (
            <Button variant="contained" size="large" onClick={() => navigate(`/app/crm/followups/${uuid}/edit`)}>
              {t("common.edit")}
            </Button>
          )}
        </Box>
      </Box>
    </FormPageLayout>
  );
}

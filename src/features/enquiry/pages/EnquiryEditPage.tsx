// src/features/enquiry/pages/EnquiryEditPage.tsx

import { useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Typography,
} from "@mui/material";

import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import EnquiryForm from "../components/EnquiryForm";

import type { EnquiryFormInput } from "../enquiry.types";

import {
  getEnquiryByUuid,
  updateEnquiryByUuid,
} from "../enquiry.api";

import { usePermission } from "../../../hooks/usePermission";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";

export default function EnquiryEditPage() {
  const { uuid } = useParams();

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission('crm.enquiries');

  const [loading, setLoading] = useState(true);

  const [defaultValues, setDefaultValues] =
    useState<EnquiryFormInput>();

  const [versionNo, setVersionNo] = useState<number>();

  useEffect(() => {
    loadEnquiry();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadEnquiry() {
    try {
      const data = await getEnquiryByUuid(uuid!)

      setDefaultValues(data);
      setVersionNo(data.version_no);
    } catch {
      showSnackbar({
        message: t("common.loadFailed"),
        severity: "error",
      });

      navigate("/app/enquiries");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: EnquiryFormInput) {
    try {
      await updateEnquiryByUuid(uuid!, { ...data, version_no: versionNo! });

      showSnackbar({
        message: t("common.updatedSuccess"),
        severity: "success",
      });

      navigate("/app/enquiries");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        showSnackbar({
          message:
            err?.response?.data?.detail ??
            t("common.updateConflict"),
          severity: "error",
        });
        return;
      }

      showSnackbar({
        message:
          err?.response?.data?.detail ??
          t("common.updateFailed"),
        severity: "error",
      });
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h6" fontWeight={700}>
        {t("common.edit")}
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component={RouterLink}
          to="/app/dashboard"
          underline="hover"
        >
          {t("menu.dashboard")}
        </Link>

        <Link
          component={RouterLink}
          to="/app/enquiries"
          underline="hover"
        >
          {t('menu.crm.enquiries')}
        </Link>

        <Typography>{t("common.edit")}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        <EnquiryForm
          defaultValues={defaultValues}
          onSubmit={handleUpdate}
        />
      </Paper>
    </Box>
  );
}
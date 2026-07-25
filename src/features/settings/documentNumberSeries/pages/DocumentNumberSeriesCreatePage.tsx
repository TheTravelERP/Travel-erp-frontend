// src/features/settings/documentNumberSeries/pages/DocumentNumberSeriesCreatePage.tsx
import { Box, Breadcrumbs, Link, Paper, Typography } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";

import DocumentNumberSeriesForm from "../components/DocumentNumberSeriesForm";
import type { DocumentNumberSeriesFormInput } from "../documentNumberSeries.types";
import { createDocumentNumberSeries } from "../documentNumberSeries.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

export default function DocumentNumberSeriesCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.doc_numbering");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: DocumentNumberSeriesFormInput) {
    try {
      await createDocumentNumberSeries(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/settings/doc-numbering");
    } catch (err: any) {
      showSnackbar({
        message: getErrorMessage(err, t("common.createFailed")),
        severity: "error",
      });
    }
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h6" fontWeight={700}>
        {t("common.create")}
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/app/dashboard" underline="hover">
          {t("menu.dashboard")}
        </Link>
        <Link component={RouterLink} to="/app/settings/doc-numbering" underline="hover">
          {t("menu.settings.doc_numbering")}
        </Link>
        <Typography color="text.primary">{t("common.create")}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <DocumentNumberSeriesForm onSubmit={handleCreate} />
      </Paper>
    </Box>
  );
}

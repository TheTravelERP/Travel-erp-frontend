// src/features/departure/pages/DepartureEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import DepartureForm from "../components/DepartureForm";
import type { DepartureFormInput } from "../departure.types";
import { getDepartureByUuid, updateDepartureByUuid } from "../departure.api";
import { usePermission } from "../../../hooks/usePermission";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../utils/errorMessage";
import FormPageLayout from "../../../components/forms/FormPageLayout";

export default function DepartureEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("packages.departures");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<DepartureFormInput>();
  const [departureCode, setDepartureCode] = useState<string>();
  const [versionNo, setVersionNo] = useState<number>();

  useEffect(() => {
    loadDeparture();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadDeparture() {
    try {
      const data = await getDepartureByUuid(uuid!);
      setDefaultValues(data);
      setDepartureCode(data.departure_code);
      setVersionNo(data.version_no);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/packages/departures");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: DepartureFormInput) {
    try {
      await updateDepartureByUuid(uuid!, { ...data, version_no: versionNo! });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/packages/departures");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        showSnackbar({
          message: getErrorMessage(err, t("common.updateConflict")),
          severity: "error",
        });
        return;
      }

      showSnackbar({
        message: getErrorMessage(err, t("common.updateFailed")),
        severity: "error",
      });
    }
  }

  return (
    <FormPageLayout
      title={t("common.edit")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.packages.departures"), href: "/app/packages/departures" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !defaultValues ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DepartureForm defaultValues={defaultValues} departureCode={departureCode} onSubmit={handleUpdate} />
      )}
    </FormPageLayout>
  );
}

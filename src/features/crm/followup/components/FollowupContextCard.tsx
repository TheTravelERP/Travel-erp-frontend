// src/features/crm/followup/components/FollowupContextCard.tsx

import { Paper, Grid, Typography, Stack, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import DropdownColorChip from "../../../../components/common/DropdownColorChip";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { formatDate } from "../../../../utils/formatters/localization";
import type { EnquiryDetail } from "../../../enquiry/enquiry.types";

interface FollowupContextCardProps {
  enquiry: EnquiryDetail | null;
  loading?: boolean;
}

export default function FollowupContextCard({ enquiry, loading }: FollowupContextCardProps) {
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();

  if (loading) {
    return <Skeleton variant="rounded" height={88} sx={{ mb: 2 }} />;
  }

  if (!enquiry) {
    return null;
  }

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: t("followup.contextEnquiryNo"), value: enquiry.enquiry_no },
    { label: t("followup.contextCustomer"), value: enquiry.customer_name || "-" },
    { label: t("followup.contextPrimaryService"), value: enquiry.package_name || "-" },
    { label: t("followup.contextAssignedTo"), value: enquiry.agent_name || "-" },
    {
      label: t("followup.contextStatus"),
      value: <DropdownColorChip dropdownName="enquiry_status" value={enquiry.conversion_status} />,
    },
    {
      label: t("followup.contextNextFollowup"),
      value: enquiry.followup_date ? formatDate(enquiry.followup_date, localizationProfile) : "-",
    },
    {
      label: t("followup.contextPriority"),
      value: <DropdownColorChip dropdownName="enquiry_priority" value={enquiry.enquiry_priority} />,
    },
  ];

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: "action.hover" }}
    >
      <Grid container spacing={2}>
        {fields.map((f) => (
          <Grid key={f.label} size={{ xs: 6, sm: 4, md: "auto" }}>
            <Stack spacing={0.25}>
              <Typography variant="caption" color="text.secondary">
                {f.label}
              </Typography>
              <Typography variant="body2" fontWeight={600} component="div">
                {f.value}
              </Typography>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

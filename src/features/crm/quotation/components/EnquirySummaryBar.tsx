// src/features/crm/quotation/components/EnquirySummaryBar.tsx
//
// Read-only "here's what you're quoting" context strip, shown above the
// Quotation form once both Customer and Package links are resolved. Not
// part of the form itself.
//
// Deliberately omits Customer/Package/Business Type — those are already
// shown as read-only inputs in the form below (Sales Context / Customer
// Master / Package Master), so repeating them here was pure duplication.
// What's left is enquiry-only context that doesn't otherwise appear on the
// form: identity + status up top, the remaining detail fields below.

import { Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import DropdownColorChip from "../../../../components/common/DropdownColorChip";
import EntityContextBar from "../../../../components/common/EntityContextBar";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { formatDate } from "../../../../utils/formatters/localization";
import type { EnquiryDetail } from "../../../enquiry/enquiry.types";

interface EnquirySummaryBarProps {
  enquiry: EnquiryDetail | null;
  loading?: boolean;
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Typography variant="body2" color="text.secondary" component="div">
      {label}: <Typography component="span" variant="body2" fontWeight={600} color="text.primary">{value}</Typography>
    </Typography>
  );
}

export default function EnquirySummaryBar({ enquiry, loading }: EnquirySummaryBarProps) {
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();

  if (loading) return <EntityContextBar loading />;
  if (!enquiry) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: "action.hover" }}>
      <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" useFlexGap rowGap={1}>
        <Typography variant="subtitle1" fontWeight={700}>{enquiry.enquiry_no}</Typography>
        <DropdownColorChip dropdownName="enquiry_status" value={enquiry.conversion_status} />
        <DetailItem
          label={t("common.createdOn")}
          value={enquiry.created_at ? formatDate(enquiry.created_at, localizationProfile) : "-"}
        />
        <DetailItem label={t("common.source")} value={enquiry.lead_source || "-"} />
        <DetailItem
          label={t("common.priority")}
          value={<DropdownColorChip dropdownName="enquiry_priority" value={enquiry.enquiry_priority} />}
        />
        <DetailItem label={t("quotation.summaryPax")} value={enquiry.pax_count ?? "-"} />
        <DetailItem label={t("quotation.summaryAssignedTo")} value={enquiry.agent_name || "-"} />
      </Stack>
    </Paper>
  );
}

// src/features/crm/quotation/components/EnquirySummaryBar.tsx
//
// Read-only "here's what you're quoting" context strip, shown above the
// Quotation form once both Customer and Package links are resolved. Not
// part of the form itself — mirrors FollowupContextCard.tsx's pattern of
// building a fields array and handing it to the shared EntityContextBar.
//
// Note: Enquiry has no travel-date field and only a single total pax_count
// (no adult/child/infant breakdown — that split only exists on the
// Quotation being created) — both rows are intentionally omitted rather
// than fabricated.

import { useTranslation } from "react-i18next";
import EntityContextBar, { type EntityContextField } from "../../../../components/common/EntityContextBar";
import DropdownColorChip from "../../../../components/common/DropdownColorChip";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { formatDate } from "../../../../utils/formatters/localization";
import type { EnquiryDetail } from "../../../enquiry/enquiry.types";

interface EnquirySummaryBarProps {
  enquiry: EnquiryDetail | null;
  loading?: boolean;
  /** The Quotation's own (live-editable) Business Type — takes priority
   * over enquiry.business_type, which only reflects the enquiry's original
   * value and goes stale the moment the user changes Business Type on the
   * quotation itself (most visibly on a Direct Quotation, whose
   * auto-created bookkeeping enquiry never gets its business_type updated
   * at all). Falls back to the enquiry's value only if not supplied. */
  businessType?: string;
}

export default function EnquirySummaryBar({ enquiry, loading, businessType }: EnquirySummaryBarProps) {
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();

  if (loading) return <EntityContextBar loading />;
  if (!enquiry) return null;

  const displayBusinessType = businessType ?? enquiry.business_type;

  const fields: EntityContextField[] = [
    { label: t("quotation.summaryEnquiryNo"), value: enquiry.enquiry_no },
    {
      label: t("common.createdOn"),
      value: enquiry.created_at ? formatDate(enquiry.created_at, localizationProfile) : "-",
    },
    { label: t("common.customer"), value: enquiry.customer_name || "-" },
    { label: t("quotation.businessType"), value: displayBusinessType },
    ...(displayBusinessType === "Package"
      ? [{ label: t("quotation.package"), value: enquiry.package_name || "-" }]
      : []),
    { label: t("quotation.summaryPax"), value: enquiry.pax_count ?? "-" },
    { label: t("quotation.summaryAssignedTo"), value: enquiry.agent_name || "-" },
    {
      label: t("common.status"),
      value: <DropdownColorChip dropdownName="enquiry_status" value={enquiry.conversion_status} />,
    },
    { label: t("common.source"), value: enquiry.lead_source || "-" },
    {
      label: t("common.priority"),
      value: <DropdownColorChip dropdownName="enquiry_priority" value={enquiry.enquiry_priority} />,
    },
  ];

  return <EntityContextBar fields={fields} />;
}

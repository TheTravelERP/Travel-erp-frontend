// src/features/crm/quotation/components/resolveLinks/ResolveEnquiryLinksCard.tsx
//
// "Quotation Readiness" checklist — guides the user through what's still
// needed instead of warning them. Shows one chip per applicable item (a
// Package chip only appears when Business Type is Package) plus a
// lightweight "X of Y completed" progress line, then the matching
// Customer/Package cards below.

import { Chip, Grid, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslation } from "react-i18next";

import FormSection from "../../../../../components/forms/FormSection";
import ResolveCustomerLink from "./ResolveCustomerLink";
import ResolvePackageLink from "./ResolvePackageLink";
import type { EnquiryDetail } from "../../../../enquiry/enquiry.types";

interface ResolveEnquiryLinksCardProps {
  enquiry: EnquiryDetail;
  onEnquiryUpdated: (updated: EnquiryDetail) => void;
  /** Driven by the Quotation form's own (live-editable) Business Type field,
   * not enquiry.business_type — the user can change Business Type on the
   * quotation itself, and the Package requirement must track that edit
   * immediately, not the enquiry's original stored value. */
  isPackageBusiness: boolean;
  disabled?: boolean;
}

export default function ResolveEnquiryLinksCard({
  enquiry,
  onEnquiryUpdated,
  isPackageBusiness,
  disabled,
}: ResolveEnquiryLinksCardProps) {
  const { t } = useTranslation();

  const customerResolved = !!enquiry.cust_uuid;
  const packageResolved = !!enquiry.pkg_uuid;

  const totalItems = isPackageBusiness ? 2 : 1;
  const doneItems = (customerResolved ? 1 : 0) + (isPackageBusiness && packageResolved ? 1 : 0);

  return (
    <FormSection title={t("quotation.readinessTitle")}>
      <Grid size={{ xs: 12 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap mb={1}>
          <Chip
            size="small"
            icon={customerResolved ? <CheckCircleIcon /> : <WarningAmberIcon />}
            label={
              customerResolved
                ? t("quotation.readinessCustomerLinked")
                : t("quotation.readinessCustomerPending")
            }
            color={customerResolved ? "success" : "warning"}
            variant={customerResolved ? "filled" : "outlined"}
          />
          {isPackageBusiness && (
            <Chip
              size="small"
              icon={packageResolved ? <CheckCircleIcon /> : <WarningAmberIcon />}
              label={
                packageResolved
                  ? t("quotation.readinessPackageLinked")
                  : t("quotation.readinessPackagePending")
              }
              color={packageResolved ? "success" : "warning"}
              variant={packageResolved ? "filled" : "outlined"}
            />
          )}
          <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
            {t("quotation.readinessProgress", { done: doneItems, total: totalItems })}
          </Typography>
        </Stack>
      </Grid>

      <ResolveCustomerLink enquiry={enquiry} onResolved={onEnquiryUpdated} disabled={disabled} />
      {isPackageBusiness && (
        <ResolvePackageLink enquiry={enquiry} onResolved={onEnquiryUpdated} disabled={disabled} />
      )}
    </FormSection>
  );
}

// src/components/detail/DetailPageLayout.tsx
//
// Shared shell for every 360° detail view (Enquiry/Quotation/Customer/
// Booking) — wraps FormPageLayout (title + breadcrumbs + outer Paper) and
// adds the standard detail-page footer: a Divider, a "Back" button on the
// left, and a caller-supplied row of action buttons on the right. Extracted
// from the identical <Divider/><Box display="flex" justifyContent=
// "space-between">...</Box> footer previously hand-rolled at the bottom of
// EnquiryViewPage.tsx — new/refactored 360° views should compose their
// content as a stack of <DetailSection> children inside this, rather than
// re-hand-rolling the footer.

import type { ReactNode } from "react";
import { Box, Button, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import FormPageLayout, { type FormBreadcrumb } from "../forms/FormPageLayout";

interface DetailPageLayoutProps {
  title: string;
  breadcrumbs: FormBreadcrumb[];
  onBack: () => void;
  /** Right-aligned footer action buttons (Edit, Clone, status transitions, etc.) — page-specific, so left entirely to the caller. */
  actions?: ReactNode;
  children: ReactNode;
}

export default function DetailPageLayout({ title, breadcrumbs, onBack, actions, children }: DetailPageLayoutProps) {
  const { t } = useTranslation();

  return (
    <FormPageLayout title={title} breadcrumbs={breadcrumbs}>
      {children}

      <Divider sx={{ my: 3 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Button variant="outlined" size="large" onClick={onBack}>
          {t("common.back")}
        </Button>

        {actions && (
          <Box display="flex" gap={2} flexWrap="wrap">
            {actions}
          </Box>
        )}
      </Box>
    </FormPageLayout>
  );
}

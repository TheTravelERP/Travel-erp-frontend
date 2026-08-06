// src/components/detail/DetailSection.tsx
//
// One "card" of a 360° detail view (Enquiry/Quotation/Customer/Booking) —
// an outlined Paper with a primary-colored h6 title and optional
// right-aligned adornment (e.g. a status Alert + action Button, as on
// Enquiry's Customer Information card). Extracted from the identical
// hand-rolled <Paper variant="outlined" sx={{p:2, mb:2}}> blocks previously
// duplicated across EnquiryViewPage/QuotationViewPage/CustomerViewPage — use
// this instead of re-hand-rolling that pattern in new/refactored 360° views.

import type { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";

interface DetailSectionProps {
  title: string;
  /** DOM id for anchor-scrolling into this section (e.g. "#quotations" deep links). */
  id?: string;
  /** Extra content next to the title — status alerts, quick-action buttons, etc. */
  titleAdornment?: ReactNode;
  children: ReactNode;
}

export default function DetailSection({ title, id, titleAdornment, children }: DetailSectionProps) {
  return (
    <Paper id={id} variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" color="primary">
          {title}
        </Typography>
        {titleAdornment}
      </Box>

      {children}
    </Paper>
  );
}

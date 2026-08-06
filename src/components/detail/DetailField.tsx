// src/components/detail/DetailField.tsx
//
// One read-only "label above value" cell inside a DetailSection's Grid —
// extracted from the identical <Typography variant="caption">{label}
// </Typography><Typography mt={0.5}>{value}</Typography> pairs repeated
// throughout EnquiryViewPage/CustomerViewPage. Caller still owns the
// enclosing <Grid size={{...}}> (column widths vary per field).

import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

interface DetailFieldProps {
  label: string;
  value: ReactNode;
  /** For long free-text values (notes, addresses) that should preserve line breaks. */
  preserveWhitespace?: boolean;
}

export default function DetailField({ label, value, preserveWhitespace }: DetailFieldProps) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography mt={0.5} whiteSpace={preserveWhitespace ? "pre-wrap" : undefined}>
        {value ?? "-"}
      </Typography>
    </Box>
  );
}

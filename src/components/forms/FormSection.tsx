// src/components/forms/FormSection.tsx
import type { ReactNode } from "react";
import { Divider, Grid, Typography } from "@mui/material";

interface FormSectionProps {
  title: string;
  /** Extra content rendered next to the title (e.g. a status Chip). */
  titleAdornment?: ReactNode;
  children: ReactNode;
}

export default function FormSection({ title, titleAdornment, children }: FormSectionProps) {
  return (
    <Grid size={{ xs: 12 }}>
      <Typography
        variant="subtitle2"
        color="primary"
        sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: "10px", fontWeight: 500 }}
      >
        {title}
        {titleAdornment}
        <Divider sx={{ flexGrow: 1 }} />
      </Typography>

      <Grid container spacing={1.5}>
        {children}
      </Grid>
    </Grid>
  );
}

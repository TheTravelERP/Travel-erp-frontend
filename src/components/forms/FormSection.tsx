// src/components/forms/FormSection.tsx
import type { ReactNode } from "react";
import { Grid, Paper, Typography } from "@mui/material";

interface FormSectionProps {
  title: string;
  /** Extra content rendered next to the title (e.g. a status Chip). */
  titleAdornment?: ReactNode;
  children: ReactNode;
}

export default function FormSection({ title, titleAdornment, children }: FormSectionProps) {
  return (
    <Grid size={{ xs: 12 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography
          variant="h6"
          color="primary"
          sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
        >
          {title}
          {titleAdornment}
        </Typography>

        <Grid container spacing={2}>
          {children}
        </Grid>
      </Paper>
    </Grid>
  );
}

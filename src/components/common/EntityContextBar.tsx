// src/components/common/EntityContextBar.tsx
//
// Grey "context header" strip showing a row of label/value pairs — the parent
// record's key identifying details (e.g. Enquiry No. / Customer / Status) shown
// above a related list or detail view. Originally built inline for the Followup
// module's FollowupContextCard/QuotationContextCard; extracted here so any
// module needing the same "here's what you're looking at" strip can reuse it.

import { Paper, Grid, Typography, Stack, Skeleton } from "@mui/material";
import type { ReactNode } from "react";

export interface EntityContextField {
  label: string;
  value: ReactNode;
}

interface EntityContextBarProps {
  fields?: EntityContextField[];
  loading?: boolean;
}

export default function EntityContextBar({ fields = [], loading }: EntityContextBarProps) {
  if (loading) {
    return <Skeleton variant="rounded" height={88} sx={{ mb: 2 }} />;
  }

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

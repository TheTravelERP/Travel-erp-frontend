// src/components/common/DashboardWidgetCard.tsx
//
// Generic dashboard widget wrapper (Phase 4, Feature 8) — the first
// reusable dashboard-widget primitive in this codebase (DashboardPage.tsx
// was previously an empty placeholder). Every Phase 4/5 widget should wrap
// its content in this rather than hand-rolling its own Paper header.
import { Box, Link as MuiLink, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

interface Props {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: React.ReactNode;
}

export default function DashboardWidgetCard({ title, viewAllHref, viewAllLabel, children }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        {viewAllHref && (
          <MuiLink component={RouterLink} to={viewAllHref} variant="body2" underline="hover">
            {viewAllLabel ?? "View All"}
          </MuiLink>
        )}
      </Stack>
      <Box>{children}</Box>
    </Paper>
  );
}

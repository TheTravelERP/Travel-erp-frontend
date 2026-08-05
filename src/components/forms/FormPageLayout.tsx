// src/components/forms/FormPageLayout.tsx
import type { ReactNode } from "react";
import { Box, Breadcrumbs, Link, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export interface FormBreadcrumb {
  label: string;
  href?: string;
}

interface FormPageLayoutProps {
  title: string;
  breadcrumbs: FormBreadcrumb[];
  children: ReactNode;
}

export default function FormPageLayout({ title, breadcrumbs, children }: FormPageLayoutProps) {
  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        {breadcrumbs.map((b, i) =>
          b.href ? (
            <Link key={i} component={RouterLink} to={b.href} underline="hover">
              {b.label}
            </Link>
          ) : (
            <Typography key={i} color="text.primary">
              {b.label}
            </Typography>
          ),
        )}
      </Breadcrumbs>

      <Paper sx={{ p: 2, borderRadius: 2 }}>{children}</Paper>
    </Box>
  );
}

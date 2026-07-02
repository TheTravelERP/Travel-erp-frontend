// src/auth/components/AuthCard.tsx

import React from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  children,
}: AuthCardProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: 520,
          p: 3,
        }}
      >
        <Stack
          spacing={1.5}
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="h5"
            color="primary"
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {subtitle}
          </Typography>
        </Stack>

        {children}
      </Paper>
    </Box>
  );
}
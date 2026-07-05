// src/components/common/Loader.tsx

import { Box, Typography } from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";

interface LoaderProps {
  message?: string;
}

export default function Loader({
  message = "Loading your journey...",
}: LoaderProps) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,

          "@keyframes orbit": {
            from: {
              transform: "rotate(0deg)",
            },
            to: {
              transform: "rotate(360deg)",
            },
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: {
              xs: 140,
              sm: 160,
              md: 180,
            },
            height: {
              xs: 140,
              sm: 160,
              md: 180,
            },
          }}
        >
          {/* Flight Route */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              border: "2px dashed #A5D6A7",
              borderRadius: "50%",
            }}
          />

          {/* Orbit */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              animation: "orbit 2.8s linear infinite",
            }}
          >
            <FlightIcon
              sx={{
                position: "absolute",
                left: "50%",
                top: -18,
                transform: "translateX(-50%) rotate(90deg)",
                color: "#43A047",
                fontSize: {
                  xs: 32,
                  sm: 36,
                  md: 40,
                },
              }}
            />
          </Box>
        </Box>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            textAlign: "center",
            px: 2,
            fontWeight: 500,
          }}
        >
          {message}
        </Typography>
      </Box>
    </Box>
  );
}
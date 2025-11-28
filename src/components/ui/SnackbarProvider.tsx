// src/components/ui/SnackbarProvider.tsx
import React, { createContext, useContext, useState } from "react";
import { Snackbar } from "@mui/material";
import Alert from "@mui/material/Alert";
import type { AlertColor } from "@mui/material/Alert";


type SnackbarPayload = {
  message: string;
  severity?: AlertColor; // "success" | "info" | "warning" | "error"
  duration?: number; // ms
};

type SnackbarContextType = {
  showSnackbar: (p: SnackbarPayload) => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used within SnackbarProvider");
  return ctx;
}

export default function SnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<SnackbarPayload>({
    message: "",
    severity: "info",
    duration: 4000,
  });

  function showSnackbar(p: SnackbarPayload) {
    setPayload({ severity: p.severity ?? "info", duration: p.duration ?? 4000, message: p.message });
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={payload.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleClose} severity={payload.severity} variant="filled" sx={{ width: "100%" }}>
          {payload.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

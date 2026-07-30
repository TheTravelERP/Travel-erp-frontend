// src/features/settings/documentTemplates/components/DocumentPreviewPanel.tsx
import { useEffect, useRef, useState } from "react";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props<T> {
  /** Current (possibly unsaved) form values to preview — re-renders on change, debounced. */
  values: T;
  /** Calls the backend preview endpoint with the current values, returns a PDF blob. */
  fetchPreview: (values: T) => Promise<Blob>;
  /** Skip rendering until the caller has real data (e.g. still loading initial settings). */
  enabled?: boolean;
}

const DEBOUNCE_MS = 600;

/** Live PDF preview — regenerates on every form change (debounced) without
 * requiring Save first, per the Document Templates spec. Renders the PDF
 * blob in an <iframe>, no external PDF-viewer dependency. */
export default function DocumentPreviewPanel<T>({ values, fetchPreview, enabled = true }: Props<T>) {
  const { t } = useTranslation();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const currentBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const blob = await fetchPreview(values);
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        if (currentBlobUrlRef.current) URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = url;
      } catch {
        setError(t("documentTemplateConfig.previewFailed"));
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values), enabled]);

  useEffect(() => {
    return () => {
      if (currentBlobUrlRef.current) URL.revokeObjectURL(currentBlobUrlRef.current);
    };
  }, []);

  return (
    <Box sx={{ position: "relative", height: "100%", minHeight: 500 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle2">{t("documentTemplateConfig.livePreview")}</Typography>
        {loading && <CircularProgress size={16} />}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

      {blobUrl ? (
        <Box
          component="iframe"
          src={blobUrl}
          title="document-preview"
          sx={{ width: "100%", height: 600, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
        />
      ) : (
        <Box
          sx={{
            width: "100%", height: 600, display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px dashed", borderColor: "divider", borderRadius: 1,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
}

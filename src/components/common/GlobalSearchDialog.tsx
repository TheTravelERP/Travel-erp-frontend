// src/components/common/GlobalSearchDialog.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Dialog,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { globalSearch, type GlobalSearchResponse, type SearchResultItem } from "../../services/globalSearch.service";

interface Props {
  open: boolean;
  onClose: () => void;
}

const EMPTY: GlobalSearchResponse = { customers: [], enquiries: [], notifications: [], notification_logs: [] };

export default function GlobalSearchDialog({ open, onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResponse>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults(EMPTY);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(EMPTY);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      globalSearch(query, controller.signal)
        .then(setResults)
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const goTo = (path: string) => {
    onClose();
    navigate(path);
  };

  const sections: { key: keyof GlobalSearchResponse; label: string; onPick: (item: SearchResultItem) => void }[] = [
    { key: "customers", label: t("globalSearch.customers"), onPick: (i) => goTo(`/app/crm/customers/${i.uuid}`) },
    { key: "enquiries", label: t("globalSearch.enquiries"), onPick: (i) => goTo(`/app/enquiries/${i.uuid}`) },
    { key: "notifications", label: t("globalSearch.notifications"), onPick: () => goTo("/app/notifications") },
    {
      key: "notification_logs",
      label: t("globalSearch.notificationLogs"),
      onPick: () => goTo("/app/reports/notification-logs"),
    },
  ];

  const hasAnyResults = sections.some((s) => results[s.key].length > 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ p: 2 }}>
        <TextField
          autoFocus
          fullWidth
          placeholder={t("globalSearch.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Box>

      <Box sx={{ maxHeight: 420, overflowY: "auto", px: 1, pb: 1 }}>
        {loading && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!loading && query.trim() && !hasAnyResults && (
          <Typography color="text.secondary" textAlign="center" py={3}>
            {t("common.noRecordsFound")}
          </Typography>
        )}

        {!loading &&
          sections.map(({ key, label, onPick }) =>
            results[key].length > 0 ? (
              <List key={key} dense subheader={<ListSubheader>{label}</ListSubheader>}>
                {results[key].map((item) => (
                  <ListItemButton key={item.uuid} onClick={() => onPick(item)}>
                    <ListItemText primary={item.title} secondary={item.subtitle} />
                  </ListItemButton>
                ))}
              </List>
            ) : null,
          )}
      </Box>
    </Dialog>
  );
}

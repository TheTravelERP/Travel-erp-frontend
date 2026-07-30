// src/features/crm/quotation/pages/QuotationListPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, MenuItem, Paper, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate, useSearchParams } from "react-router-dom";

import { SearchInput } from "../../../../components/ui/SearchInput";
import ListPageToolbar from "../../../../components/common/ListPageToolbar";
import QuotationTable from "../components/QuotationTable";
import { usePermission } from "../../../../hooks/usePermission";
import { getQuotationsList } from "../quotation.api";
import type { QuotationListItem } from "../quotation.types";

const STATUSES = ["Draft", "Sent", "Revised", "Accepted", "Rejected", "Expired", "Converted"];

export default function QuotationListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const perms = usePermission("crm.quotations");
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("page_size") || 10);
  const sortBy = searchParams.get("sort_by") || undefined;
  const sortOrder = (searchParams.get("sort_order") as "asc" | "desc") || undefined;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const [searchDraft, setSearchDraft] = useState(search);

  const [rows, setRows] = useState<QuotationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const updateURL = (params: Record<string, any>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  const handleSortChange = (columnId: string) => {
    const nextOrder = sortBy === columnId && sortOrder === "asc" ? "desc" : "asc";
    updateURL({ sort_by: columnId, sort_order: nextOrder, page: 1 });
  };

  const fetchData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res = await getQuotationsList(
        { page, page_size: pageSize, sort_by: sortBy, sort_order: sortOrder, search, status: status || undefined },
        signal,
      );
      setRows(res.data);
      setTotal(res.pagination.total);
    } catch (err) {
      if (!axios.isCancel(err)) throw err;
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <ListPageToolbar
        title={t("menu.crm.quotations")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: t("menu.crm.quotations") },
        ]}
        primaryAction={{
          key: "add",
          label: t("common.add"),
          icon: <AddIcon />,
          variant: "contained",
          show: perms.can_create,
          onClick: () => navigate("/app/crm/quotations/create"),
        }}
      />

      <Paper sx={{ p: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
          <SearchInput
            placeholder={t("common.searchByCodeName")}
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onSearch={() => updateURL({ search: searchDraft, page: 1 })}
            onClear={() => { setSearchDraft(""); updateURL({ search: undefined, page: 1 }); }}
            sx={{ flex: 1, minWidth: 240 }}
          />
          <TextField
            select
            size="small"
            label={t("common.status")}
            value={status}
            onChange={(e) => updateURL({ status: e.target.value, page: 1 })}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">{t("common.all")}</MenuItem>
            {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </Box>

        <QuotationTable
          rows={rows} loading={loading} page={page} pageSize={pageSize} total={total}
          sortBy={sortBy} sortOrder={sortOrder} onSortChange={handleSortChange}
          onPageChange={(p) => updateURL({ page: p })}
          onPageSizeChange={(s) => updateURL({ page_size: s, page: 1 })}
          onRefresh={fetchData}
        />
      </Paper>
    </Box>
  );
}

// src/features/inventory/vendorContract/pages/VendorContractListPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";

import AddIcon from "@mui/icons-material/Add";
import ListAltIcon from "@mui/icons-material/ListAlt";

import { useNavigate, useSearchParams } from "react-router-dom";

import { SearchInput } from "../../../../components/ui/SearchInput";
import ListPageToolbar from "../../../../components/common/ListPageToolbar";
import VendorContractTable from "../components/VendorContractTable";

import { usePermission } from "../../../../hooks/usePermission";
import { getVendorContracts } from "../vendorContract.api";
import type { VendorContractListItem } from "../vendorContract.types";

export default function VendorContractListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const perms = usePermission("inventory.contracts");
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("page_size") || 10);

  const isTrash = searchParams.get("is_deleted") === "true";

  const sortBy = searchParams.get("sort_by") || undefined;
  const sortOrder = (searchParams.get("sort_order") as "asc" | "desc") || undefined;

  const handleSortChange = (columnId: string) => {
    const nextOrder = sortBy === columnId && sortOrder === "asc" ? "desc" : "asc";
    updateURL({ sort_by: columnId, sort_order: nextOrder, page: 1 });
  };

  const search = searchParams.get("search") || "";
  const [draftSearch, setDraftSearch] = useState(search);

  const applyWildSearch = () => {
    updateURL({ search: draftSearch, page: 1 });
  };

  const clearWildSearch = () => {
    setDraftSearch("");
    updateURL({ search: undefined, page: 1 });
  };

  const [rows, setRows] = useState<VendorContractListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);

      const res = await getVendorContracts(
        {
          page,
          page_size: pageSize,
          is_deleted: isTrash,
          sort_by: sortBy,
          sort_order: sortOrder,
          search,
        },
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
  }, [searchParams]);

  const updateURL = (params: Record<string, any>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(params).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, String(value));
    });

    setSearchParams(next);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <ListPageToolbar
        title={isTrash ? t("common.trash") : t("menu.inventory.contracts")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: isTrash ? t("common.trash") : t("menu.inventory.contracts") },
        ]}
        primaryAction={
          isTrash
            ? {
                key: "view",
                label: t("menu.inventory.contracts"),
                icon: <ListAltIcon />,
                variant: "contained",
                onClick: () => updateURL({ is_deleted: undefined, page: 1 }),
              }
            : {
                key: "add",
                label: t("common.add"),
                icon: <AddIcon />,
                variant: "contained",
                show: perms.can_create,
                onClick: () => navigate("/app/inventory/contracts/create"),
              }
        }
        overflowActions={[
          {
            key: "view-trash",
            label: t("common.viewTrash"),
            show: perms.can_delete && !isTrash,
            onClick: () => updateURL({ is_deleted: true, page: 1 }),
          },
        ]}
      />

      <Paper sx={{ p: 2 }}>
        <SearchInput
          placeholder={t("common.searchByCodeName")}
          value={draftSearch}
          onChange={(e) => setDraftSearch(e.target.value)}
          onSearch={applyWildSearch}
          onClear={clearWildSearch}
          sx={{ mb: 2 }}
        />

        <VendorContractTable
          rows={rows}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          isTrash={isTrash}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onPageChange={(p) => updateURL({ page: p })}
          onPageSizeChange={(s) => updateURL({ page_size: s, page: 1 })}
          onRefresh={fetchData}
        />
      </Paper>
    </Box>
  );
}

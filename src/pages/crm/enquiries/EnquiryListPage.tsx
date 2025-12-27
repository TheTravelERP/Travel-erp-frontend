// src/pages/crm/enquiries/EnquiryListPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Collapse,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';

import { useNavigate, useSearchParams } from 'react-router-dom';

import { SearchInput } from '../../../components/ui/SearchInput';
import EnquiryTable from './components/EnquiryTable';
import EnquiryFilters, {
  type EnquiryFilterValues,
} from './components/EnquiryFilters';

import { usePermission } from '../../../hooks/usePermission';
import { getEnquiries } from '../../../services/enquiry.service';
import type { EnquiryListItem } from '../../../types/enquiry.types';

/* ================= COMPONENT ================= */

export default function EnquiryListPage() {
  const navigate = useNavigate();
  const perms = usePermission('crm_enquiries');
  const [searchParams, setSearchParams] = useSearchParams();

  /* ---------- UI ---------- */
  const [showFilters, setShowFilters] = useState(false);
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);

  /* ---------- PAGINATION (URL SOURCE OF TRUTH) ---------- */
  const page = Number(searchParams.get('page') || 1);
  const pageSize = Number(searchParams.get('page_size') || 10);

  /* ---------- APPLIED FILTERS (FROM URL) ---------- */
  const appliedFilters: EnquiryFilterValues = {
    search: searchParams.get('search') || '',
    conversion_status: searchParams.get('conversion_status') || '',
    priority: searchParams.get('priority') || '',
    lead_source: searchParams.get('lead_source') || '',
    from_date: searchParams.get('from_date') || '',
    to_date: searchParams.get('to_date') || '',
  };

  /* ---------- DRAFT FILTERS (UI ONLY) ---------- */
  const [draftFilters, setDraftFilters] =
    useState<EnquiryFilterValues>(appliedFilters);

  const applyWildSearch = () => {
    updateURL({
      search: draftFilters.search,
      page: 1,
    });
  };

  const clearWildSearch = () => {
    setDraftFilters((prev) => ({ ...prev, search: '' }));

    updateURL({
      search: undefined,
      page: 1,
    });
  };

  /* ---------- DATA ---------- */
  const [rows, setRows] = useState<EnquiryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ---------- FETCH (ONLY ON URL CHANGE) ---------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getEnquiries({
          page,
          page_size: pageSize,
          ...appliedFilters,
        });

        setRows(res.data);
        setTotal(res.pagination.total);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  /* ---------- HELPERS ---------- */
  const updateURL = (params: Record<string, any>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(params).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, String(value));
    });

    setSearchParams(next);
  };

  /* ----------- EXPORT --------- */
  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const params = new URLSearchParams(location.search);
    params.set("format", format);

    window.open(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/enquiries/export?${params}`,
      "_blank"
    );

    setExportAnchor(null);
  };

  /* ------------- IMPORT -------------------- */
   const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/v1/crm/enquiries/import", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Import failed");
    }

    const data = await res.json();
    console.log(data);

    // Optional: refresh list after import
    // fetchEnquiries();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

 

  /* ================= RENDER ================= */

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Enquiries
          </Typography>

          <Breadcrumbs separator="•" sx={{ mt: 0.5 }}>
            <Link underline="hover" color="inherit" href="/app/dashboard">
              Dashboard
            </Link>
            <Typography color="text.primary">Enquiries</Typography>
          </Breadcrumbs>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {perms.can_create && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/app/crm/enquiries/create')}
            >
              Add Enquiry
            </Button>
          )}

          <Button
            variant={showFilters ? 'contained' : 'outlined'}
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(v => !v)}
          >
            Filters
          </Button>

          {perms.can_export && (
            <>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={(e) => setExportAnchor(e.currentTarget)}
              >
                Export
              </Button>
              <Menu
                anchorEl={exportAnchor}
                open={Boolean(exportAnchor)}
                onClose={() => setExportAnchor(null)}
              >
                <MenuItem onClick={() => handleExport("csv")}>Export CSV</MenuItem>
                <MenuItem onClick={() => handleExport("excel")}>Export Excel</MenuItem>
                <MenuItem onClick={() => handleExport("pdf")}>Export PDF</MenuItem>
              </Menu>
            </>
          )}
          {perms.can_import && (
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Import CSV
            </Button>
          )}

          <IconButton onClick={(e) => setMoreAnchor(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={moreAnchor}
            open={Boolean(moreAnchor)}
            onClose={() => setMoreAnchor(null)}
          >
            <MenuItem startIcon={<UploadIcon />}>Import</MenuItem>
            <MenuItem>Bulk Assign</MenuItem>
            <MenuItem>Bulk Delete</MenuItem>
          </Menu>
        </Stack>
      </Box>

      

      {/* CONTENT */}
      <Paper sx={{ p: 2 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          hidden
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleImport(e.target.files[0]);
              e.target.value = ""; // allow re-upload same file
            }
          }}
        />
        <Collapse in={showFilters}>
          <EnquiryFilters
            value={draftFilters}
            onChange={(v) =>
              setDraftFilters((prev) => ({ ...prev, ...v }))
            }
            onApply={() => {
              updateURL({ ...draftFilters, page: 1 });
            }}
            onReset={() => {
              setDraftFilters({});
              setSearchParams({ page: '1', page_size: String(pageSize) });
            }}
          />
        </Collapse>

        {/* WILD SEARCH */}
        <SearchInput
          placeholder="Search by customer, mobile, package..."
          value={draftFilters.search || ''}
          onChange={(e) =>
            setDraftFilters({ ...draftFilters, search: e.target.value })
          }
          onSearch={applyWildSearch}
          onClear={clearWildSearch}
          sx={{ mb: 2 }}
        />

        <EnquiryTable
          rows={rows}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={(p) => updateURL({ page: p })}
          onPageSizeChange={(s) =>
            updateURL({ page_size: s, page: 1 })
          }
        />
      </Paper>
    </Box>
  );
}

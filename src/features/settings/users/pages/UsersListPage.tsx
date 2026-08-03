// src/features/settings/users/pages/UsersListPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Paper, Collapse } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';

import { useNavigate, useSearchParams } from 'react-router-dom';

import { SearchInput } from '../../../../components/ui/SearchInput';
import ListPageToolbar from '../../../../components/common/ListPageToolbar';
import ImportResultDialog from '../../../../components/common/ImportResultDialog';
import UsersTable from '../components/UsersTable';
import UsersFilters, { type UsersFilterValues } from '../components/UsersFilters';

import { usePermission } from '../../../../hooks/usePermission';
import { useCsvImport } from '../../../../hooks/useCsvImport';
import { getUsers, importUsersFromCsv } from '../users.api';
import type { UserListItem } from '../users.types';

export default function UsersListPage() {
  const navigate = useNavigate();
  const perms = usePermission('settings.users');
  const [searchParams, setSearchParams] = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);

  const page = Number(searchParams.get('page') || 1);
  const pageSize = Number(searchParams.get('page_size') || 10);

  const isTrash = searchParams.get('is_deleted') === 'true';

  const sortBy = searchParams.get('sort_by') || undefined;
  const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || undefined;

  const handleSortChange = (columnId: string) => {
    const nextOrder = sortBy === columnId && sortOrder === 'asc' ? 'desc' : 'asc';
    updateURL({ sort_by: columnId, sort_order: nextOrder, page: 1 });
  };

  const appliedFilters: UsersFilterValues = {
    search: searchParams.get('search') || '',
    user_type: searchParams.get('user_type') || '',
    status: searchParams.get('status') || '',
    designation: searchParams.get('designation') || '',
    gender: searchParams.get('gender') || '',
    from_date: searchParams.get('from_date') || '',
    to_date: searchParams.get('to_date') || '',
  };

  const [draftFilters, setDraftFilters] = useState<UsersFilterValues>(appliedFilters);

  const applyWildSearch = () => {
    updateURL({ search: draftFilters.search, page: 1 });
  };

  const clearWildSearch = () => {
    setDraftFilters((prev) => ({ ...prev, search: '' }));
    updateURL({ search: undefined, page: 1 });
  };

  const [rows, setRows] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res = await getUsers(
        {
          page,
          page_size: pageSize,
          is_deleted: isTrash,
          sort_by: sortBy,
          sort_order: sortOrder,
          ...appliedFilters,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const params = new URLSearchParams(location.search);
    params.set('format', format);
    window.open(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/settings/users/export?${params}`,
      '_blank',
    );
  };

  const {
    fileInputRef,
    result: importResult,
    dialogOpen: importDialogOpen,
    closeDialog: closeImportDialog,
    openFilePicker,
    onFileInputChange,
  } = useCsvImport(importUsersFromCsv, fetchData);

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
        title={isTrash ? 'Users Trash' : 'Users'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/app/dashboard' },
          { label: 'Settings' },
          { label: isTrash ? 'Users Trash' : 'Users' },
        ]}
        primaryAction={
          isTrash
            ? {
                key: 'view',
                label: 'View Users',
                icon: <ListAltIcon />,
                variant: 'contained',
                onClick: () => updateURL({ is_deleted: undefined, page: 1 }),
              }
            : {
                key: 'add',
                label: 'Add User',
                icon: <AddIcon />,
                variant: 'contained',
                show: perms.can_create,
                onClick: () => navigate('/app/settings/users/create'),
              }
        }
        secondaryActions={[
          {
            key: 'filters',
            label: 'Filters',
            icon: <FilterListIcon />,
            variant: showFilters ? 'contained' : 'outlined',
            onClick: () => setShowFilters((v) => !v),
          },
        ]}
        overflowActions={[
          {
            key: 'view-trash',
            label: 'View Trash',
            show: perms.can_delete && !isTrash,
            onClick: () => updateURL({ is_deleted: true, page: 1 }),
          },
          {
            key: 'export',
            label: 'Export',
            icon: <DownloadIcon />,
            show: perms.can_export && !isTrash,
            menuItems: [
              { label: 'Export CSV', onClick: () => handleExport('csv') },
              { label: 'Export Excel', onClick: () => handleExport('excel') },
              { label: 'Export PDF', onClick: () => handleExport('pdf') },
            ],
          },
          {
            key: 'import',
            label: 'Import CSV',
            icon: <UploadIcon />,
            show: perms.can_import && !isTrash,
            onClick: openFilePicker,
          },
        ]}
      />

      <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={onFileInputChange} />
      <ImportResultDialog open={importDialogOpen} result={importResult} onClose={closeImportDialog} />

      <Paper sx={{ p: 2 }}>
        <Collapse in={showFilters}>
          <UsersFilters
            value={draftFilters}
            onChange={(v) => setDraftFilters((prev) => ({ ...prev, ...v }))}
            onApply={() => updateURL({ ...draftFilters, page: 1 })}
            onReset={() => {
              setDraftFilters({});
              setSearchParams({ page: '1', page_size: String(pageSize) });
            }}
          />
        </Collapse>

        <SearchInput
          placeholder="Search by name, email, mobile..."
          value={draftFilters.search || ''}
          onChange={(e) => setDraftFilters({ ...draftFilters, search: e.target.value })}
          onSearch={applyWildSearch}
          onClear={clearWildSearch}
          sx={{ mb: 2 }}
        />

        <UsersTable
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

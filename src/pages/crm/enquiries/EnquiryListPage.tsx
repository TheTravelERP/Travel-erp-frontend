
import React from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';

import { useNavigate } from 'react-router-dom';

import EnquiryTable from './components/EnquiryTable';
import { usePermission } from '../../../hooks/usePermission';




export default function EnquiryListPage() {
  const navigate = useNavigate();
  const [exportAnchor, setExportAnchor] = React.useState<null | HTMLElement>(null);
  const [moreAnchor, setMoreAnchor] = React.useState<null | HTMLElement>(null);
  const perms = usePermission('crm_enquiries');


  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        {/* LEFT */}
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

        {/* RIGHT – ACTIONS */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Add Enquiry */}
          {perms.can_create && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/app/crm/enquiries/create')}
            >
              Add Enquiry
            </Button>
          )}


          {/* Advanced Search (outside more) */}
          {perms.can_view && (
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={() => console.log('Advanced Search')}
            >
              Search
            </Button>
          )}

          {/* Import */}
          {perms.import && (
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => console.log('Import')}
            >
              Import
            </Button>
          )}

          {/* Export */}
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
                <MenuItem onClick={() => console.log('Export CSV')}>Export CSV</MenuItem>
                <MenuItem onClick={() => console.log('Export Excel')}>Export Excel</MenuItem>
                <MenuItem onClick={() => console.log('Export PDF')}>Export PDF</MenuItem>
              </Menu>
            </>
          )}

          {/* More */}
          <IconButton onClick={(e) => setMoreAnchor(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={moreAnchor}
            open={Boolean(moreAnchor)}
            onClose={() => setMoreAnchor(null)}
          >
            <MenuItem onClick={() => console.log('Bulk Assign Agent')}>
              Bulk Assign Agent
            </MenuItem>
            <MenuItem onClick={() => console.log('Bulk Delete')}>
              Bulk Delete
            </MenuItem>
          </Menu>
        </Stack>
      </Box>

      {/* Content */}
      <Paper elevation={4} sx={{ p: { xs: 1.5, md: 3 }, borderRadius: 2 }}>
        <EnquiryTable />
      </Paper>
    </Box>
  );
}

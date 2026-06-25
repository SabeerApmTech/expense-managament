import { Box, Paper, Button, Typography } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useState } from 'react';
import { MasterDataDialog } from './MasterDataDialog';
import { MappingsDialog } from './MappingsDialog';

export const AdminActionsCard = () => {
  const [masterDataOpen, setMasterDataOpen] = useState(false);
  const [mappingsOpen, setMappingsOpen] = useState(false);

  return (
    <>
      <Paper sx={{ mb: 2, borderRadius: 3, px: 2.5, py: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
          Master Data
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<StorageIcon />}
            onClick={() => setMasterDataOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Master Data
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AccountTreeIcon />}
            onClick={() => setMappingsOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Rules & Mappings
          </Button>
        </Box>
      </Paper>

      <MasterDataDialog open={masterDataOpen} onClose={() => setMasterDataOpen(false)} />
      <MappingsDialog open={mappingsOpen} onClose={() => setMappingsOpen(false)} />
    </>
  );
};

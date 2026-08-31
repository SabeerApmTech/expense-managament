import {
  Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider,
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import { useState } from 'react';
import { TermsContentView } from './TermsContentView';
import { TERMS_CONTENT } from '../../content/termsContent';
import type { TermsLanguage } from '../../content/termsContent';

export const TermsDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [lang, setLang] = useState<TermsLanguage>('en');
  const content = TERMS_CONTENT[lang];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper"
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GavelIcon color="primary" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Terms &amp; Conditions
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {content.subtitle}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        <TermsContentView lang={lang} onLangChange={setLang} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2, px: 3 }}>
          {content.understand}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

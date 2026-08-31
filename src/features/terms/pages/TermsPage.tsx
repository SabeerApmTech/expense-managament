import { Box, Paper, Typography, Divider } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import { useState } from 'react';
import { TermsContentView } from '../../../components/layout/TermsContentView';
import { TERMS_CONTENT } from '../../../content/termsContent';
import type { TermsLanguage } from '../../../content/termsContent';

export const TermsPage = () => {
  const [lang, setLang] = useState<TermsLanguage>('en');
  const content = TERMS_CONTENT[lang];

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      <Paper variant="outlined" sx={{ borderRadius: 2, p: { xs: 2.5, sm: 3.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
        <Divider sx={{ mb: 2.5 }} />
        <TermsContentView lang={lang} onLangChange={setLang} />
      </Paper>
    </Box>
  );
};

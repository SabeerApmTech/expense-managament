import { Box, Typography, Divider, ToggleButtonGroup, ToggleButton } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import { LANGUAGE_OPTIONS, TERMS_CONTENT } from '../../content/termsContent';
import type { TermsLanguage } from '../../content/termsContent';

interface Props {
  lang: TermsLanguage;
  onLangChange: (lang: TermsLanguage) => void;
}

export const TermsContentView = ({ lang, onLangChange }: Props) => {
  const content = TERMS_CONTENT[lang];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
        <TranslateIcon fontSize="small" sx={{ color: 'text.disabled' }} />
        <ToggleButtonGroup
          size="small"
          exclusive
          value={lang}
          onChange={(_e, v) => v && onLangChange(v)}
          sx={{ '& .MuiToggleButton-root': { px: 1.75, py: 0.4, fontSize: 13, textTransform: 'none' } }}
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <ToggleButton key={opt.code} value={opt.code}>{opt.label}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontStyle: 'italic' }}>
        {content.intro}
      </Typography>
      {content.sections.map((s) => (
        <Box key={s.title} sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
            {s.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            {s.body}
          </Typography>
        </Box>
      ))}
      <Divider sx={{ my: 2 }} />
      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
        {content.footer}
      </Typography>
    </Box>
  );
};

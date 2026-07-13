import { useEffect, useState } from 'react';
import { Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IosShareIcon from '@mui/icons-material/IosShare';

const DISMISSED_KEY = 'ios-install-banner-dismissed';

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone) || window.matchMedia('(display-mode: standalone)').matches;
}

/**
 * iOS Safari only delivers push notifications to a site installed via
 * "Add to Home Screen" — there's no programmatic install prompt on iOS,
 * so this banner is the only way to guide users there.
 */
export function IosInstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIos() || isStandalone()) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  return (
    <Alert
      severity="info"
      icon={<IosShareIcon fontSize="small" />}
      action={
        <IconButton size="small" onClick={dismiss} aria-label="Dismiss">
          <CloseIcon fontSize="small" />
        </IconButton>
      }
      sx={{ borderRadius: 0 }}
    >
      To receive approval notifications on iPhone: tap the Share icon, choose "Add to Home Screen", then open the app from your Home Screen.
    </Alert>
  );
}

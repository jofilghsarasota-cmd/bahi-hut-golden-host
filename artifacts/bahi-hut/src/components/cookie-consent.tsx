import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COOKIE_KEY = 'bahi-hut-cookie-consent';

type ConsentState = 'accepted' | 'essential' | null;

function getConsent(): ConsentState {
  try {
    return (localStorage.getItem(COOKIE_KEY) as ConsentState) ?? null;
  } catch {
    return null;
  }
}

function setConsent(value: ConsentState) {
  try {
    if (value) localStorage.setItem(COOKIE_KEY, value);
  } catch {
    // ignore
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setVisible(true);
  }, []);

  function accept() {
    setConsent('accepted');
    setVisible(false);
  }

  function essential() {
    setConsent('essential');
    setVisible(false);
  }

  function dismiss() {
    // Treat closing without choosing as essential-only
    essential();
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className={cn(
        'fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-lg rounded-2xl border border-border/60',
        'bg-background/95 shadow-2xl backdrop-blur-md supports-[backdrop-filter]:bg-background/85',
        'animate-in slide-in-from-bottom-4 duration-300',
      )}
    >
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm font-semibold">We use cookies</p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!managing ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              We use essential cookies to remember your preferences and optional analytics cookies to improve your
              experience. No personal data is sold.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={accept} className="flex-1">
                Accept All
              </Button>
              <Button size="sm" variant="outline" onClick={() => setManaging(true)} className="flex-1">
                Manage
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 space-y-3">
              <div className="flex items-start justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Essential</p>
                  <p className="text-xs text-muted-foreground">Preferences & site functionality. Always on.</p>
                </div>
                <span className="mt-0.5 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">Always on</span>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Analytics</p>
                  <p className="text-xs text-muted-foreground">Helps us understand how visitors use the site.</p>
                </div>
                <span className="mt-0.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Optional</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={accept} className="flex-1">
                Accept All
              </Button>
              <Button size="sm" variant="outline" onClick={essential} className="flex-1">
                Essential Only
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

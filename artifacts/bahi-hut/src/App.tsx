import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

import { Shell } from '@/components/shell';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import BahiHut from '@/pages/bahi-hut';
import Resort from '@/pages/resort';
import Events from '@/pages/events';
import PrivateEvents from '@/pages/private-events';
import Shop from '@/pages/shop';
import LocalGuide from '@/pages/local-guide';

const queryClient = new QueryClient();

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/bahi-hut" component={BahiHut} />
        <Route path="/resort" component={Resort} />
        <Route path="/events" component={Events} />
        <Route path="/private-events" component={PrivateEvents} />
        <Route path="/shop" component={Shop} />
        <Route path="/local-guide" component={LocalGuide} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <RoutedErrorBoundary>
            <Router />
          </RoutedErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { useLocation } from 'react-router-dom';

import { AppRoutes } from '@/app/routes';
import { Footer } from '@/components/Footer';
import { TopNav } from '@/components/TopNav';

/** Routes that take the full viewport (edge-to-edge, no footer below). */
const FULL_BLEED_ROUTES = ['/map'];

export function App() {
  const { pathname } = useLocation();
  const isFullBleed = FULL_BLEED_ROUTES.includes(pathname);

  return (
    <div className="flex min-h-full flex-col">
      <TopNav />
      <main className={isFullBleed ? 'flex-1' : 'mx-auto w-full max-w-6xl flex-1 p-6'}>
        <AppRoutes />
      </main>
      {!isFullBleed && <Footer />}
    </div>
  );
}

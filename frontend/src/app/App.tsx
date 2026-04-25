import { AppRoutes } from '@/app/routes';
import { Footer } from '@/components/Footer';
import { TopNav } from '@/components/TopNav';

export function App() {
  return (
    <div className="flex min-h-full flex-col">
      <TopNav />
      <main className="mx-auto w-full max-w-6xl flex-1 p-6">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

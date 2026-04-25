import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { SearchPage } from '@/features/search/SearchPage';
import { MapPage } from '@/features/map/MapPage';
import { WishlistPage } from '@/features/wishlist/WishlistPage';
import { ArtworkDetailPage } from '@/features/artwork/ArtworkDetailPage';
import { ArtistDetailPage } from '@/features/artist/ArtistDetailPage';
import { MuseumDetailPage } from '@/features/museum/MuseumDetailPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SearchPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/artworks/:slug" element={<ArtworkDetailPage />} />
      <Route path="/artists/:slug" element={<ArtistDetailPage />} />
      <Route path="/museums/:slug" element={<MuseumDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/wishlist"
        element={
          <RequireAuth>
            <WishlistPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

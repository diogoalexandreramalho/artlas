import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { HomeScreen } from '@/features/home/HomeScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { SearchResultsPage } from '@/features/search/SearchResultsPage';
import { MapPage } from '@/features/map/MapPage';
import { WishlistPage } from '@/features/wishlist/WishlistPage';
import { ArtworkDetailPage } from '@/features/artwork/ArtworkDetailPage';
import { ArtistDetailPage } from '@/features/artist/ArtistDetailPage';
import { MuseumDetailPage } from '@/features/museum/MuseumDetailPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/search" element={<SearchResultsPage />} />
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
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <ProfileScreen />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

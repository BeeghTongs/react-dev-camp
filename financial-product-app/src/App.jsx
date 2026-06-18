import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import LoginPage from './pages/LoginPage'
import ProductListPage from './pages/ProductListPage'
import GuestListPage from './pages/GuestListPage'
import ProductPage from './pages/ProductPage'
import NewArrivalsPage from './pages/NewArrivalsPage'
import RecommendedPage from './pages/RecommendedPage'
import AccountPage from './pages/AccountPage';
import SplashScreen from './pages/SplashScreen';
import ScrollToTop from './components/ScrollToTop';
import RequireAuth from './components/RequireAuth';
import MockDataPage from './pages/MockDataPage';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/new-arrivals" element={
          <RequireAuth allowGuest={false}>
            <NewArrivalsPage />
          </RequireAuth>
          } />
        <Route path="/recommended" element={
          <RequireAuth allowGuest={false}>
            <RecommendedPage />
          </RequireAuth>
          } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/guest-list" element={
          <RequireAuth requireGuest>
            <GuestListPage />
          </RequireAuth>
        } />
        <Route path="/" element={<SplashScreen />} />
        <Route path="/list" element={
          <RequireAuth allowGuest={false}>
            <ProductListPage />
          </RequireAuth>
        } />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/products/:id" element={
          <RequireAuth>
            <ProductPage />
          </RequireAuth>
        } />
        <Route path="/mock-data" element={
          <RequireAuth>
            <MockDataPage />
          </RequireAuth>
        } />
        <Route path="/account" element={
          <RequireAuth>
            <AccountPage />
          </RequireAuth>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App

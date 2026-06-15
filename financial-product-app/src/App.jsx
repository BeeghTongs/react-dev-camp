import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import LoginPage from './pages/LoginPage'
import ProductListPage from './pages/ProductListPage'
import ProductPage from './pages/ProductPage'
import NewArrivalsPage from './pages/NewArrivalsPage'
import RecommendedPage from './pages/RecommendedPage'
import SplashScreen from './pages/SplashScreen';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/new-arrivals" element={<NewArrivalsPage />} />
        <Route path="/recommended" element={<RecommendedPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<SplashScreen />} />
        <Route path="/list" element={<ProductListPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/products/:id" element={<ProductPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App

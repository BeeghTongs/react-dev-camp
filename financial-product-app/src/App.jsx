import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import ProductListPage from './pages/ProductListPage'
import ProductPage from './pages/ProductPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductListPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route
          path="/products/:id"
          element={<ProductPage />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

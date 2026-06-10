import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import ProductPage from './pages/ProductPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/products/1" replace />} />
        <Route
          path="/products/:id"
          element={<ProductPage />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

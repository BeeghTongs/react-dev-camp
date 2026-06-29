import { Navigate } from 'react-router-dom'
import CustomerType from '../components/CustomerType.jsx'
import './css/CustomerTypePage.css'

function CustomerTypePage() {
  if (!sessionStorage.getItem('signup_awaiting_customer_type')) {
    return <Navigate to="/list" replace />
  }

  return (
    <main className="customer-type-page" aria-label="Customer type selection">
      <section className="customer-type-card" aria-label="Select account type panel">
        <CustomerType />
      </section>
    </main>
  )
}

export default CustomerTypePage

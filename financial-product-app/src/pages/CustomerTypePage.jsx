import CustomerType from '../components/CustomerType.jsx'
import './css/CustomerTypePage.css'

function CustomerTypePage() {
  return (
    <main className="customer-type-page" aria-label="Customer type selection">
      <section className="customer-type-card" aria-label="Select account type panel">
        <CustomerType />
      </section>
    </main>
  )
}

export default CustomerTypePage

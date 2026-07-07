import './css/InsuranceList.css';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import mockInsuranceImage from '../assets/mockInsurance.jpg';
import productCatalogue from '../assets/Products.json';
import { useKycGate } from '../services/useKycGate';

// Individual mock covers are quoted as the product's base premium plus an
// add-on, so no mock price can ever fall below the actual listed product price.
function getBasePrice(productName) {
  const match = productCatalogue.find((p) => p.name.toLowerCase() === productName.toLowerCase());
  const numeric = Number(String(match?.price).replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

const RETAIL_BASE_PRICE = getBasePrice('Retail Long-Term Insurance');
const COMMERCIAL_BASE_PRICE = getBasePrice('Commercial Long-Term Insurance');

const RETAIL_ITEMS = [
  { id: 'retail-household', name: 'Household Insurance', addOn: 0 },
  { id: 'retail-life', name: 'Life Insurance', addOn: 130 },
  { id: 'retail-funeral', name: 'Funeral Cover', addOn: 0 },
  { id: 'retail-disability', name: 'Disability Cover', addOn: 150 },
].map((item) => ({ ...item, pricePerMonth: RETAIL_BASE_PRICE + item.addOn }));

const COMMERCIAL_ITEMS = [
  { id: 'commercial-office', name: 'Office Insurance', addOn: 0 },
  { id: 'commercial-employee-benefits', name: 'Employee Benefit Insurance', addOn: 2500 },
  { id: 'commercial-liability', name: 'Business Liability Cover', addOn: 1000 },
  { id: 'commercial-key-person', name: 'Key Person Insurance', addOn: 1500 },
].map((item) => ({ ...item, pricePerMonth: COMMERCIAL_BASE_PRICE + item.addOn }));

export default function LongTermInsuranceList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const { requireVerification, modal } = useKycGate('You need to be logged in to enquire about this product.');

  const segment = location.state?.segment ?? null;
  const showRetail = segment !== 'Commercial';
  const showCommercial = segment !== 'Retail';

  const query = search.trim().toLowerCase();
  const retail = showRetail ? RETAIL_ITEMS.filter((d) => d.name.toLowerCase().includes(query)) : [];
  const commercial = showCommercial ? COMMERCIAL_ITEMS.filter((d) => d.name.toLowerCase().includes(query)) : [];

  const pageTitle = segment ? `${segment} Long-Term Insurance` : 'Long-Term Insurance';

  return (
    <div className="insurance-list">
      <Header />

      <div className="insurance-list__inner">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">
            <MdArrowBack />
          </button>
          <h1 className="insurance-list__title">{pageTitle}</h1>
        </div>

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search long-term insurance"
        />

        {retail.length > 0 && (
          <>
            {!segment && <h2 className="insurance-list__section-title">Retail Long-Term Insurance</h2>}
            <div className="insurance-list__grid">
              {retail.map((item) => (
                <ProductCard
                  key={item.id}
                  imageUrl={mockInsuranceImage}
                  title={item.name}
                  price={`R${item.pricePerMonth} PM`}
                  onClick={() => requireVerification(() => navigate('/insurance-questionnaire', {
                    state: { category: 'retail-long-term' },
                  }))}
                />
              ))}
            </div>
          </>
        )}

        {commercial.length > 0 && (
          <>
            {!segment && <h2 className="insurance-list__section-title">Commercial Long-Term Insurance</h2>}
            <div className="insurance-list__grid">
              {commercial.map((item) => (
                <ProductCard
                  key={item.id}
                  imageUrl={mockInsuranceImage}
                  title={item.name}
                  price={`R${item.pricePerMonth} PM`}
                  onClick={() => requireVerification(() => navigate('/insurance-questionnaire', {
                    state: { category: 'commercial-long-term' },
                  }))}
                />
              ))}
            </div>
          </>
        )}

        {retail.length === 0 && commercial.length === 0 && (
          <p className="insurance-list__empty">No insurance products match "{search}".</p>
        )}
      </div>

      <BottomNav />
      {modal}
    </div>
  );
}

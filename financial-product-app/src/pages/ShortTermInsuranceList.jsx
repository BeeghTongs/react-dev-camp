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

const RETAIL_BASE_PRICE = getBasePrice('Retail Short Term Insurance');
const COMMERCIAL_BASE_PRICE = getBasePrice('Commercial Short Term Insurance');

const RETAIL_ITEMS = [
  { id: 'retail-electronics', name: 'Electronics Cover', addOn: 0, subtype: 'gadgets' },
  { id: 'retail-household', name: 'Household Items Cover', addOn: 150, subtype: 'home' },
  { id: 'retail-jewellery', name: 'Jewellery Cover', addOn: 80, subtype: 'gadgets' },
  { id: 'retail-cars', name: 'Car Insurance', addOn: 400, subtype: 'vehicle' },
].map((item) => ({ ...item, pricePerMonth: RETAIL_BASE_PRICE + item.addOn }));

const COMMERCIAL_ITEMS = [
  { id: 'commercial-printers', name: 'Printer Cover', addOn: 0 },
  { id: 'commercial-cars', name: 'Company Car Insurance', addOn: 1500 },
  { id: 'commercial-theft', name: 'Theft Cover', addOn: 500 },
  { id: 'commercial-equipment', name: 'Office Equipment Cover', addOn: 700 },
].map((item) => ({ ...item, pricePerMonth: COMMERCIAL_BASE_PRICE + item.addOn }));

export default function ShortTermInsuranceList() {
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

  const pageTitle = segment ? `${segment} Short Term Insurance` : 'Short Term Insurance';

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
          placeholder="Search short term insurance"
        />

        {retail.length > 0 && (
          <>
            {!segment && <h2 className="insurance-list__section-title">Retail Short Term Insurance</h2>}
            <div className="insurance-list__grid">
              {retail.map((item) => (
                <ProductCard
                  key={item.id}
                  imageUrl={mockInsuranceImage}
                  title={item.name}
                  price={`R${item.pricePerMonth} PM`}
                  onClick={() => requireVerification({
                    pathname: '/insurance-questionnaire',
                    state: { category: 'retail-short-term', subtype: item.subtype, productName: item.name, price: item.pricePerMonth },
                  })}
                />
              ))}
            </div>
          </>
        )}

        {commercial.length > 0 && (
          <>
            {!segment && <h2 className="insurance-list__section-title">Commercial Short Term Insurance</h2>}
            <div className="insurance-list__grid">
              {commercial.map((item) => (
                <ProductCard
                  key={item.id}
                  imageUrl={mockInsuranceImage}
                  title={item.name}
                  price={`R${item.pricePerMonth} PM`}
                  onClick={() => requireVerification({
                    pathname: '/insurance-questionnaire',
                    state: { category: 'commercial-short-term', productName: item.name, price: item.pricePerMonth },
                  })}
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

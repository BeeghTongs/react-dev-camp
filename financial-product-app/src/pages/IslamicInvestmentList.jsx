import './css/InvestmentList.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import mockInvestmentImage from '../assets/mockInvestment.jpg';
import productCatalogue from '../assets/Products.json';
import { useKycGate } from '../services/useKycGate';

// Individual mock investments are quoted as the product's base amount plus an
// add-on, so no mock price can ever fall below the actual listed product price.
function getBasePrice(productName) {
  const match = productCatalogue.find((p) => p.name.toLowerCase() === productName.toLowerCase());
  const numeric = Number(String(match?.price).replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

const BASE_PRICE = getBasePrice('Islamic Investment Product');

const INVESTMENTS = [
  { id: 'sukuk-fund', name: 'Sukuk Fund', addOn: 0 },
  { id: 'shariah-equity-fund', name: 'Shariah Equity Fund', addOn: 500 },
  { id: 'islamic-fixed-deposit', name: 'Islamic Fixed Deposit', addOn: 200 },
  { id: 'halal-unit-trust', name: 'Halal Unit Trust', addOn: 400 },
].map((item) => ({ ...item, price: BASE_PRICE + item.addOn }));

export default function IslamicInvestmentList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { requireVerification, modal } = useKycGate('You need to be logged in to enquire about this product.');

  const query = search.trim().toLowerCase();
  const investments = INVESTMENTS.filter((d) => d.name.toLowerCase().includes(query));

  return (
    <div className="investment-list">
      <Header />

      <div className="investment-list__inner">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">
            <MdArrowBack />
          </button>
          <h1 className="investment-list__title">Islamic Investments</h1>
        </div>

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search Islamic investments"
        />

        {investments.length > 0 ? (
          <div className="investment-list__grid">
            {investments.map((item) => (
              <ProductCard
                key={item.id}
                imageUrl={mockInvestmentImage}
                title={item.name}
                price={`R${item.price}`}
                onClick={() => requireVerification({
                  pathname: '/fica',
                  state: {
                    investmentId: item.id,
                    investmentName: item.name,
                    investmentType: 'Islamic Investments',
                    price: item.price,
                  },
                })}
              />
            ))}
          </div>
        ) : (
          <p className="investment-list__empty">No investments match "{search}".</p>
        )}
      </div>

      <BottomNav />
      {modal}
    </div>
  );
}

import './css/MockMobileContractsPage.css';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import ProductListCard from '../components/ProductListCard';
import mockMobileImage from '../assets/mockmobile.jpg';
import mockMobileImage2 from '../assets/mockmobile2.jpg';
import mockMobileImage3 from '../assets/mockmobile3.jpg';

const mockMobileImages = [mockMobileImage, mockMobileImage2, mockMobileImage3];

const mockMobileContracts = [
  { id: 101, title: 'Unlimited Talk & Text', price: 'R199 p/m', badge: 'Popular' },
  { id: 102, title: '5GB Social Bundle', price: 'R129 p/m', badge: 'New' },
  { id: 103, title: '10GB Data Plan', price: 'R249 p/m', badge: 'Best Value' },
  { id: 104, title: 'Family Share Pack', price: 'R399 p/m', badge: 'Save 15%' },
  { id: 105, title: 'Youth Data Boost', price: 'R99 p/m', badge: 'New' },
  { id: 106, title: 'Weekend Unlimited', price: 'R159 p/m', badge: null },
  { id: 107, title: 'Business Connect', price: 'R449 p/m', badge: 'Business' },
  { id: 108, title: 'Travel Roaming Plan', price: 'R289 p/m', badge: null },
  { id: 109, title: 'Premium 20GB', price: 'R329 p/m', badge: 'Popular' },
  { id: 110, title: 'Student Starter', price: 'R109 p/m', badge: 'Student' },
  { id: 111, title: 'Streaming Data Pack', price: 'R219 p/m', badge: 'New' },
  { id: 112, title: 'Night Owl Bundle', price: 'R139 p/m', badge: null },
  { id: 113, title: 'Family Data Share', price: 'R379 p/m', badge: 'Best Value' },
  { id: 114, title: 'Long-Term Saver', price: 'R179 p/m', badge: null },
  { id: 115, title: 'Premium Plus', price: 'R499 p/m', badge: 'Premium' },
];

export default function MockMobileContractsPage() {
  const navigate = useNavigate();

  return (
    <div className="mock-mobile-contracts-page">
      <header className="mock-mobile-contracts-header">
        <button
          type="button"
          className="mock-mobile-contracts-back"
          onClick={() => navigate(-1)}
        >
          <MdArrowBack />
        </button>
        <h1 className="mock-mobile-contracts-title">Mobile Contracts</h1>
      </header>

      <div className="mock-mobile-contracts-grid">
        {mockMobileContracts.map((contract, index) => (
          <ProductListCard
            key={contract.id}
            id={contract.id}
            title={contract.title}
            price={contract.price}
            badge={contract.badge}
            imageUrl={mockMobileImages[index % mockMobileImages.length]}
          />
        ))}
      </div>
    </div>
  );
}

import './css/MockDataPage.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import ProductListCard from '../components/ProductListCard';
import mockMobileImage from '../assets/mockmobile.jpg';
import mockMobileImage2 from '../assets/mockmobile2.jpg';
import mockMobileImage3 from '../assets/mockmobile3.jpg';
import mockTravelImage from '../assets/mocktravel.jpg';
import mockHomeImage from '../assets/mockhome.jpg';

const mockMobileImages = [mockMobileImage, mockMobileImage2, mockMobileImage3];
const mockTravelImages = [mockTravelImage];
const mockHomeImages = [mockHomeImage];

const collectionImages = {
  'mobile-contracts': mockMobileImages,
  'smart-home-protection': mockHomeImages,
  'travel-cover-essentials': mockTravelImages,
};

const collectionData = {
  'mobile-contracts': {
    title: 'Mobile Contracts',
    subtitle: 'Select the best plan for your device usage',
    items: [
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
    ],
  },
  'smart-home-protection': {
    title: 'Smart Home Protection',
    subtitle: 'Protect your home with tailored coverage',
    items: [
      { id: 201, title: 'Home Sensor Kit', price: 'R199 p/m', badge: 'Recommended' },
      { id: 202, title: '24/7 Monitoring', price: 'R349 p/m', badge: 'Premium' },
      { id: 203, title: 'Water Leak Guard', price: 'R149 p/m', badge: 'New' },
      { id: 204, title: 'Fire & Smoke Plan', price: 'R299 p/m', badge: 'Best Value' },
      { id: 205, title: 'Door & Window Alarm', price: 'R179 p/m', badge: null },
      { id: 206, title: 'Smart Video Package', price: 'R399 p/m', badge: 'Secure' },
    ],
  },
  'travel-cover-essentials': {
    title: 'Travel Cover Essentials',
    subtitle: 'Plans designed for your next trip',
    items: [
      { id: 301, title: 'Overseas Medical Cover', price: 'R259 p/m', badge: 'New' },
      { id: 302, title: 'Baggage Protection', price: 'R129 p/m', badge: 'Popular' },
      { id: 303, title: 'Trip Cancellation', price: 'R189 p/m', badge: 'Best Value' },
      { id: 304, title: 'Flight Delay Cover', price: 'R99 p/m', badge: null },
      { id: 305, title: 'Adventure Sports Add-on', price: 'R149 p/m', badge: 'Adventure' },
      { id: 306, title: 'Emergency Assistance', price: 'R219 p/m', badge: 'Priority' },
    ],
  },
};

const defaultCollection = collectionData['mobile-contracts'];

export default function MockDataPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const collection = searchParams.get('collection') || 'mobile-contracts';
  const selectedCollection = collectionData[collection] || defaultCollection;
  const images = collectionImages[collection] || collectionImages['mobile-contracts'];

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
        <div>
          <h1 className="mock-mobile-contracts-title">{selectedCollection.title}</h1>
          <p className="mock-mobile-contracts-subtitle">{selectedCollection.subtitle}</p>
        </div>
      </header>

      <div className="mock-mobile-contracts-grid">
        {selectedCollection.items.map((contract, index) => (
          <ProductListCard
            key={contract.id}
            id={contract.id}
            title={contract.title}
            price={contract.price}
            badge={contract.badge}
            imageUrl={images[index % images.length]}
          />
        ))}
      </div>
    </div>
  );
}

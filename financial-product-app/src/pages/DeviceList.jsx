import './css/DeviceList.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import mockMobileImage from '../assets/mockmobile.jpg';
import mockMobileImage2 from '../assets/mockmobile2.jpg';
import mockMobileImage3 from '../assets/mockmobile3.jpg';
import mockLaptopImage1 from '../assets/mockLaptop1.jpg';

const PHONE_IMAGES = [mockMobileImage, mockMobileImage2, mockMobileImage3];

const PHONES = [
  { id: 'iphone-17', name: 'Apple iPhone 17 256GB 5G', pricePerMonth: 799, months: 36 },
  { id: 'iphone-17-pro', name: 'Apple iPhone 17 Pro 256GB 5G', pricePerMonth: 999, months: 36 },
  { id: 'galaxy-s25', name: 'Samsung Galaxy S25 256GB 5G', pricePerMonth: 749, months: 36 },
  { id: 'galaxy-a56', name: 'Samsung Galaxy A56 128GB 5G', pricePerMonth: 449, months: 24 },
  { id: 'honor-400', name: 'HONOR 400 512GB 5G', pricePerMonth: 399, months: 36 },
  { id: 'pixel-10', name: 'Google Pixel 10 128GB 5G', pricePerMonth: 599, months: 36 },
];

const LAPTOPS = [
  { id: 'macbook-air-15', name: 'Apple MacBook Air 15" M4 256GB', pricePerMonth: 1099, months: 36 },
  { id: 'dell-xps-14', name: 'Dell XPS 14 512GB', pricePerMonth: 899, months: 36 },
  { id: 'lenovo-ideapad', name: 'Lenovo IdeaPad Slim 3 256GB', pricePerMonth: 549, months: 24 },
];

export default function DeviceList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const phones = PHONES.filter((d) => d.name.toLowerCase().includes(query));
  const laptops = LAPTOPS.filter((d) => d.name.toLowerCase().includes(query));

  return (
    <div className="device-list">
      <Header />

      <div className="device-list__inner">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">
            <MdArrowBack />
          </button>
          <h1 className="device-list__title">Devices</h1>
        </div>

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search devices"
        />

        {phones.length > 0 && (
          <>
            <h2 className="device-list__section-title">Phones</h2>
            <div className="device-list__grid">
              {phones.map((device) => (
                <ProductCard
                  key={device.id}
                  imageUrl={PHONE_IMAGES[PHONES.indexOf(device) % PHONE_IMAGES.length]}
                  title={device.name}
                  price={`R${device.pricePerMonth} PM x ${device.months}`}
                  onClick={() => navigate('/device-contract')}
                />
              ))}
            </div>
          </>
        )}

        {laptops.length > 0 && (
          <>
            <h2 className="device-list__section-title">Laptops</h2>
            <div className="device-list__grid">
              {laptops.map((device) => (
                <ProductCard
                  key={device.id}
                  imageUrl={mockLaptopImage1}
                  title={device.name}
                  price={`R${device.pricePerMonth} PM x ${device.months}`}
                  onClick={() => navigate('/device-contract')}
                />
              ))}
            </div>
          </>
        )}

        {phones.length === 0 && laptops.length === 0 && (
          <p className="device-list__empty">No devices match "{search}".</p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

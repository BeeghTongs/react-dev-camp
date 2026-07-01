import "./css/RecommendedPage.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductListCard from "../components/ProductListCard";
import BottomNav from "../components/BottomNav";
import SearchBar from "../components/SearchBar";
import { MdArrowBack } from "react-icons/md";
import { validateToken } from "../services/authService";


const recommendedProducts = [
  {
    id: 1,
    collection: 'mobile-contracts',
    title: "All Mobile Device Contracts",
    price: "R350 p/m",
    badge: "25% off",
  },
  {
    id: 2,
    collection: 'smart-home-protection',
    title: "Smart Home Protection",
    price: "R420 p/m",
    badge: "New",
  },
  {
    id: 3,
    collection: 'travel-cover-essentials',
    title: "Travel Cover Essentials",
    price: "R280 p/m",
    badge: null,
  },
];

export default function RecommendedPage() {
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    validateToken().then((valid) => {
      if (!valid) {
        localStorage.removeItem('jwt');
        localStorage.removeItem('auth-mode');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
      } else {
        setSessionChecked(true);
      }
    });
  }, [navigate]);

  if (!sessionChecked) return null;

  const query = search.trim().toLowerCase();
  const filteredProducts = recommendedProducts.filter((product) =>
    product.title.toLowerCase().includes(query)
  );

  return (
    <div className="recommended-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <MdArrowBack />
        </button>
        <div className="page-title">Recommended to you</div>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search recommended" />

      <div className="recommended-grid">
        {filteredProducts.map((product) => (
          <ProductListCard
            key={product.id}
            id={product.id}
            title={product.title}
            price={product.price}
            badge={product.badge}
            onClick={() => navigate(`/mock-data?collection=${product.collection}`)}
          />
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
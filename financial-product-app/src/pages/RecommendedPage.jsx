import "./css/RecommendedPage.css";
import { useNavigate } from "react-router-dom";
import ProductListCard from "../components/ProductListCard";
import { MdArrowBack } from "react-icons/md";


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

  return (
    <div className="recommended-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <MdArrowBack />
        </button>
        <div className="page-title">Recommended to you</div>
      </div>

      <div className="recommended-grid">
        {recommendedProducts.map((product) => (
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
    </div>
  );
}
import "./css/RecommendedPage.css";
import { useNavigate } from "react-router-dom";
import ProductListCard from "../components/ProductListCard";

const recommendedProducts = [
  {
    id: 1,
    title: "All Mobile Device Contracts",
    price: "R350 p/m",
    badge: "25% off",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    title: "Smart Home Protection",
    price: "R420 p/m",
    badge: "New",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    title: "Travel Cover Essentials",
    price: "R280 p/m",
    badge: null,
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
];

export default function RecommendedPage() {
  const navigate = useNavigate();

  return (
    <div className="recommended-page">
      <h1>Recommended for you</h1>

      <div className="recommended-grid">
        {recommendedProducts.map((product) => (
          <ProductListCard
            key={product.id}
            imageUrl={product.imageUrl}
            title={product.title}
            price={product.price}
            badge={product.badge}
            onClick={() => navigate(`/products/${product.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
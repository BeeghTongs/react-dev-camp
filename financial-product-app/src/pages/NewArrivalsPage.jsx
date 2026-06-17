import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import ProductListCard from "../components/ProductListCard";
import "./css/NewArrivalsPage.css";

function NewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/client/v1/products");
        const data = await response.json();

        const items = Array.isArray(data) ? data : data?.items || [];

        setProducts(items);
      } catch (err) {
        console.error("Failed to load products", err);
        setProducts([]);
      }
    }

    load();
  }, []);

  return (
    <div className="new-arrivals-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <MdArrowBack />
        </button>

        <div className="page-title">New arrivals</div>
      </div>

      <div className="new-arrivals-grid">
        {products.map((product) => (
          <ProductListCard
            key={product.id}
            id={product.id}
            title={product.name}
            price={product.price}
            onClick={() => navigate(`/products/${product.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default NewArrivalsPage;
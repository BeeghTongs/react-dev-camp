import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import ProductListCard from "../components/ProductListCard";
import BottomNav from "../components/BottomNav";
import SearchBar from "../components/SearchBar";
import "./css/NewArrivalsPage.css";
import { validateToken } from "../services/authService";

function NewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!sessionChecked) return;

    const jwt = localStorage.getItem('jwt');

    async function load() {
      try {
        const response = await fetch("/client/v1/products", {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const data = await response.json();

        const items = Array.isArray(data) ? data : data?.items || [];

        setProducts(items);
      } catch (err) {
        console.error("Failed to load products", err);
        setProducts([]);
      }
    }

    load();
  }, [sessionChecked]);

  if (!sessionChecked) return null;

  const query = search.trim().toLowerCase();
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(query)
  );

  return (
    <div className="new-arrivals-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <MdArrowBack />
        </button>

        <div className="page-title">New arrivals</div>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search new arrivals" />

      <div className="new-arrivals-grid">
        {filteredProducts.map((product) => (
          <ProductListCard
            key={product.id}
            id={product.id}
            title={product.name}
            price={`R${product.price} p/m`}
            onClick={() => navigate(`/products/${product.id}`)}
          />
        ))}
      </div>
      <BottomNav />
    </div>
  );
}

export default NewArrivalsPage;
import './ProductPage.css';
import ProductCard from '../components/ProductCard';
import headphone from '../assets/headphone.png';

function ProductPage() {
const products = [
  {
    id: 1,
    imageUrl: headphone,
    title: "Wireless Headphones",
    price: "R350 p/m",
  },
  {
    id: 2,
    imageUrl: headphone,
    title: "Gaming Mouse",
    price: "R120 p/m",
  },
  {
    id: 3,
    imageUrl: headphone,
    title: "Mechanical Keyboard",
    price: "R250 p/m",
  },
];

  return (
    <div>
      <header> Product Page </header>
      <div className="recommended-products">
            {products.map((product) => (
            <ProductCard
            key={product.id}
            imageUrl={product.imageUrl}
            title={product.title}
            price={product.price}
            />
        ))}
      </div>
    </div>
  );
}

export default ProductPage;
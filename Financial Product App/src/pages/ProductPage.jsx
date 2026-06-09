import './css/ProductPage.css';
import { useState } from 'react';
import ProductCard from '../components/ProductCard';
import AddToCart from '../components/AddToCart';
import headphone from '../assets/headphone.png';
import watch from '../assets/watch.png';

function ProductPage() {
  const products = [
    {
      id: 1,
      imageUrl: headphone,
      title: 'Wireless Headphones',
      price: 'R350 p/m',
    },
    {
      id: 2,
      imageUrl: headphone,
      title: 'Gaming Mouse',
      price: 'R120 p/m',
    },
    {
      id: 3,
      imageUrl: headphone,
      title: 'Mechanical Keyboard',
      price: 'R250 p/m',
    },
  ];

  const fullDesc = `Our comprehensive coverage ensures that your devices are protected against a wide range of mishaps. This plan includes accidental damage, theft, loss and extended hardware protection so you can focus on what matters.`;

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="product-page">
      <div className="page-header">
        <button className="back">←</button>
        <div className="page-title">Islamic Investment Product</div>
      </div>

      <div className="hero">
        <img src={watch} alt="Product main" />
        <div className="badge">25% OFF</div>
      </div>

      <h1 className="title">Islamic Investment Product</h1>
      {/* Description with expand/collapse */}
      <p className="description">{expanded ? fullDesc : `${fullDesc.slice(0,120)}...`}</p>

      {/* When collapsed show Read more under the description */}
      {!expanded && (
        <div>
          <button
            className="read-more"
            onClick={(e) => { e.preventDefault(); setExpanded(true); }}
            aria-expanded={expanded}
          >
            Read more
          </button>
        </div>
      )}

      {/* Sections that are shown only when expanded; Read less appears under Requirement */}
      {expanded && (
        <>
          <div className="section">
            <h3>Benefits</h3>
            <ul>
              <li>Theft and loss recovery</li>
              <li>Comprehensive coverage</li>
              <li>Hardware malfunction coverage</li>
            </ul>
          </div>

          <div className="section">
            <h3>Requirement</h3>
            <ul>
              <li>Minimum age of 18 years old</li>
              <li>South African resident</li>
              <li>Have an account with us in good standing</li>
            </ul>
            <div>
              <button
                className="read-more"
                onClick={(e) => { e.preventDefault(); setExpanded(false); }}
                aria-expanded={expanded}
              >
                Read less
              </button>
            </div>
          </div>
        </>
      )}

      <div className="related-header">Related product</div>
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

      <div className="product-footer">
        <div className="price">
          <div className="amount">R 350.00</div>
          <div className="per">per month</div>
        </div>
        <AddToCart />
      </div>
    </div>
  );
}

export default ProductPage;
import './css/ProductPage.css';
import { useEffect, useState } from 'react';
import { MdArrowBack } from "react-icons/md";
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import AddToCart from '../components/AddToCart';
import DiscountBadge from '../components/DiscountBadge';
import { getProductImage } from '../services/ImageService';
import { useNavigate } from 'react-router-dom';
import productCatalogue from '../assets/Products.json';
import watch from '../assets/watch.png';
import headphone from '../assets/headphone.png';
import keyboard from '../assets/keyboard.jpg';

const relatedProductImages = {
  1: headphone,
  2: watch,
  3: keyboard,
};

function ProductPage() {
  const { id } = useParams();
  const [expanded, setExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fulfilmentRequirements = {
    A: ['KYC check completed'],
    B: [
      'KYC check completed',
      'Fraud check',
      'Living status check',
      'Duplicate ID check',
    ],
    C: [
      'KYC check completed',
      'Fraud check',
      'Living status check',
      'Duplicate ID check',
      'Marital status check',
      'Credit check',
    ],
  };

  const readableFulfillmentRequirements = {
  A: ['Identity verification (KYC check completed)'],
  B: [
    'Identity verification (KYC check completed)',
    'Fraud check',
    'Life status verification',
    'Duplicate identity check',
  ],
  C: [
    'Identity verification (KYC check completed)',
    'Fraud screening',
    'Life status verification',
    'Duplicate identity check',
    'Marital status verification',
    'Credit history review',
  ],
};
  const products = [
    {
      id: 1,
      title: 'Wireless Headphones',
      price: 'R350 p/m',
    },
    {
      id: 2,
      title: 'Gaming Mouse',
      price: 'R120 p/m',
    },
    {
      id: 3,
      title: 'Mechanical Keyboard',
      price: 'R250 p/m',
    },
  ];

  useEffect(() => {
    async function fetchProduct() {
      try{
        const response = await fetch(`/client/v1/products/${id}`);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setProduct(data);
      }
      catch(error){
        console.error('Failed to load product:', error);
      }
      finally{
        setLoading(false);
    }
  }

    fetchProduct();
  }, [id]);

  useEffect(() => {
    let active = true;

    async function fetchProductImage() {
      const heroImage = await getProductImage(id);

      if (active) {
        setImageUrl(heroImage);
      }
    }

    fetchProductImage();

    const mediaQuery = window.matchMedia('(min-width: 900px)');
    const handleMedia = (event) => setIsDesktop(event.matches);

    handleMedia(mediaQuery);
    mediaQuery.addEventListener('change', handleMedia);

    return () => {
      active = false;
      mediaQuery.removeEventListener('change', handleMedia);
    };
  }, [id]);

  if (loading) {
    return <div className="product-page">Loading...</div>;
  }

  if (!product) {
    return <div className="product-page">Product not found</div>;
  }

  const fullDesc =
    product.description ||
    'No description available for this product.';
  const matchedProduct = productCatalogue.find((item) => item.name.toLowerCase() === product.name.toLowerCase());
  const requirementItems = readableFulfillmentRequirements[matchedProduct?.fulfilmentType] || [];



  return (
    <div className="product-page">
      <div className="page-header">
      <button className="back-btn" onClick={() => navigate(`/list`)}>
        <MdArrowBack />
      </button>
        <div className="page-title">{product.name}</div>
      </div>

      <div className="product-main">
        <div className="product-panel">
          <div className="product">
            {imageUrl ? <img src={imageUrl} alt="Product main" /> : <div className="hero-placeholder" aria-hidden="true" />}
            <DiscountBadge percentage={25} />
          </div>
          <h1 className="title">{product.name}</h1>
        </div>

        <div className="product-summary">
          <p className="description">{isDesktop || expanded ? fullDesc : `${product.description?.slice(0,120) || 'No description available.'}...`}</p>

          {/* When collapsed show Read more under the description on mobile only */}
          {!isDesktop && !expanded && (
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

          {/* Show requirement details on desktop always, and on mobile only when expanded */}
          {(isDesktop || expanded) && (
            <div className="section">
              <h3>Requirement</h3>
              <ul>
                {requirementItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {!isDesktop && (
                <div>
                  <button
                    className="read-more"
                    onClick={(e) => { e.preventDefault(); setExpanded(false); }}
                    aria-expanded={expanded}
                  >
                    Read less
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <div className="related-header">Related products</div>
      <div className="recommended-products">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            imageUrl={relatedProductImages[product.id]}
            title={product.title}
            price={product.price}
          />
        ))}
      </div>

          <div className="product-footer">
            <div className="price">
              {
                (() => {
                  // eslint-disable-next-line no-useless-assignment
                  let displayPrice = '';
                  if (typeof product.price === 'number') displayPrice = `R ${product.price.toFixed(2)}`;
                  else if (typeof product.price === 'string' && product.price.trim().startsWith('R')) displayPrice = product.price;
                  else displayPrice = `R ${product.price}`;
                  return <div className="amount">{displayPrice}</div>;
                })()
              }
              <div className="per">per month</div>
            </div>
            <AddToCart />
          </div>
    </div>
  );
}

export default ProductPage;
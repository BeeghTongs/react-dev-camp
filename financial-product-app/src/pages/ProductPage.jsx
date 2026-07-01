import './css/ProductPage.css';
import { useEffect, useRef, useState } from 'react';
import { MdArrowBack } from "react-icons/md";
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import AddToCart from '../components/AddToCart';
import DiscountBadge from '../components/DiscountBadge';
import { getProductImage } from '../services/ImageService';
import { useNavigate } from 'react-router-dom';
import productCatalogue from '../assets/Products.json';

function ProductPage() {
  const { id } = useParams();
  const [expanded, setExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedImages, setRelatedImages] = useState({});
  const fetchedRelatedImageIds = useRef(new Set());
  const navigate = useNavigate();
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

  // Related products: other live products that share this one's fulfilment
  // type (Products.json groups insurance/investment/device-contract types).
  useEffect(() => {
    if (!product) return;

    const matched = productCatalogue.find(
      (item) => item.name.toLowerCase() === product.name.toLowerCase()
    );
    const fulfilmentType = matched?.fulfilmentType;
    if (!fulfilmentType) return;

    let active = true;

    async function fetchRelated() {
      try {
        const response = await fetch('/client/v1/products');
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

        const data = await response.json();
        const items = Array.isArray(data) ? data : data?.items || [];

        const related = items.filter((item) => {
          if (String(item.id) === String(id)) return false;
          const itemMatch = productCatalogue.find(
            (cat) => cat.name.toLowerCase() === item.name.toLowerCase()
          );
          return itemMatch?.fulfilmentType === fulfilmentType;
        });

        if (active) setRelatedProducts(related);
      } catch (error) {
        console.error('Failed to load related products:', error);
        if (active) setRelatedProducts([]);
      }
    }

    fetchRelated();

    return () => {
      active = false;
    };
  }, [product, id]);

  useEffect(() => {
    relatedProducts.forEach((item) => {
      if (fetchedRelatedImageIds.current.has(item.id)) return;
      fetchedRelatedImageIds.current.add(item.id);
      getProductImage(item.id).then((url) => {
        setRelatedImages((prev) => ({ ...prev, [item.id]: url }));
      });
    });
  }, [relatedProducts]);

  if (loading) {
    return (
      <div className="product-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/list')} aria-label="Back">
            <MdArrowBack />
          </button>
        </div>
        <div className="skeleton skeleton--hero" />
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line-short" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page product-page--error">
        <p>Product not found</p>
        <button className="back-btn" onClick={() => navigate('/list')} aria-label="Back">
          <MdArrowBack />
        </button>
      </div>
    );
  }

  function formatDisplayPrice(price) {
    if (typeof price === 'number') return `R ${price.toFixed(2)}`;
    if (typeof price === 'string' && price.trim().startsWith('R')) return price;
    return `R ${price}`;
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

      {relatedProducts.length > 0 && (
        <>
          <div className="related-header">Related products</div>
          <div className="recommended-products">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                imageUrl={relatedImages[item.id]}
                title={item.name}
                price={formatDisplayPrice(item.price)}
                onClick={() => navigate(`/products/${item.id}`)}
              />
            ))}
          </div>
        </>
      )}

          <div className="product-footer">
            <div className="price">
              <div className="amount">{formatDisplayPrice(product.price)}</div>
              <div className="per">per month</div>
            </div>
            <AddToCart
              productId={id}
              name={product.name}
              price={product.price}
            />
          </div>
    </div>
  );
}

export default ProductPage;
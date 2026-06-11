import './css/ProductPage.css';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import AddToCart from '../components/AddToCart';
import DiscountBadge from '../components/DiscountBadge';
import { getProductImage } from '../services/ImageService';

function ProductPage() {
  const { id } = useParams();
  const [expanded, setExpanded] = useState(false);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [relatedImages, setRelatedImages] = useState({});
  const [loading, setLoading] = useState(true);
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

    async function fetchProductImages() {
      const [heroImage, related1, related2, related3] = await Promise.all([
        getProductImage(id),
        getProductImage(1),
        getProductImage(2),
        getProductImage(3),
      ]);

      if (active) {
        setImageUrl(heroImage);
        setRelatedImages({
          1: related1,
          2: related2,
          3: related3,
        });
      }
    }

    fetchProductImages();

    return () => {
      active = false;
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



  return (
    <div className="product-page">
      <div className="page-header">
        <button className="back">←</button>
        <div className="page-title">{product.name}</div>
      </div>

      <div className="product">
        {imageUrl ? <img src={imageUrl} alt="Product main" /> : <div className="hero-placeholder" aria-hidden="true" />}
        <DiscountBadge percentage={25} />
      </div>

      <h1 className="title">{product.name}</h1>
      {/* Description with expand/collapse */}
      <p className="description">{expanded ? fullDesc : `${product.description?.slice(0,120) || 'No description available.'}...`}</p>

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
          {/* <div className="section">
            <h3>Benefits</h3>
            <ul>
              <li>Theft and loss recovery</li>
              <li>Comprehensive coverage</li>
              <li>Hardware malfunction coverage</li>
            </ul>
          </div> */}

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

      <div className="related-header">Related products</div>
      <div className="recommended-products">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            imageUrl={relatedImages[product.id] || null}
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
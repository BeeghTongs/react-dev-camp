import './css/AddToCart.css';
import { useEffect, useState } from 'react';
import { MdCheckCircle } from 'react-icons/md';
import { validateToken, getProfileId } from '../services/authService';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function AddToCart({ productId, name, price }) {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => setShowSuccess(false), 2500);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  async function handleAddToCart() {
    // Guests have no JWT to validate — they're identified by their anonymous uid instead.
    if (localStorage.getItem('jwt')) {
      const valid = await validateToken();
      if (!valid) {
        console.warn('AddToCart: invalid or missing token');
        return;
      }
    }

    const userId = await getProfileId();
    if (!userId) {
      console.warn('AddToCart: could not resolve user id');
      return;
    }

    try {
      await addDoc(collection(db, 'cart'), {
        productId,
        name,
        price,
        userId,
        addedAt: serverTimestamp(),
      });
      setShowSuccess(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  return (
    <>
      <button className="add-button" onClick={handleAddToCart}>
        Add to wishlist
      </button>

      {showSuccess && (
        <div className="add-to-cart-toast" role="status">
          <MdCheckCircle className="add-to-cart-toast__icon" />
          Successfully added to wishlist
        </div>
      )}
    </>
  );
}

export default AddToCart;

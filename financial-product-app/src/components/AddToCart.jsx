import './css/AddToCart.css';
import { useEffect, useState } from 'react';
import { MdCheckCircle, MdInfo } from 'react-icons/md';
import { validateToken, getProfileId } from '../services/authService';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

function AddToCart({ productId, name, price }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAlreadyAdded, setShowAlreadyAdded] = useState(false);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => setShowSuccess(false), 2500);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  useEffect(() => {
    if (!showAlreadyAdded) return;
    const timer = setTimeout(() => setShowAlreadyAdded(false), 2500);
    return () => clearTimeout(timer);
  }, [showAlreadyAdded]);

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
      const existing = await getDocs(
        query(collection(db, 'cart'), where('userId', '==', userId), where('productId', '==', productId))
      );
      if (!existing.empty) {
        setShowAlreadyAdded(true);
        return;
      }

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

      {showAlreadyAdded && (
        <div className="add-to-cart-toast" role="status">
          <MdInfo className="add-to-cart-toast__icon add-to-cart-toast__icon--warning" />
          Already added to wishlist
        </div>
      )}
    </>
  );
}

export default AddToCart;

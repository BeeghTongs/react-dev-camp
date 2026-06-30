import './css/AddToCart.css';
import { validateToken, getProfileId } from '../services/authService';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function AddToCart({ productId, name, price }) {
  async function handleAddToCart() {
    const valid = await validateToken();
    if (!valid) {
      console.warn('AddToCart: invalid or missing token');
      return;
    }

    const userId = await getProfileId();
    if (!userId) {
      console.warn('AddToCart: could not resolve user id from profile');
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
      console.log(`Successfully added "${name}" to cart.`);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  return (
    <button className="add-button" onClick={handleAddToCart}>
      Add to wishlist
    </button>
  );
}

export default AddToCart;

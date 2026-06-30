import './css/AddToCart.css';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { validateToken } from '../services/authService';

function AddToCart({ productId, name, price }) {
  async function handleAddToCart() {
    const valid = await validateToken();
    if (!valid) {
      console.warn('AddToCart: invalid or missing token');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id || null;

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
      Add to cart
    </button>
  );
}

export default AddToCart;
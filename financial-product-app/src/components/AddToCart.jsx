import './css/AddToCart.css';
import { db } from '../services/firebase'; // adjust path if needed
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function AddToCart({ productId, name, price }) {
  async function handleAddToCart() {
    try {
      await addDoc(collection(db, 'cart'), {
        productId,
        name,
        price,
        addedAt: serverTimestamp(),
      });
      console.log(`Successfully added "${name}" (ID: ${productId}) to cart.`);
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
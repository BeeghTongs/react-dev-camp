import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function getProductImage(productId) {
  try {
    const imageRef = ref(storage, `${productId}.png`);

    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error(error);
    return null;
  }
}
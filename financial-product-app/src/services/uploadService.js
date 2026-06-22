import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadService(userId, documentType, file) {
  try {
    const fileRef = ref(
      storage,
      `kyc/${userId}/${documentType}/${file.name}`
    );

    await uploadBytes(fileRef, file);

    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
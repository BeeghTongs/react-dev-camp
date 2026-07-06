import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from './firebase';

export async function hasKycDocuments(userId) {
  if (!userId) return false;

  try {
    const result = await listAll(ref(storage, `kyc/${userId}`));
    return result.prefixes.length > 0 || result.items.length > 0;
  } catch {
    return false;
  }
}

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
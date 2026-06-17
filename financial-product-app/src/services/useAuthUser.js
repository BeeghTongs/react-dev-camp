import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export function useAuthUser() {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsub();
  }, []);

  return user;
}
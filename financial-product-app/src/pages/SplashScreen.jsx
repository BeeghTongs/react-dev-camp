import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import './css/SplashScreen.css';
import { MdFingerprint } from 'react-icons/md';// your fingerprint logo

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2500); // Redirect after 2.5 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
                    <MdFingerprint className="fingerprint-icon" />
        <h1 className="app-name">InsureTechGuard</h1>
      </div>
    </div>
  );
}
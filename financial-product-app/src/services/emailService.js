import emailjs from '@emailjs/browser';

const CODE_EXPIRATION_MINUTES = 15;

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationCode = async (email) => {
  const code = generateCode();
  const timestamp = Date.now();

  // Store code with timestamp
  sessionStorage.setItem(`otp_${email}`, JSON.stringify({
    code,
    timestamp
  }));

    await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
        email: email,
        verification_code: code,
        time: new Date(timestamp + CODE_EXPIRATION_MINUTES * 60 * 1000).toLocaleTimeString(),
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
    .then((res) => console.log('EmailJS success:', res))
    .catch((err) => console.error('EmailJS error:', err));

  return code;
};

export const verifyCode = (enteredCode, email) => {
  const storedData = sessionStorage.getItem(`otp_${email}`);
  
  if (!storedData) {
    return false;
  }

  try {
    const { code, timestamp } = JSON.parse(storedData);
    const currentTime = Date.now();
    const elapsedMinutes = (currentTime - timestamp) / (1000 * 60);

    if (enteredCode !== code) {
      return false;
    }

    if (elapsedMinutes > CODE_EXPIRATION_MINUTES) {
      sessionStorage.removeItem(`otp_${email}`);
      return false;
    }

    sessionStorage.removeItem(`otp_${email}`);
    return true;
  } catch (error) {
    console.error('Error verifying code:', error);
    return false;
  }
};
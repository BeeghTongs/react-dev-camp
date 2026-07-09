import emailjs from '@emailjs/browser';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase.js';

const sendVerificationCodeCallable = httpsCallable(functions, 'sendVerificationCode');
const verifyVerificationCodeCallable = httpsCallable(functions, 'verifyVerificationCode');

export const sendVerificationCode = async (email) => {
  await sendVerificationCodeCallable({ email });
};

export const verifyCode = async (enteredCode, email) => {
  try {
    const result = await verifyVerificationCodeCallable({ email, code: enteredCode });
    return result.data.valid;
  } catch (error) {
    console.error('Error verifying code:', error);
    return false;
  }
};

export async function sendOrderConfirmation(order) {
  const templateParams = {
    // Header
    order_id: order.id,                        // {{order_id}}
    email: order.customerEmail,                // {{email}}

    // {{#orders}} block — EmailJS handles arrays via JSON string
    orders: [
      {
        image_url: order.deviceImageUrl,       // {{image_url}}
        name: order.deviceName,                // {{name}}                           // {{units}}
        price: order.monthlyPrice,             // {{price}}
      }
    ],

    // Cost summary — must be a nested object, not flat "cost.x" keys, since
    // EmailJS resolves {{cost.shipping}} by walking into a `cost` object.
    cost: {
      shipping: order.deliveryFee, // {{cost.shipping}}
      total: order.total,          // {{cost.total}}
    },
  };

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );
    console.log('Order confirmation sent!');
  } catch (error) {
    console.error('Email failed:', error);
  }
}
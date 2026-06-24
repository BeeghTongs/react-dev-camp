// src/services/analytics.js
import { logEvent } from 'firebase/analytics';
import { analyticsPromise } from './firebase';

export const trackEvent = async (eventName, params = {}) => {
  const analytics = await analyticsPromise;
  if (!analytics) return;

  console.log(`[Analytics Event] ${eventName}`, params);
  
  logEvent(analytics, eventName, params);
};
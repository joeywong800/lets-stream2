import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore, initializeFirestore, memoryLocalCache } from 'firebase/firestore';

// Load Firebase configuration from environment variables with fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDAMQjalxUj6PQDvJ1t261GW0nfOAcLFxE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "badflix-128d1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "badflix-128d1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "badflix-128d1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "904552574274",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:904552574274:web:0e6850f6910341f4126cdb",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase with specified config or get existing instance
let app: ReturnType<typeof initializeApp>;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // If an app already exists, get that instance
  if (error instanceof Error && error.message.includes('duplicate-app')) {
    app = initializeApp();
  } else {
    throw error;
  }
}

export const auth = getAuth(app);

// Initialize analytics only if it's supported in the current environment
let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;

export const initAnalytics = async () => {
  if (await isSupported()) {
    analyticsInstance = getAnalytics(app);
    return analyticsInstance;
  }
  return null;
};

// Get the analytics instance, initializing it if necessary
export const getAnalyticsInstance = async () => {
  if (!analyticsInstance) {
    return initAnalytics();
  }
  return analyticsInstance;
};

// Initialize Firestore with memory-only cache to disable persistence
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
});

// Log Firebase configuration for debugging
// console.log("Firebase config:", firebaseConfig);
// if (!firebaseConfig.apiKey) {
//   console.warn("Firebase API key: Missing");
// } else {
//   console.log("Firebase API key: Using provided key");
// }

export { app };

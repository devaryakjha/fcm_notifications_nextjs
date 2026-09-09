export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export function hasFirebaseConfig(config = firebaseConfig, key = vapidKey) {
  return [...Object.values(config), key].every(
    (value) => Boolean(value?.trim()) && !value?.startsWith("your-"),
  );
}

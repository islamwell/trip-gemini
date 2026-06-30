import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';

// Helper to parse .env.local manually
function loadEnv() {
  try {
    const content = fs.readFileSync('.env.local', 'utf-8');
    const env = {};
    content.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        env[key] = value;
      }
    });
    return env;
  } catch (err) {
    console.error("Failed to load .env.local", err);
    return {};
  }
}

const env = loadEnv();

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

async function main() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log("Signing in as admin...");
  try {
    await signInWithEmailAndPassword(auth, "admin@nrq.no", "readquran114");
  } catch (err) {
    try {
      await signInWithEmailAndPassword(auth, "admin@nrq.no", "radquran114");
    } catch (e2) {
      console.error("Sign in failed:", e2);
      process.exit(1);
    }
  }
  console.log("Authenticated successfully.");

  console.log("Deleting d2 from packing_list...");
  await deleteDoc(doc(db, "packing_list", "d2"));
  console.log("Deleted successfully.");

  process.exit(0);
}

main().catch(console.error);

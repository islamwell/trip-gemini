import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, updateDoc, deleteField, doc } from 'firebase/firestore';
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
        // Remove surrounding quotes if present
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

  console.log("\n--- PACKING LIST CLEANUP ---");
  const packingSnap = await getDocs(collection(db, "packing_list"));
  const promises = [];
  packingSnap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.imageUrl) {
      console.log(`[${docSnap.id}] removing imageUrl...`);
      promises.push(updateDoc(doc(db, "packing_list", docSnap.id), {
        imageUrl: deleteField()
      }));
    }
  });

  if (promises.length > 0) {
    await Promise.all(promises);
    console.log(`Removed imageUrl from ${promises.length} items.`);
  } else {
    console.log("No items had an imageUrl to remove.");
  }
  process.exit(0);
}

main().catch(console.error);

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { defaultPackingList } from './src/data/packingList';
import { covenantData } from './src/data/covenant';
import fs from 'fs';
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
    }
    catch (err) {
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
    }
    catch (err) {
        try {
            await signInWithEmailAndPassword(auth, "admin@nrq.no", "radquran114");
        }
        catch (e2) {
            console.error("Sign in failed:", e2);
            process.exit(1);
        }
    }
    console.log("Authenticated successfully.");
    console.log("\nChecking packing list sync...");
    const packingSnap = await getDocs(collection(db, "packing_list"));
    const existingPacking = {};
    packingSnap.forEach(docSnap => {
        existingPacking[docSnap.id] = docSnap.data();
    });
    let packingCount = 0;
    for (const item of defaultPackingList) {
        const existing = existingPacking[item.id];
        // Write if missing, or if imageUrl is different/missing in database
        if (!existing || (item.imageUrl && (!existing.imageUrl || existing.imageUrl !== item.imageUrl))) {
            console.log(`-> Syncing packing item: [${item.id}] ${item.name.en}`);
            await setDoc(doc(db, 'packing_list', item.id), item, { merge: true });
            packingCount++;
        }
    }
    console.log(`Packed list sync complete. Synced ${packingCount} items.`);
    console.log("\nChecking covenant rules sync...");
    const covenantSnap = await getDocs(collection(db, "covenant"));
    const existingCovenant = {};
    covenantSnap.forEach(docSnap => {
        existingCovenant[docSnap.id] = docSnap.data();
    });
    let covenantCount = 0;
    for (const section of covenantData) {
        const docId = `section_${section.id}`;
        const existing = existingCovenant[docId];
        // Write if missing, or if quranAyat is different/missing in database
        if (!existing || (section.quranAyat && (!existing.quranAyat || existing.quranAyat !== section.quranAyat))) {
            console.log(`-> Syncing covenant section: [${docId}] ${section.title.en}`);
            await setDoc(doc(db, 'covenant', docId), section, { merge: true });
            covenantCount++;
        }
    }
    console.log(`Covenant rules sync complete. Synced ${covenantCount} sections.`);
    console.log("\nDatabase sync finalized successfully!");
}
main().catch(console.error);

import * as admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

let adminAuth: any = null;
let firebaseInitError: string | null = null;

const isDummyKey = !privateKey || privateKey.includes("...") || privateKey.includes("your-") || privateKey.includes("placeholder");

// Safeguard against multiple initializations during Next.js hot-reloading
if (admin.getApps().length === 0) {
  if (projectId && clientEmail && privateKey && !isDummyKey) {
    // Newline and quotes fix for private keys loaded from environment variables
    let formattedPrivateKey = privateKey;
    if (formattedPrivateKey.startsWith('"') && formattedPrivateKey.endsWith('"')) {
      try { formattedPrivateKey = JSON.parse(formattedPrivateKey); } catch (e) {}
    }
    // A PEM file doesn't have quotes, so we can safely strip all double and single quotes
    formattedPrivateKey = formattedPrivateKey.replace(/['"]/g, "").replace(/\\n/g, "\n").trim();

    try {
      admin.initializeApp({
        credential: (admin as any).credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
      });

      console.log("[Firebase Admin] Initialized successfully with credentials.");
    } catch (err: any) {
      firebaseInitError = `Initialization failed: ${err.message}`;
      console.error("[Firebase Admin] Initialization failed:", err.message);
    }
  } else {
    const missing = [];
    if (!projectId) missing.push("projectId");
    if (!clientEmail) missing.push("clientEmail");
    if (!privateKey) missing.push("privateKey");
    if (isDummyKey) missing.push("privateKey-is-dummy");
    firebaseInitError = `Missing or dummy credentials. Missing components: ${missing.join(", ")}`;
    console.warn(`[Firebase Admin] ${firebaseInitError}`);
  }
}

// Only expose auth service if an app is successfully initialized
if (admin.getApps().length > 0) {
  adminAuth = (admin as any).auth();
} else if (!firebaseInitError) {

  firebaseInitError = "No firebase apps exist after initialization check.";
}



export { adminAuth, firebaseInitError };

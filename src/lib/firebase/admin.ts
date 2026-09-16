import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import path from "path";
import fs from "fs";

if (typeof window !== "undefined") {
  throw new Error("firebase-admin must only be used in a server-side environment.");
}

function getServiceAccountCredential() {
  // 1. Individual server-side environment variables (Standard Vercel configuration)
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    };
  }

  // 2. Service account JSON string environment variable (raw JSON or base64)
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (rawJson) {
    try {
      const jsonString = rawJson.trim().startsWith("{")
        ? rawJson
        : Buffer.from(rawJson, "base64").toString("utf8");
      const parsed = JSON.parse(jsonString);
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      }
      return parsed;
    } catch {
      // Ignore JSON parse errors, proceed to filesystem fallback
    }
  }

  // 3. Filesystem path (Local development fallback)
  const keyPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH ||
    "./src/lib/firebase/credentials/service-account.json";

  if (keyPath) {
    const resolvedPath = path.isAbsolute(keyPath)
      ? keyPath
      : path.join(/*turbopackIgnore: true*/ process.cwd(), keyPath);

    if (fs.existsSync(resolvedPath)) {
      const fileContent = fs.readFileSync(resolvedPath, "utf8");
      return JSON.parse(fileContent);
    }
  }

  return null;
}

function initAdminApp(): App {
  const activeApps = getApps();
  if (activeApps.length > 0 && activeApps[0]) {
    return activeApps[0];
  }

  const credential = getServiceAccountCredential();

  if (credential) {
    return initializeApp({
      credential: cert(credential),
    });
  }

  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

export const adminApp = initAdminApp();

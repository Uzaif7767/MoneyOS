import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import path from "path";
import fs from "fs";

if (typeof window !== "undefined") {
  throw new Error("firebase-admin must only be used in a server-side environment.");
}

function getServiceAccountCredential() {
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

  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (rawJson) {
    return JSON.parse(rawJson);
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

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import path from "path";
import fs from "fs";

if (typeof window !== "undefined") {
  throw new Error("firebase-admin must only be used in a server-side environment.");
}

interface ServiceAccountCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

function getServiceAccountCredentials(): ServiceAccountCredentials {
  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  // 1. Check explicit production environment variables first (Standard Vercel configuration)
  if (clientEmail || rawPrivateKey || process.env.FIREBASE_PROJECT_ID) {
    const missing: string[] = [];
    if (!projectId) missing.push("FIREBASE_PROJECT_ID");
    if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
    if (!rawPrivateKey) missing.push("FIREBASE_PRIVATE_KEY");

    if (missing.length > 0) {
      throw new Error(
        `Firebase Admin SDK configuration error: Missing required environment variable(s): ${missing.join(
          ", "
        )}. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.`
      );
    }

    return {
      projectId: projectId!,
      clientEmail: clientEmail!,
      privateKey: rawPrivateKey!.replace(/\\n/g, "\n"),
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
      if (parsed.client_email && parsed.private_key && (parsed.project_id || projectId)) {
        return {
          projectId: parsed.project_id || projectId!,
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key.replace(/\\n/g, "\n"),
        };
      }
    } catch {
      // Ignore JSON parse errors, proceed to filesystem fallback
    }
  }

  // 3. Local filesystem path (Local development fallback only)
  const keyPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH ||
    "./src/lib/firebase/credentials/service-account.json";

  if (keyPath) {
    const resolvedPath = path.isAbsolute(keyPath)
      ? keyPath
      : path.join(/*turbopackIgnore: true*/ process.cwd(), keyPath);

    if (fs.existsSync(resolvedPath)) {
      try {
        const fileContent = fs.readFileSync(resolvedPath, "utf8");
        const parsed = JSON.parse(fileContent);
        if (parsed.client_email && parsed.private_key && (parsed.project_id || projectId)) {
          return {
            projectId: parsed.project_id || projectId!,
            clientEmail: parsed.client_email,
            privateKey: parsed.private_key.replace(/\\n/g, "\n"),
          };
        }
      } catch {
        // File exists but could not be parsed
      }
    }
  }

  // 4. No valid credentials found: Throw explicit error identifying missing variables
  throw new Error(
    "Firebase Admin SDK initialization failed: Could not load credentials. " +
      "Missing production environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY. " +
      "Ensure these environment variables are configured in Vercel project settings."
  );
}

function initAdminApp(): App {
  const activeApps = getApps();
  if (activeApps.length > 0 && activeApps[0]) {
    return activeApps[0];
  }

  const credentials = getServiceAccountCredentials();

  return initializeApp({
    credential: cert({
      projectId: credentials.projectId,
      clientEmail: credentials.clientEmail,
      privateKey: credentials.privateKey,
    }),
  });
}

export const adminApp = initAdminApp();


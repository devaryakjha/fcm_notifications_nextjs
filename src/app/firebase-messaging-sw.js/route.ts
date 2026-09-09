import { SDK_VERSION } from "firebase/app";
import { firebaseConfig, hasFirebaseConfig } from "@/utils/firebase/config";

export const dynamic = "force-dynamic";

export function GET() {
  if (!hasFirebaseConfig()) {
    return new Response("Firebase configuration is missing.", { status: 503 });
  }

  // Use the same public configuration and SDK version as the page.
  // FCM displays notification payloads and handles fcm_options.link itself.
  // Adding showNotification here would display a duplicate notification.
  return new Response(`
importScripts("https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-messaging-compat.js");
firebase.initializeApp(${JSON.stringify(firebaseConfig)});
firebase.messaging();
`, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

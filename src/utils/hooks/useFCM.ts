"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FirebaseError, getApp, getApps, initializeApp } from "firebase/app";
import {
  getMessaging, isSupported, onMessage, onRegistered, onUnregistered, register,
  type MessagePayload, type Messaging,
} from "firebase/messaging";
import { firebaseConfig, hasFirebaseConfig, vapidKey } from "../firebase/config";

export default function useFCM() {
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const [installationId, setInstallationId] = useState("");
  const [status, setStatus] = useState("Checking browser support…");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const messaging = useRef<Messaging | null>(null);
  const registering = useRef(false);

  const enable = useCallback(async () => {
    if (!messaging.current || registering.current) return;
    registering.current = true;
    setBusy(true);
    setInstallationId("");
    try {
      // Keep this request directly in the button's user gesture.
      const permission = Notification.permission === "default"
        ? await Notification.requestPermission() : Notification.permission;
      if (permission !== "granted") {
        setStatus(permission === "denied"
          ? "Notifications are blocked. Allow them in this site's browser settings, then retry."
          : "Permission was dismissed. Select Enable notifications to try again.");
        return;
      }
      setStatus("Registering this browser…");
      await register(messaging.current, { vapidKey });
    } catch (error) {
      const reason = error instanceof FirebaseError ? error.code
        : error instanceof Error ? error.name : "unknown error";
      setStatus(`Registration failed (${reason}). Check your Firebase config, public VAPID key, FCM Registration API, and network, then retry.`);
    } finally {
      registering.current = false;
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const unsubscribers: (() => void)[] = [];
    async function setup() {
      try {
        if (!window.isSecureContext || !(await isSupported())) {
          if (!cancelled) setStatus("This browser cannot use web push. Use a supported browser over HTTPS (or localhost). On iOS, open an installed Home Screen web app.");
          return;
        }
        if (cancelled) return;
        if (!hasFirebaseConfig()) {
          setStatus("Add your Firebase web config and public VAPID key to .env.local, then restart the server. See README for setup.");
          return;
        }
        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        messaging.current = getMessaging(app);
        unsubscribers.push(
          onMessage(messaging.current, (payload) => {
            // Keep a bounded, newest-first session log without mutating React state.
            setMessages((previous) => [payload, ...previous].slice(0, 50));
          }),
          onRegistered(messaging.current, (fid) => {
            setInstallationId(fid);
            setStatus("Registered. Send a test message to this installation ID.");
          }),
          onUnregistered(messaging.current, () => {
            setInstallationId("");
            setStatus("Registration ended. Enable notifications to register again.");
          }),
        );
        setReady(true);
        if (Notification.permission === "granted") await enable();
        else setStatus(Notification.permission === "denied"
          ? "Notifications are blocked. Allow them in this site's browser settings, then retry."
          : "Enable notifications to register this browser. Nothing is sent automatically.");
      } catch {
        if (!cancelled) setStatus("Could not initialize messaging. Check browser storage access and reload.");
      }
    }
    void setup();
    return () => {
      cancelled = true;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      messaging.current = null;
    };
  }, [enable]);

  return { messages, installationId, status, ready, busy, enable };
}

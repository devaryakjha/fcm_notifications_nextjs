# Validation — 2026-09-09

This record separates actual FCM delivery from static and browser-only checks.
The update is **not yet fully verified**: visible macOS alerts and real
notification clicks still require the OS settings described below.

## Environment

- macOS 27.0, Apple Silicon.
- Google Chrome 153.0.8010.37 (installed app version), normal profile.
- Node.js 26.3.0 and npm 11.16.0 locally; CI targets Node.js 24 LTS.
- Next.js 16.3.4, Firebase 12.18.0, React/React DOM 19.2.8.
- TypeScript 6.0.3, ESLint 9.39.5, eslint-config-next 16.3.4.
- Next.js production build served by `next start` through a temporary HTTPS
  Cloudflare Quick Tunnel (cloudflared 2026.6.0).
- Fresh, authorized Firebase test project on Spark ($0/month), with a Web app
  and public VAPID key. Analytics and Gemini were disabled during creation.
  No production project or public recipient group was used.

## Passed

- Clean `npm ci`, lint, config regression test, production build, and explicit
  TypeScript check. Builds passed both with and without Firebase configuration.
- `npm audit` reported zero vulnerabilities at install; `npm audit --omit=dev`
  also reported zero. This is a point-in-time dependency audit, not a security
  guarantee. ESLint 9 is out of support; see the README compatibility note.
- Missing config: real page shows setup guidance and a disabled enable button;
  the worker endpoint returns HTTP 503.
- Configured worker: HTTP 200, JavaScript content type, `Cache-Control: no-store`,
  shared project configuration, and compat SDK 12.18.0.
- Permission handling: Chrome's dismissed permission request produced retry
  guidance. The in-app browser's denied permission produced blocked guidance.
- Chrome registration: the SDK returned a Firebase installation ID; the worker
  was activated and `pushManager.getSubscription()` returned a subscription.
  Reload and manual refresh retained the registered FID.
- Actual foreground delivery from the Firebase console to only that FID:
  `FCM foreground test 2` and `FCM foreground test 3` appeared in the page table,
  newest first. Refreshing registration did not reorder or discard them.
- Actual background receipt: after switching Chrome to another tab, the live
  worker's `getNotifications()` list contained exactly one `FCM background test 1`
  notification. The foreground table did not gain a row for it before a click.
  This was a real FCM message, not a locally dispatched push event.
- The console's test-device dialog explicitly accepts Firebase installation IDs.

## Pending / limits

- **Visible OS notification and real click tests:** macOS lists Google Chrome
  notifications as **Off**, and notifications while mirroring/sharing as
  **Notifications Off**. The browser stored the background notification, but
  that does not prove an OS alert was visible. Approval was requested before
  temporarily changing those settings. Open-tab focus and closed-tab navigation
  have not been claimed as passed.
- Explicit HTTP v1 `message.fid` + `webpush.fcm_options.link` sending has been
  checked against the current official reference, but not executed. Actual test
  sends above used the Firebase console. Cloud Shell credential authorization
  was not granted by the agent without user confirmation.
- Unsupported-browser guidance is present; no separate unsupported physical
  browser/device was tested. The in-app browser denied notifications and was
  used for missing-config/blocked-state UI checks only.
- No iOS/Safari, browser-quit delivery, PWA installation, or offline delivery test.
- Early test sends performed during browser focus/reload setup were not counted
  as foreground passes; the later table observations above are the evidence.

## Complete before declaring full verification

1. With approval, temporarily enable Chrome's macOS notifications and allow
   alerts during screen sharing (or test outside screen sharing).
2. Send one fresh notification while the app tab is hidden; observe one OS alert.
3. Click it with the app tab open and confirm focus; repeat with the page closed
   and confirm the intended HTTPS URL opens. For explicit link behavior, send
   the README HTTP v1 request from an authorized sender.
4. Restore any changed OS settings and stop the temporary tunnel/server.
5. Record these results, verify remote checks, and only then remove the
   task-owned temporary clone.

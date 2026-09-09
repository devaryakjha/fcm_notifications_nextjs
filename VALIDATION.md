# Validation — 2026-09-09

This record separates actual FCM delivery from static and browser-only checks.
Real foreground delivery, visible background alerts, HTTP v1 sending, and
user-assisted notification clicks were exercised. The caveats below limit these
results to this browser/test session.

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

## HTTP v1 and native notification checks

- An authorized Google Cloud Shell session used the test-project account and
  HTTP v1 `message.fid` with an explicit same-origin HTTPS
  `webpush.fcm_options.link`. FCM returned message names for the requests.
  Access tokens stayed inside the shell and were not printed or saved.
- With Chrome's OS alerts temporarily enabled, Notification Centre showed the
  named `FCM HTTP background-open-2` alert with its expected title and body.
- Open-page click: the user confirmed clicking `FCM HTTP click-open`; the browser
  then showed the existing app tab focused and exactly one matching table row.
- Closed-page click: the app tab was closed, leaving `about:blank`. After a fresh
  send and the user's click on the regular FCM alert, the browser showed a new
  focused tab at the exact requested HTTPS origin. The user confirmed the
  regular notification opened the site. The newly opened page showed zero rows,
  so cold-start click-payload delivery to the table is **not** claimed.
- Native automation could inspect alerts but did not reliably activate them;
  actual clicks above were performed by the user, with browser state inspected
  afterward. An early attempt stayed on `about:blank` and was not counted.
- Both Chrome OS notification entries were restored to Off. The second entry's
  temporary alert style was restored, and notifications during screen sharing
  were restored to Notifications Off.

## Limits and observed caveat

- A separate generic Chrome alert, "This site has been updated in the
  background", appeared during the repeated sends/worker inspection. The user
  confirmed it did not open the site, while the regular notification did.
  Its exact triggering push was not isolated. This session therefore does not
  prove that extra generic browser alerts can never occur. It did not show two
  copies of a named FCM notification, and the app has no custom
  `showNotification()` call.
- Chrome emits that generic fallback when a push finishes without displaying a
  notification; see [Chrome's push-event documentation](https://web.dev/articles/push-notifications-handling-messages).
  Data-only background messages intentionally have no custom display handler in
  this example. Use notification payloads for the documented visible-alert test.
- Unsupported-browser guidance is present; no separate unsupported physical
  browser/device was tested. The in-app browser denied notifications and was
  used for missing-config/blocked-state UI checks only.
- No iOS/Safari, browser-quit delivery, PWA installation, or offline delivery test.
- Early sends during browser focus/reload setup were not counted as foreground
  passes. These results do not establish delivery guarantees or timing bounds.

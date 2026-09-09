# Firebase Cloud Messaging + Next.js

A small App Router example: register a browser, copy its Firebase installation ID
(FID), and inspect incoming messages in a table. No database, accounts, analytics,
or public send endpoint. Messages stay in memory (latest 50); reloading clears them.

## Setup

1. Use Node.js 24 LTS (`nvm use`) and npm.
2. Create or choose a Firebase **test** project and register a Web app in
   **Project settings → General → Your apps**. Analytics and Hosting are optional;
   this example needs neither. FCM itself requires no paid plan.
3. In **Project settings → Cloud Messaging → Web Push certificates**, generate
   a key pair or use your existing one. Copy only the **public** VAPID key.
4. Enable the **FCM Registration API** and **Firebase Cloud Messaging API** for
   that same project if they are not already enabled.
5. Set up the app:

   ```sh
   git clone https://github.com/devaryakjha/fcm_notifications_nextjs.git
   cd fcm_notifications_nextjs
   npm ci
   cp .env.example .env.local
   # Fill in all five values in .env.local from your test project.
   npm run dev
   ```

6. Open [localhost:3000](http://localhost:3000). Select **Enable notifications**
   and allow the browser prompt. The page shows a registered **FID**.
   Permission prompts occur only after a click; an already allowed browser
   re-registers on startup. Denied permission requires changing site settings
   before retrying. Unsupported browsers and missing config show setup guidance.

Use HTTPS outside localhost. On iOS/iPadOS, web push requires a supported Home
Screen web app; this repository does not include an installable PWA manifest.
Private browsing, blocked storage, browser policy, and OS notification settings
can prevent registration or notification display.

All `NEXT_PUBLIC_` values are public browser configuration, including the public
VAPID key. Never put private VAPID keys, service-account JSON, or OAuth access
tokens there. Keep recipient IDs private and out of commits/logs. Use credentials
from the same Firebase project for registration and sending.

## Service worker and registration

`src/app/firebase-messaging-sw.js/route.ts` serves `/firebase-messaging-sw.js` as
JavaScript without caching. It uses the same public configuration and exact
Firebase version as the page, with compat scripts from Google's CDN. There is no
second config to edit in `public/`. Allow `www.gstatic.com` if you use a CSP.

The SDK registers its default worker. `register()` uses the public VAPID key;
`onRegistered()` supplies the FID for targeting. This example does not mix those
APIs with deprecated `getToken()` calls. If migrating an existing backend, replace
its old token for the instance after receiving the registered FID.

The foreground `onMessage()` listener adds payloads to the table. In the
background, the SDK displays **notification payloads** automatically and handles
`webpush.fcm_options.link` clicks. No extra `showNotification()` call means no
double display. Data-only messages appear in the foreground but intentionally
have no custom background UI. Use notification + data for the test below.

Keep `.env.local` present for both build and server execution. Next.js embeds
public variables at build time: rebuild and restart after changing projects or
keys. This worker route needs a Next.js server deployment; static export alone
is not supported.

## Send one test notification

Send only to your own registered test browser. Use the FID shown on the page as
`message.fid`. A FID is not a legacy FCM registration token. The console's **Send test message** dialog accepts installation IDs and legacy
tokens (checked on 2026-09-09). The HTTP v1 request below uses the explicit
current target field.

For a quick test without sender credentials on your machine, open **DevOps and
engagement → Messaging → Create your first campaign → Firebase Notification
messages**. Enter a title/body, select **Send test message**, add only your own
FID, select it, and click **Test campaign**. Do not publish a campaign to all
users. The console uses its own notification-click defaults; use HTTP v1 below
to set an explicit HTTPS `fcm_options.link`.

On a trusted machine with the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install),
sign in to the test project account (`gcloud auth login`). The sender needs
`cloudmessaging.messages.create`, for example through the **Firebase Cloud
Messaging API Admin** role. Don't put sender credentials in this Next.js app.

Create `test-message.json` locally (ignored by Git), replacing the FID and URL:

```json
{
  "message": {
    "fid": "YOUR_REGISTERED_INSTALLATION_ID",
    "notification": {
      "title": "FCM reference test",
      "body": "One test message to my browser"
    },
    "data": { "test": "foreground-1" },
    "webpush": {
      "fcm_options": { "link": "https://YOUR_TEST_ORIGIN/" }
    }
  }
}
```

For a local foreground/background display test, omit `webpush` until you have
an HTTPS test origin. Firebase documents HTTPS-only click URLs; don't claim a
localhost click test proves HTTPS behavior. Use an approved HTTPS deployment or
trusted local HTTPS setup for the complete click test.

```sh
PROJECT_ID='your-test-project-id'
ACCESS_TOKEN="$(gcloud auth print-access-token)"
# Feed the authorization header over stdin rather than command-line arguments.
curl --fail-with-body --config - <<EOF_CURL
url = "https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send"
request = "POST"
header = "Authorization: Bearer ${ACCESS_TOKEN}"
header = "Content-Type: application/json"
data-binary = "@test-message.json"
EOF_CURL
unset ACCESS_TOKEN
```

A returned message name confirms **FCM accepted the request**, not delivery.

1. **Foreground:** focus the app, send the request, and confirm exactly one new
   row with `foreground-1`. Send a second distinct value and confirm newest-first
   ordering without rows changing order on unrelated updates.
2. **Background:** switch away, send `background-1`, and confirm exactly one OS
   notification. Check OS notification settings/Do Not Disturb if absent.
3. **Click:** with the HTTPS page open, click the notification and confirm that
   tab gains focus. Then close the page, send another notification, and verify
   clicking opens the expected URL. Keep the browser running for these tests.
4. **Recovery:** reload the app and confirm registration returns. Deny permission
   in site settings, reload, and verify the blocked guidance without a crash.

There is no FCM delivery emulator in this example. Mocked payloads, a generated
worker, a successful build, or a successful send response do not prove delivery.

## Checks and verified versions

```sh
npm run lint
npm test
npm run build
npm run typecheck
npm start
```

Versions pinned on **2026-09-09**: Next.js **16.3.4**, Firebase **12.18.0**,
React/React DOM **19.2.8**, TypeScript **6.0.3**. ESLint **9.39.5** remains pinned
because Next.js 16.3.4's lint plugins declare ESLint 9 peer ranges; ESLint 9 is
out of support. TypeScript 7 is not yet supported by this lint toolchain. Upgrade
these together when Next.js's lint dependencies support the newer versions.

See [VALIDATION.md](VALIDATION.md) for actual checks, browser version, and delivery
results. CI runs lint, the small config regression check, and the production
build using Node.js 24. It cannot verify FCM delivery without a real browser and
an authorized Firebase project.

## Official references

- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Firebase web registration and FIDs](https://firebase.google.com/docs/cloud-messaging/web/get-started)
- [Message delivery and notification clicks](https://firebase.google.com/docs/cloud-messaging/web/receive-messages)
- [HTTP v1 message fields, including `fid`](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages)
- [Authorize HTTP v1 send requests](https://firebase.google.com/docs/cloud-messaging/send/v1-api)
- [Firebase JS release notes](https://firebase.google.com/support/release-notes/js)

## License

[MIT](LICENSE). The original author's README declared MIT in commit `9840ee4`
(2023-09-18), but no LICENSE file existed in the repository history. This refresh
adds that missing text with the original author/year, rather than changing the
stated license. The app began with Create Next App; dependencies retain their
own licenses.

By [Aryakumar Jha](https://github.com/devaryakjha). Contributions via pull requests
are welcome.

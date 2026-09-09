"use client";

import useFCM from "@/utils/hooks/useFCM";

export default function Home() {
  const { messages, installationId, status, ready, busy, enable } = useFCM();
  return (
    <main>
      <h1>Firebase Cloud Messaging + Next.js</h1>
      <p>A small web push example. Register this browser, then send a test from your server.</p>
      <p role="status">{status}</p>
      <button disabled={!ready || busy} onClick={() => void enable()}>
        {busy ? "Registering…" : installationId ? "Refresh registration" : "Enable notifications"}
      </button>
      {installationId && (
        <section aria-label="Message target">
          <label htmlFor="installation-id">Firebase installation ID (FID)</label>
          <input id="installation-id" readOnly value={installationId} onFocus={(event) => event.target.select()} />
          <p>Use this ID as <code>message.fid</code> in the README test request. Keep it private.</p>
        </section>
      )}
      <h2>Received messages ({messages.length})</h2>
      <p>Latest 50 messages for this page session, newest first. Keep this tab focused for foreground delivery.</p>
      <div className="table-scroll">
        <table>
          <caption>Foreground messages and messages forwarded by FCM on a notification click</caption>
          <thead><tr><th scope="col">From</th><th scope="col">Title</th><th scope="col">Body</th><th scope="col">Data</th></tr></thead>
          <tbody>
            {!messages.length && <tr><td colSpan={4}>No messages received yet.</td></tr>}
            {messages.map((message, index) => (
              <tr key={`${message.messageId}-${index}`}>
                <td>{message.from || "—"}</td>
                <td>{message.notification?.title || "—"}</td>
                <td>{message.notification?.body || "—"}</td>
                <td><pre>{JSON.stringify(message.data ?? {}, null, 2)}</pre></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

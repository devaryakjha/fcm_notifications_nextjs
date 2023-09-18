"use client";
import useFCM from "@/utils/hooks/useFCM";

export default function Home() {
  const { messages, fcmToken } = useFCM();

  return (
    <div className="container flex flex-col items-center">
      <h1>FCM</h1>
      <p>FCM Token: {fcmToken}</p>
      <table>
        <thead>
          <tr>
            <th>index</th>
            <th>from</th>
            <th>title</th>
            <th>body</th>
            <th>data</th>
          </tr>
        </thead>
        <tbody>
          {messages.reverse().map((message, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{message.from}</td>
              <td>{message.notification?.title}</td>
              <td>{message.notification?.body}</td>
              <td>
                <pre>{JSON.stringify(message.data, null, 2)}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

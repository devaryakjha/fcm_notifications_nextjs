"use client";
import useFCM from "@/utils/hooks/useFCM";

export default function Home() {
  const { messages, fcmToken } = useFCM();
  return (
    <div>
      {" "}
      {fcmToken} {JSON.stringify(messages)}
    </div>
  );
}

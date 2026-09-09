import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FCM + Next.js example",
  description: "Register a browser and receive Firebase Cloud Messaging notifications.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}

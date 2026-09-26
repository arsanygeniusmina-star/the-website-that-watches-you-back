import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BEHAVIOR — The Website That Watches You Back",
  description: "An experimental website that turns interaction behavior into a digital specimen.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Campus Adda | Student Social Network",
  description: "A professional social startup for Indian students.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="app-shell h-full bg-background text-foreground">
        <Sidebar />
        <main className="app-surface flex min-h-screen flex-col overflow-x-hidden overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom))] lg:ml-72 lg:pb-0">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}

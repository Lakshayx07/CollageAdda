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
      <body className="min-h-full flex flex-col bg-background">
        {/* Desktop Sidebar - visible lg+ */}
        <Sidebar />

        {/* Main content - offset by sidebar on desktop */}
        <main className="flex-1 overflow-x-hidden pb-20 lg:pb-0 lg:ml-64">
          {children}
        </main>

        {/* Mobile Bottom Nav - hidden on lg+ */}
        <BottomNav />
      </body>
    </html>
  );
}

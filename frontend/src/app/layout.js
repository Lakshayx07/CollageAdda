import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar";
import { ThemeProvider } from "../context/ThemeContext";
import QueryProvider from "../context/QueryProvider";
import { SocketProvider } from "../context/SocketProvider";
import { SidebarProvider } from "../context/SidebarContext";
import MainLayoutWrapper from "../components/MainLayoutWrapper";
import Script from "next/script";

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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
      </head>
      <body className="app-shell h-full bg-background text-foreground transition-colors duration-300">
        <ThemeProvider>
          <QueryProvider>
            <SocketProvider>
              <SidebarProvider>
                <Sidebar />
                <MainLayoutWrapper>
                  {children}
                </MainLayoutWrapper>
                <BottomNav />
              </SidebarProvider>
            </SocketProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

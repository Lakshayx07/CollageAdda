import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar";
import { ThemeProvider } from "../context/ThemeContext";
import QueryProvider from "../context/QueryProvider";
import { SocketProvider } from "../context/SocketProvider";
import { SidebarProvider } from "../context/SidebarContext";
import MainLayoutWrapper from "../components/MainLayoutWrapper";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body
        className="app-shell h-full bg-background text-foreground transition-colors duration-300"
        style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
      >
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

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar";
import { ThemeProvider } from "../context/ThemeContext";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  localStorage.setItem("campus_adda_theme", "light");
                  document.documentElement.setAttribute("data-theme", "light");
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="app-shell h-full bg-background text-foreground transition-colors duration-300">
        <ThemeProvider>
          <Sidebar />
          <main className="app-surface flex min-h-screen flex-col overflow-x-hidden overflow-y-auto pb-[calc(8.5rem+env(safe-area-inset-bottom))] lg:pb-0 [&:has([data-page=welcome-tour])]:ml-0 [&:has([data-page=welcome-tour])]:pb-0 lg:ml-72">
            {children}
          </main>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}

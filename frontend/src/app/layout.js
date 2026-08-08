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
  metadataBase: new URL('https://www.campusadda.social'),
  title: {
    default: "Campus Adda — Official Student Social Network",
    template: "%s | Campus Adda",
  },
  description: "Campus Adda is the official student social network for college students in India. Connect with peers, explore campus trends, events, discussions & communities.",
  keywords: ["Campus Adda", "CampusAdda", "student social network", "college network India", "campus community", "student collaboration"],
  authors: [{ name: "Campus Adda Team" }],
  creator: "Campus Adda",
  publisher: "Campus Adda",
  alternates: {
    canonical: "https://www.campusadda.social",
  },
  verification: {
    google: "A4XYapdxAtUPtUxCDxxMKNmj5vB9j2lSOoXKJGdR9yU",
    other: {
      "google-site-verification": "A4XYapdxAtUPtUxCDxxMKNmj5vB9j2lSOoXKJGdR9yU",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.campusadda.social",
    title: "Campus Adda — Official Student Social Network",
    description: "Campus Adda is the official student social network for college students in India. Connect with peers, explore campus trends, events & communities.",
    siteName: "Campus Adda",
    images: [
      {
        url: "https://www.campusadda.social/logo.png",
        width: 1024,
        height: 1024,
        alt: "Campus Adda Official Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Adda — Official Student Social Network",
    description: "Campus Adda is the official student social network for college students in India.",
    images: ["https://www.campusadda.social/logo.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: [
      { url: "/icon.png", type: "image/png" },
      { url: "/logo.png" },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.campusadda.social/#organization',
      'name': 'Campus Adda',
      'alternateName': ['CampusAdda', 'Campus Adda Student Social Network'],
      'url': 'https://www.campusadda.social',
      'logo': 'https://www.campusadda.social/logo.png',
      'sameAs': [
        'https://campusadda.social',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.campusadda.social/#website',
      'url': 'https://www.campusadda.social',
      'name': 'Campus Adda',
      'description': 'Campus Adda is the official student social network for college students in India.',
      'publisher': { '@id': 'https://www.campusadda.social/#organization' },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="google-site-verification" content="A4XYapdxAtUPtUxCDxxMKNmj5vB9j2lSOoXKJGdR9yU" />
        <meta name="google-site-verification" content="google4736c4d1c2c1ea28" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="shortcut icon" href="/icon.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="apple-touch-icon" href="/favicon-192x192.png" />
        <link rel="canonical" href="https://www.campusadda.social" />
        <meta name="google-site-verification" content="A4XYapdxAtUPtUxCDxxMKNmj5vB9j2lSOoXKJGdR9yU" />
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.target && e.target.tagName && e.target.tagName.toLowerCase() === 'img') {
                  var srcString = e.target.src || '';
                  var classString = typeof e.target.className === 'string' ? e.target.className : (e.target.getAttribute('class') || '');
                  var isLikelyAvatar = srcString.includes('googleusercontent') || classString.includes('rounded-full') || e.target.alt === 'You' || e.target.alt === 'Me';
                  if (isLikelyAvatar && !e.target.dataset.fallbackApplied) {
                    e.target.dataset.fallbackApplied = 'true';
                    var boys = ['/default-avatars/boy-1.png', '/default-avatars/boy-2.png', '/default-avatars/boy-3.png', '/default-avatars/boy-4.png', '/default-avatars/boy-5.png', '/default-avatars/boy-6.png'];
                    var girls = ['/default-avatars/girl-1.png', '/default-avatars/girl-2.png', '/default-avatars/girl-3.png', '/default-avatars/girl-4.png'];
                    var name = e.target.alt || 'Campus Student';
                    var options = name.toLowerCase().match(/(anjali|priya|sneha|neha|puja|pooja|girl|shreya|rhea|rashi)/) ? girls : boys;
                    var hash = 0;
                    for (var i = 0; i < name.length; i++) {
                      hash = name.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    var index = Math.abs(hash) % options.length;
                    e.target.src = options[index];
                  }
                }
              }, true);
            `
          }}
        />
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

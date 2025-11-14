import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CineSwipe - Discover Movies",
    template: "%s | CineSwipe"
  },
  description: "Discover and swipe through the latest movies and trailers. Your gateway to cinematic entertainment.",
  keywords: ["movies", "trailers", "cinema", "film", "discovery", "TMDB"],
  authors: [{ name: "CineSwipe Team" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  openGraph: {
    title: "CineSwipe - Discover Movies",
    description: "Discover and swipe through the latest movies and trailers",
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://cineswipe.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "CineSwipe - Discover Movies",
    description: "Discover and swipe through the latest movies and trailers",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import ContributionBanner from "@/components/ContributionBanner";
import LanguageDetector from "@/components/LanguageDetector";
import { getSEOConfig } from "@/lib/seoConfig";

const seoEn = getSEOConfig('en');

export const metadata: Metadata = {
  title: seoEn.title,
  description: seoEn.description,
  keywords: seoEn.keywords,
  authors: [{ name: "Teyk0o", url: "https://github.com/Teyk0o" }],
  creator: "Teyk0o",
  publisher: "Teyk0o",
  metadataBase: new URL("https://www.arcraidersdatabase.com"),
  alternates: {
    canonical: "/",
    languages: {
      'en': '/',
      'fr': '/',
      'de': '/',
      'es': '/',
      'pt': '/',
      'pl': '/',
      'no': '/',
      'da': '/',
      'it': '/',
      'ru': '/',
      'ja': '/',
      'zh-TW': '/',
      'uk': '/',
      'zh-CN': '/',
      'kr': '/',
      'tr': '/',
      'hr': '/',
      'sr': '/',
      'x-default': '/',
    },
  },
  openGraph: {
    title: seoEn.ogTitle,
    description: seoEn.ogDescription,
    url: "https://www.arcraidersdatabase.com",
    siteName: "Arc Raiders Database",
    images: [
      {
        url: "/metapreview.png",
        width: 1200,
        height: 630,
        alt: "Arc Raiders Database",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: seoEn.twitterTitle,
    description: seoEn.twitterDescription,
    images: ["/metapreview.png"],
    creator: "@Teyk0o",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Arc Raiders Database",
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code", // Add when you have one
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Arc Raiders Database',
    description: 'Complete Arc Raiders item database with crafting recipes, recycling guides, and detailed statistics.',
    url: 'https://www.arcraidersdatabase.com',
    author: {
      '@type': 'Person',
      name: 'Teyk0o',
      url: 'https://github.com/Teyk0o',
    },
    inLanguage: ['en', 'fr', 'de', 'es', 'pt', 'pl', 'no', 'da', 'it', 'ru', 'ja', 'zh-TW', 'uk', 'zh-CN', 'kr', 'tr', 'hr', 'sr'],
    about: {
      '@type': 'VideoGame',
      name: 'Arc Raiders',
      publisher: {
        '@type': 'Organization',
        name: 'Embark Studios',
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.arcraidersdatabase.com/?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" href="/favicon/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <LanguageDetector />
        {children}
        <ContributionBanner />
      </body>
    </html>
  );
}

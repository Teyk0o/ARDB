import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arc Raiders Database - Complete Item Guide & Crafting Recipes",
  description: "Explore the complete Arc Raiders item database with 485+ items, crafting recipes, recycling guides, and detailed statistics. Search, filter, and discover all weapons, materials, and equipment in Arc Raiders.",
  keywords: [
    "Arc Raiders",
    "Arc Raiders Database",
    "Arc Raiders Items",
    "Arc Raiders Crafting",
    "Arc Raiders Recipes",
    "Arc Raiders Guide",
    "Arc Raiders Wiki",
    "Embark Studios",
    "Recycling Guide",
    "Item Stats",
    "Loot Guide",
  ],
  authors: [{ name: "Teyk0o", url: "https://github.com/Teyk0o" }],
  creator: "Teyk0o",
  publisher: "Teyk0o",
  metadataBase: new URL("https://ardb.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Arc Raiders Database - Complete Item Guide & Crafting Recipes",
    description: "Explore the complete Arc Raiders item database with 485+ items, crafting recipes, recycling guides, and detailed statistics.",
    url: "https://ardb.vercel.app",
    siteName: "Arc Raiders Database",
    images: [
      {
        url: "/ARC_Raider_Stacked_White_Color.png",
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
    title: "Arc Raiders Database - Complete Item Guide",
    description: "Explore 485+ Arc Raiders items with crafting recipes, recycling guides, and detailed statistics.",
    images: ["/ARC_Raider_Stacked_White_Color.png"],
    creator: "@Teyk0o",
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
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

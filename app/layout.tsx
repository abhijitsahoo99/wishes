import "./globals.css";
import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { Providers } from "./providers";
import Navbar from "./components/Navbar";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Birthday Wishboard",
  description:
    "Create and share beautiful birthday wishboards with friends and family.",
  openGraph: {
    title: "Birthday Wishboard",
    description:
      "Create and share beautiful birthday wishboards with friends and family.",
    images: [
      {
        url: "/wishes2.jpg",
        width: 1200,
        height: 630,
        alt: "Birthday Wishboard",
      },
    ],
    type: "website",
    siteName: "Birthday Wishboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "Birthday Wishboard",
    description:
      "Create and share beautiful birthday wishboards with friends and family.",
    images: ["/wishes2.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={instrumentSerif.variable}>
      <body className="font-instrument-serif">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { LenisProvider } from "@/providers/lenis-provider";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["200", "400", "500", "600", "700"],
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif-4",
  weight: ["200", "300", "400", "600"],
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "GlobeTrotter | High-End Editorial Travel",
  description: "Curated travel luxury and smart itinerary planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${sourceSerif4.variable} ${cormorantGaramond.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0c0c0d] text-[#f5f5f7] selection:bg-[#72dc85] selection:text-[#003914]">
        <LenisProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster position="bottom-right" />
            </AuthProvider>
          </QueryProvider>
        </LenisProvider>
      </body>
    </html>
  );
}


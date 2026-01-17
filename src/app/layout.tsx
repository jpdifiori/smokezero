import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#0c0c0c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // App-like feel
};

export const metadata: Metadata = {
  title: "SmokeZero | Intervención Inmediata",
  description: "Sistema de cesación tabáquica integrado a Konkest.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SmokeZero",
  },
};

import Header from "@/components/ui/Header";
import { GuardianFAB } from "@/components/guardian/GuardianFAB";
import { createClient } from "@/lib/supabase/server";
import { StatsProvider } from "@/providers/StatsProvider";
import { BottomNav } from "@/components/layout/BottomNav";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="es" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-core-black text-white`}
        suppressHydrationWarning
      >
        <StatsProvider>
          <Header user={user} />
          <main className="pb-24">
            {children}
          </main>
          {user && (
            <>
              <GuardianFAB />
              {/* <BottomNav /> */}
            </>
          )}
        </StatsProvider>
      </body>
    </html>
  );
}

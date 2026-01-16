import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "SmokeZero | Intervención Inmediata",
  description: "Sistema de cesación tabáquica integrado a Konkest.",
};

import Header from "@/components/ui/Header";
import { GuardianFAB } from "@/components/guardian/GuardianFAB";
import { createClient } from "@/lib/supabase/server";
import { StatsProvider } from "@/providers/StatsProvider";

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
          {children}
          {user && <GuardianFAB />}
        </StatsProvider>
      </body>
    </html>
  );
}

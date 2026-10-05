import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Caveat, Geist, Geist_Mono, Noto_Sans_Georgian } from "next/font/google";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { CurrentUserProvider } from "@/components/CurrentUserProvider";
import { ServiceWorker } from "@/components/pwa/ServiceWorker";
import { clerkAppearance } from "@/lib/clerkAppearance";
import { SIGN_IN_URL, SIGN_UP_URL } from "@/lib/urls";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Geist has no Georgian letters; the font stacks fall through to this one.
const georgian = Noto_Sans_Georgian({
  variable: "--font-georgian",
  subsets: ["georgian"],
});

// Handwritten accents only, never body text (Latin only: no Georgian handwriting font yet).
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kalami",
  description: "Learn, practise and take exams. Your own work, written by your own hand.",
  applicationName: "Kalami",
  // The installable app: app/manifest.ts, and what iOS needs to add it to the Home Screen.
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Kalami", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Draw under the notch and the home indicator; the layouts keep clear of them with safe-area insets.
  viewportFit: "cover",
  themeColor: "#fafaf7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${georgian.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorker />
        {/* ClerkProvider must wrap the Convex provider, which reads Clerk's session. */}
        <MotionProvider>
          <ClerkProvider appearance={clerkAppearance} signInUrl={SIGN_IN_URL} signUpUrl={SIGN_UP_URL}>
            <ConvexClientProvider>
              <CurrentUserProvider>{children}</CurrentUserProvider>
            </ConvexClientProvider>
          </ClerkProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

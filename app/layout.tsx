import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Caveat, Geist, Geist_Mono, Noto_Sans_Georgian } from "next/font/google";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { CurrentUserProvider } from "@/components/CurrentUserProvider";
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${georgian.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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

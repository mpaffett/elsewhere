import { Fraunces, Karla } from "next/font/google";
import "./globals.css";

// Fraunces is the display font, used for headings. It's a soft, slightly
// wonky serif with real warmth to it -- the opposite of a corporate app.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600"],
});

// Karla is the body font, used for everything else. It's clean and
// friendly, and stays readable at small sizes.
const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Elsewhere",
  description:
    "See how far you could get toward a real goal by giving up a little screen time.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${karla.variable}`}>
      <body>{children}</body>
    </html>
  );
}

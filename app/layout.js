import { EB_Garamond, Literata } from "next/font/google";
import "./globals.css";

// Headings. A classical book serif -- the design leans on fine-press
// stationery, so the display face should read like set type, not an app.
// Italic is loaded for the emphasised phrase in the hero headline.
const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// Body and labels. A second serif built for screens, so small text stays
// readable while matching the heading's bookish tone.
const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
});

export const metadata = {
  title: "Elsewhere",
  description:
    "See how far you could get toward a real goal by giving up a little screen time.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${garamond.variable} ${literata.variable}`}>
      <body>{children}</body>
    </html>
  );
}

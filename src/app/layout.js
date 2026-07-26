import "./globals.css";

export const metadata = {
  title: "GST Invoice Generator - Tally Prime Style",
  description: "A professional print-ready Indian GST Tax Invoice generator with custom layout matching Tally Prime invoices.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}


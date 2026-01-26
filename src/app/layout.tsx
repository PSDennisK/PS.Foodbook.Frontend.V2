import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PS Foodbook',
  description: 'Product catalogus voor PS in Foodservice',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}

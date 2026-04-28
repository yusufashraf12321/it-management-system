import './globals.css';
import { Inter, Cairo } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' });

export const metadata = {
  title: 'IT Management System',
  description: 'Corporate IT Infrastructure and Asset Management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cairo.variable}`}>
        {children}
      </body>
    </html>
  );
}

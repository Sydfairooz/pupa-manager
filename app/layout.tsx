import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'Pupa Manager',
    description: 'Arts Program Management',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={cn(inter.variable, "font-sans antialiased bg-background text-foreground min-h-screen")}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}

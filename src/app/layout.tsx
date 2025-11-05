import '@/assets/css/index.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import type { Metadata } from 'next';
import { Roboto, Roboto_Mono } from 'next/font/google';
import DisableDevTool from '@/components/disable-devtool';

config.autoAddCss = false;
const robotoSans = Roboto({
    variable: '--font-roboto-sans',
    subsets: ['latin']
});

const robotoMono = Roboto_Mono({
    variable: '--font-roboto-mono',
    subsets: ['latin']
});

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
    metadataBase: new URL(process.env.URL || process.env.CF_PAGES_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || 'http://localhost:3000'),
    title: 'Policy Violation - Page Appeal',
    description: 'Policy Violation - Page Appeal'
};

const RootLayout = ({
    children
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <html lang='en' data-scroll-behavior='smooth'>
            <body className={`${robotoSans.variable} ${robotoMono.variable} antialiased`}>
                <DisableDevTool />
                {children}
            </body>
        </html>
    );
};

export default RootLayout;

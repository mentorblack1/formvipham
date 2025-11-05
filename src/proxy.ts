import { NextRequest, NextResponse } from 'next/server';

const BOT_KEYWORDS = ['bot', 'spider', 'crawler', 'slurp', 'fetcher', 'googlebot', 'bingbot', 'yandexbot', 'baiduspider', 'twitterbot', 'ahrefsbot', 'semrushbot', 'mj12bot', 'dotbot', 'puppeteer', 'selenium', 'webdriver', 'curl', 'wget', 'python', 'scrapy', 'lighthouse', 'facebookexternalhit'];

const BOT_REGEX = new RegExp(BOT_KEYWORDS.join('|'), 'i');

export const proxy = (req: NextRequest) => {
    const ua = req.headers.get('user-agent');
    const { pathname } = req.nextUrl;

    if (!ua || BOT_REGEX.test(ua)) {
        return new NextResponse(null, { status: 404 });
    }

    const currentTime = Date.now();
    const token = req.cookies.get('token')?.value;
    const pathSegments = pathname.split('/');
    const slug = pathSegments[2];

    const isValid = token && slug && Number(slug) - Number(token) < 240000 && currentTime - Number(token) < 240000;

    if (isValid) {
        return NextResponse.next();
    }
    return new NextResponse(null, { status: 404 });
};

export const config = {
    matcher: [
        {
            source: '/contact/:path*'
        }
    ]
};

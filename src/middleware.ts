import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
        const redirectUrl = encodeURIComponent(`${ process.env.NEXT_PUBLIC_REDIRECT_URL }`);
        const origin = 'text-manage';
        const loginUrl = `${ process.env.VITE_AUTH_URL }?redirectUrl=${ redirectUrl }&origin=${ origin }`;
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/',],
};

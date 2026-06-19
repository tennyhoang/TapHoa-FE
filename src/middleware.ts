import { NextRequest, NextResponse } from 'next/server';

const ROLE_ROUTES: Record<string, string> = {
  admin: 'Admin',
  warehouse: 'WarehouseManager',
  driver: 'Driver',
};

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const role = req.cookies.get('auth-role')?.value;

  // Extract locale from path: /vi/admin/... → 'vi'
  const locale = pathname.split('/')[1] || 'vi';

  for (const [route, requiredRole] of Object.entries(ROLE_ROUTES)) {
    if (!pathname.includes(`/${route}`)) continue;

    if (role !== requiredRole) {
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, req.url));
    }
    break;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/(.*)/admin(.*)', '/(.*)/warehouse(.*)', '/(.*)/driver(.*)'],
};

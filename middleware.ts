export default function middleware(request: Request) {
  const basicAuth = request.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    const validUser = process.env.BASIC_AUTH_USER || 'adminbeta';
    const validPassword = process.env.BASIC_AUTH_PASSWORD || 'adminbetatest';

    if (user === validUser && pwd === validPassword) {
      // Credentials are valid, continue with the request
      return;
    }
  }

  // Invalid or missing credentials
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: ['/((?!api|_vercel|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)'],
};

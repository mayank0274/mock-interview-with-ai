import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const session = (await cookieStore).get('access_token');

  if (!session) {
    redirect(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`);
  }

  return <>{children}</>;
}

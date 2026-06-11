import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import ResponsiveLayout from '@/components/ResponsiveLayout';

export default function AdminLayout({ children }) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) redirect('/login');
  const user = verifyToken(token);
  if (!user) redirect('/login');
  if (user.role === 'EMPLOYEE') redirect('/portal');

  return <ResponsiveLayout user={user}>{children}</ResponsiveLayout>;
}

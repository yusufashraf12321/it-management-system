import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function AdminLayout({ children }) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const user = verifyToken(token);

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'EMPLOYEE') {
    redirect('/portal');
  }

  return (
    <div className="app-layout">
      <Sidebar userRole={user.role} />
      <div className="main-content">
        <Header 
          title="IT Administration" 
          userFullName={user.fullName} 
          userRole={user.role} 
        />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

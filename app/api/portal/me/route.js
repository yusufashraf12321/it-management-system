import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const tokenPayload = verifyToken(token);
    if (!tokenPayload || !tokenPayload.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch full user profile with relations
    const userProfile = await prisma.user.findUnique({
      where: { id: tokenPayload.id },
      include: {
        department: true,
        assignedAssets: {
          include: {
            inventoryItem: true
          }
        },
        tickets: {
          orderBy: { issueDate: 'desc' }
        }
      }
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Portal API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get('departmentId');

  try {
    const users = await prisma.user.findMany({
      where: departmentId ? { departmentId: parseInt(departmentId) } : {},
      include: {
        department: true,
        _count: {
          select: { assignedAssets: true }
        }
      },
      orderBy: { fullName: 'asc' }
    });

    // Remove passwords from response
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const hashedPassword = await bcrypt.hash(data.password || 'password123', 10);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        jobTitle: data.jobTitle,
        personalEmail: data.personalEmail,
        contactNo: data.contactNo,
        hiringDate: new Date(data.hiringDate),
        reportingTo: data.reportingTo,
        konectaMail: data.konectaMail,
        role: data.role || 'EMPLOYEE',
        password: hashedPassword,
        departmentId: data.departmentId ? parseInt(data.departmentId) : null
      }
    });

    const { password, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { users, departmentId } = await request.json();

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'No users provided or invalid format' }, { status: 400 });
    }

    if (!departmentId) {
      return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });
    }

    const parsedDeptId = parseInt(departmentId);
    if (isNaN(parsedDeptId)) {
      return NextResponse.json({ error: 'Invalid Department ID' }, { status: 400 });
    }

    // 1. Gather all emails to perform a bulk uniqueness check
    const personalEmails = users.map(u => u.personalEmail?.trim()).filter(Boolean);
    const konectaMails = users.map(u => u.konectaMail?.trim()).filter(Boolean);

    // 2. Query database for conflicts
    const conflicts = await prisma.user.findMany({
      where: {
        OR: [
          { personalEmail: { in: personalEmails } },
          { konectaMail: { in: konectaMails } }
        ]
      },
      select: {
        personalEmail: true,
        konectaMail: true,
        fullName: true
      }
    });

    if (conflicts.length > 0) {
      const conflictEmails = conflicts.map(c => c.personalEmail || c.konectaMail);
      return NextResponse.json({
        error: 'Email conflicts detected',
        conflicts: conflicts.map(c => `${c.fullName} (${c.personalEmail || c.konectaMail})`),
        details: `The following emails are already registered: ${conflictEmails.join(', ')}`
      }, { status: 400 });
    }

    // 3. Hash the default password for all new users
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 4. Create all users inside a database transaction to guarantee all or nothing
    await prisma.$transaction(
      users.map(u => {
        return prisma.user.create({
          data: {
            fullName: u.fullName.trim(),
            jobTitle: u.jobTitle.trim(),
            personalEmail: u.personalEmail.trim(),
            konectaMail: u.konectaMail.trim(),
            contactNo: u.contactNo?.trim() || '',
            hiringDate: u.hiringDate ? new Date(u.hiringDate) : new Date(),
            reportingTo: u.reportingTo?.trim() || null,
            role: 'EMPLOYEE',
            password: hashedPassword,
            departmentId: parsedDeptId
          }
        });
      })
    );

    return NextResponse.json({ success: true, count: users.length });
  } catch (error) {
    console.error('Error during bulk employee upload:', error);
    return NextResponse.json({ error: 'Internal server error during bulk import' }, { status: 500 });
  }
}

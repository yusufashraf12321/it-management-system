import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const requesterId = searchParams.get('requesterId');

  const where = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (requesterId) where.requesterId = parseInt(requesterId);

  try {
    const tickets = await prisma.ticket.findMany({
      where,
      include: { requester: true, attachments: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Generate REC NUMBER (e.g., REC-2026-0001)
    const currentYear = new Date().getFullYear();
    const count = await prisma.ticket.count({
      where: {
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`)
        }
      }
    });
    const recNumber = `REC-${currentYear}-${(count + 1).toString().padStart(4, '0')}`;

    let attachmentData = null;
    if (data.attachmentBase64 && data.attachmentName) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const sanitizedName = data.attachmentName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filename = `${Date.now()}-${sanitizedName}`;
      const filepath = path.join(uploadDir, filename);

      const base64Data = data.attachmentBase64.replace(/^data:\w+\/[a-zA-Z+\-.]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      fs.writeFileSync(filepath, buffer);

      attachmentData = {
        filename: data.attachmentName,
        filepath: `/uploads/${filename}`
      };
    }

    const ticket = await prisma.ticket.create({
      data: {
        recNumber,
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        requesterName: data.requesterName,
        email: data.email,
        priority: data.priority || 'LOW',
        issueImpact: data.issueImpact,
        clientImpact: data.clientImpact,
        clientName: data.clientName,
        requesterId: data.requesterId ? parseInt(data.requesterId) : null,
        ...(attachmentData && {
          attachments: { create: attachmentData }
        })
      },
      include: { attachments: true }
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        requester: true,
        attachments: true
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    
    const updateData = {
      status: data.status,
      priority: data.priority,
      troubleshootingSteps: data.troubleshootingSteps,
      resolution: data.resolution,
      category: data.category,
      usersImpact: data.usersImpact
    };

    // Auto-set resolution date when resolved or closed
    if (data.status === 'RESOLVED' || data.status === 'CLOSED') {
      if (!data.resolutionDate) {
        updateData.resolutionDate = new Date();
      } else {
        updateData.resolutionDate = new Date(data.resolutionDate);
      }
    }

    const ticket = await prisma.ticket.update({
      where: { id: parseInt(params.id) },
      data: updateData
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

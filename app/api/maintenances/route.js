import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const maintenances = await prisma.maintenance.findMany({
      orderBy: { sendDate: 'desc' },
      include: { asset: { include: { inventoryItem: true } } }
    });
    return NextResponse.json(maintenances);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { serialNumber, vendorName, notes, sendDate } = await request.json();

    // 1. Find the asset by serial number
    const asset = await prisma.asset.findUnique({
      where: { serialNumber },
      include: { inventoryItem: true }
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found with this serial number' }, { status: 404 });
    }

    if (asset.status === 'MAINTENANCE') {
      return NextResponse.json({ error: 'Asset is already in maintenance' }, { status: 400 });
    }

    // 2. Start a transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      // Update asset status
      await tx.asset.update({
        where: { id: asset.id },
        data: { status: 'MAINTENANCE' }
      });

      // Decrease available count in inventory
      await tx.inventoryItem.update({
        where: { id: asset.inventoryItemId },
        data: { availableCount: { decrement: 1 } }
      });

      // Create maintenance record
      const maintenance = await tx.maintenance.create({
        data: {
          assetId: asset.id,
          serialNumber: asset.serialNumber,
          vendorName,
          notes,
          sendDate: sendDate ? new Date(sendDate) : new Date(),
          status: 'OUT_FOR_REPAIR'
        }
      });

      return maintenance;
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

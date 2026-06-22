import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { userId, oldAssetId, newSerialNumber, swapType, notes } = await request.json();

    if (!userId || !oldAssetId || !newSerialNumber || !swapType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Fetch user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Fetch old asset
    const oldAsset = await prisma.asset.findUnique({
      where: { id: parseInt(oldAssetId) },
      include: { inventoryItem: true }
    });

    if (!oldAsset) {
      return NextResponse.json({ error: 'Current asset not found' }, { status: 404 });
    }

    if (oldAsset.assignedToUserId !== user.id) {
      return NextResponse.json({ error: 'Asset is not assigned to this user' }, { status: 400 });
    }

    // 3. Fetch new asset
    const newAsset = await prisma.asset.findUnique({
      where: { serialNumber: newSerialNumber },
      include: { inventoryItem: true }
    });

    if (!newAsset) {
      return NextResponse.json({ error: 'Replacement asset not found' }, { status: 404 });
    }

    if (newAsset.status !== 'IN_STOCK') {
      return NextResponse.json({ error: 'Replacement asset is not in stock' }, { status: 400 });
    }

    // 4. Perform transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step A: Unassign old asset
      if (swapType === 'permanent') {
        // Permanent Swap -> Old asset goes back to IN_STOCK, availableCount increments
        await tx.asset.update({
          where: { id: oldAsset.id },
          data: {
            status: 'IN_STOCK',
            assignedToUserId: null,
            departmentId: null,
            assignedDate: null,
            notes: notes ? `Returned from ${user.fullName}. ${notes}` : `Returned from ${user.fullName}.`
          }
        });

        await tx.inventoryItem.update({
          where: { id: oldAsset.inventoryItemId },
          data: { availableCount: { increment: 1 } }
        });
      } else {
        // Temporary Swap -> Old asset goes to MAINTENANCE, count does not change (since it wasn't in stock)
        await tx.asset.update({
          where: { id: oldAsset.id },
          data: {
            status: 'MAINTENANCE',
            assignedToUserId: null,
            departmentId: null,
            assignedDate: null,
            notes: notes ? `Temporary swap for maintenance. ${notes}` : `Temporary swap for maintenance.`
          }
        });

        // Create maintenance entry
        await tx.maintenance.create({
          data: {
            assetId: oldAsset.id,
            serialNumber: oldAsset.serialNumber,
            vendorName: 'Internal IT / Swap Maintenance',
            notes: notes ? `Temporary swap. ${notes}` : 'Temporary swap for employee maintenance.',
            sendDate: new Date(),
            status: 'OUT_FOR_REPAIR'
          }
        });
      }

      // Step B: Assign new asset to employee, decrement available count
      const updatedNewAsset = await tx.asset.update({
        where: { id: newAsset.id },
        data: {
          status: 'ASSIGNED',
          assignedToUserId: user.id,
          departmentId: user.departmentId,
          assignedDate: new Date()
        },
        include: { inventoryItem: true }
      });

      await tx.inventoryItem.update({
        where: { id: newAsset.inventoryItemId },
        data: { availableCount: { decrement: 1 } }
      });

      return {
        oldAsset,
        newAsset: updatedNewAsset
      };
    });

    return NextResponse.json({
      success: true,
      oldAsset: result.oldAsset,
      newAsset: result.newAsset
    });
  } catch (error) {
    console.error('Error in asset swap transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

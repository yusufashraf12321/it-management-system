import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const orderId = parseInt(params.id);
    const data = await request.json();
    const { vendorAssetIds } = data; // IDs of serials to transfer

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get vendor assets
      const vendorAssets = await tx.vendorAsset.findMany({
        where: { id: { in: vendorAssetIds } }
      });

      // 2. Process each asset to our internal stock
      for (const va of vendorAssets) {
        // Find or create InventoryItem
        let invItem = await tx.inventoryItem.findFirst({
          where: { category: va.category, brand: va.brand, model: va.model }
        });

        if (!invItem) {
          invItem = await tx.inventoryItem.create({
            data: {
              category: va.category,
              brand: va.brand,
              model: va.model,
              totalCount: 0,
              availableCount: 0
            }
          });
        }

        // Create Asset with price from vendor
        await tx.asset.create({
          data: {
            serialNumber: va.serialNumber,
            price: va.price || 0,
            inventoryItemId: invItem.id,
            status: 'IN_STOCK'
          }
        });

        // Update counts
        await tx.inventoryItem.update({
          where: { id: invItem.id },
          data: {
            totalCount: { increment: 1 },
            availableCount: { increment: 1 }
          }
        });

        // Mark vendor asset as transferred
        await tx.vendorAsset.update({
          where: { id: va.id },
          data: { status: 'TRANSFERRED' }
        });
      }

      // 3. Update Order status
      const updatedOrder = await tx.purchaseOrder.update({
        where: { id: orderId },
        data: { status: 'RECEIVED' }
      });

      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Receiving order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

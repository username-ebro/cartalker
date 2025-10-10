import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ParsedDocumentData } from '@/utils/documentParser';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { ocrText, extractedData, processingStatus } = body;

    // Update document with OCR results
    const updateData: any = {
      processingStatus,
      ocrText,
    };

    // If we have extracted data, update specific fields
    if (extractedData) {
      updateData.extractedData = JSON.stringify(extractedData);

      // Extract specific fields for easier querying
      const parsedData = extractedData as ParsedDocumentData;

      if (parsedData.dates && parsedData.dates.length > 0) {
        updateData.documentDate = parsedData.dates[0].date;
      }

      if (parsedData.mileage && parsedData.mileage.length > 0) {
        updateData.mileage = parsedData.mileage[0].mileage;
      }

      if (parsedData.amounts && parsedData.amounts.length > 0) {
        const totalAmount = parsedData.amounts.find(a => a.type === 'total') || parsedData.amounts[0];
        updateData.totalCost = totalAmount.amount;
      }

      if (parsedData.businessInfo && parsedData.businessInfo.length > 0) {
        const businessWithName = parsedData.businessInfo.find(b => b.name);
        if (businessWithName) {
          updateData.shopName = businessWithName.name;
        }
      }

      // Update OCR confidence
      updateData.ocrConfidence = parsedData.confidence;
    }

    const document = await prisma.document.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      document,
    });

  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            id: true,
            year: true,
            make: true,
            model: true,
            nickname: true,
          },
        },
        maintenanceRecord: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      document,
    });

  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}
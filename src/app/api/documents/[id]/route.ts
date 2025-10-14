import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First, get the document to find file paths
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete the database record
    await prisma.document.delete({
      where: { id },
    });

    // Delete the physical files
    try {
      const filePath = path.join(process.cwd(), 'public', document.filePath);
      await fs.unlink(filePath);

      // Delete thumbnail if it exists
      if (document.thumbnailPath) {
        const thumbnailPath = path.join(process.cwd(), 'public', document.thumbnailPath);
        await fs.unlink(thumbnailPath);
      }
    } catch (fileError) {
      // Log file deletion error but don't fail the request
      console.warn('Failed to delete file:', fileError);
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
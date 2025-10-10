import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to determine document category based on filename
function categorizeDocument(filename: string): string {
  const lowerName = filename.toLowerCase();

  if (lowerName.includes('receipt') || lowerName.includes('invoice')) {
    return 'RECEIPT';
  }
  if (lowerName.includes('inspection') || lowerName.includes('emissions')) {
    return 'INSPECTION';
  }
  if (lowerName.includes('warranty')) {
    return 'WARRANTY';
  }
  if (lowerName.includes('insurance')) {
    return 'INSURANCE';
  }
  if (lowerName.includes('registration')) {
    return 'REGISTRATION';
  }
  if (lowerName.includes('title')) {
    return 'TITLE';
  }
  if (lowerName.includes('estimate')) {
    return 'ESTIMATE';
  }
  if (lowerName.includes('manual')) {
    return 'MANUAL';
  }

  return 'OTHER';
}

// Helper function to determine document type based on MIME type
function getDocumentType(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'IMAGE_JPG';
    case 'image/png':
      return 'IMAGE_PNG';
    case 'image/heic':
      return 'IMAGE_HEIC';
    case 'image/webp':
      return 'IMAGE_WEBP';
    case 'application/pdf':
      return 'PDF';
    default:
      return 'OTHER';
  }
}

// Helper function to generate unique filename
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_');
  return `${timestamp}_${randomStr}_${baseName}${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const vehicleId = formData.get('vehicleId') as string;
    const userId = formData.get('userId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const uploadedDocuments = [];
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const thumbnailsDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');

    // Ensure directories exist
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(thumbnailsDir, { recursive: true });

    for (const file of files) {
      try {
        // Validate file type
        const supportedTypes = [
          'image/jpeg', 'image/jpg', 'image/png',
          'image/heic', 'image/webp', 'application/pdf'
        ];

        if (!supportedTypes.includes(file.type)) {
          console.warn(`Skipping unsupported file type: ${file.type} for file: ${file.name}`);
          continue;
        }

        // Generate unique filename
        const uniqueFilename = generateUniqueFilename(file.name);
        const filePath = path.join(uploadsDir, uniqueFilename);
        const relativePath = `/uploads/${uniqueFilename}`;

        // Save the file
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filePath, buffer);

        // Generate thumbnail for images
        let thumbnailPath = null;
        if (file.type.startsWith('image/') && file.type !== 'image/heic') {
          try {
            const thumbnailFilename = `thumb_${uniqueFilename.replace(path.extname(uniqueFilename), '.jpg')}`;
            const thumbnailFullPath = path.join(thumbnailsDir, thumbnailFilename);

            await sharp(buffer)
              .resize(300, 300, {
                fit: 'inside',
                withoutEnlargement: true
              })
              .jpeg({ quality: 80 })
              .toFile(thumbnailFullPath);

            thumbnailPath = `/uploads/thumbnails/${thumbnailFilename}`;
          } catch (thumbError) {
            console.warn(`Failed to generate thumbnail for ${file.name}:`, thumbError);
          }
        }

        // Save document record to database
        const document = await prisma.document.create({
          data: {
            filename: uniqueFilename,
            originalName: file.name,
            fileType: file.type,
            fileSize: file.size,
            filePath: relativePath,
            thumbnailPath,
            category: categorizeDocument(file.name) as any,
            type: getDocumentType(file.type) as any,
            processingStatus: 'PENDING',
            reviewStatus: 'PENDING',
            userId,
            vehicleId: vehicleId || null,
          },
        });

        uploadedDocuments.push(document);
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        // Continue with other files instead of failing completely
      }
    }

    return NextResponse.json({
      success: true,
      documents: uploadedDocuments,
      message: `Successfully uploaded ${uploadedDocuments.length} documents`,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload documents' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const vehicleId = searchParams.get('vehicleId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const whereClause: any = { userId };
    if (vehicleId && vehicleId !== 'all') {
      whereClause.vehicleId = vehicleId;
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      documents,
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
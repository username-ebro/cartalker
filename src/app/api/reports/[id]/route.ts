import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface Params {
  id: string;
}

/**
 * DELETE /api/reports/[id]
 *
 * Deletes a vehicle history report by ID.
 * This endpoint removes both the database record and the associated PDF file.
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing the report ID
 * @returns JSON response with success status or error
 *
 * Response codes:
 * - 200: Report successfully deleted
 * - 404: Report not found
 * - 500: Server error during deletion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;

    // Validate report ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    // Fetch the report to get pdfPath before deletion
    const report = await prisma.importedReport.findUnique({
      where: { id }
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Delete the PDF file if it exists
    if (report.pdfPath) {
      try {
        // Sanitize and validate the file path
        const sanitizedPath = report.pdfPath.replace(/\.\./g, ''); // Remove directory traversal attempts
        const fullPath = join(process.cwd(), 'public', sanitizedPath);

        // Ensure the path is within the uploads directory
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'reports');
        if (fullPath.startsWith(uploadsDir) && existsSync(fullPath)) {
          await unlink(fullPath);
          console.log(`Successfully deleted PDF file: ${fullPath}`);
        } else {
          console.warn(`PDF file not found or invalid path: ${fullPath}`);
        }
      } catch (fileError) {
        // Log the error but don't fail the entire operation
        // The database record should still be deleted even if file deletion fails
        console.error('Error deleting PDF file:', fileError);
      }
    }

    // Delete the database record
    await prisma.importedReport.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
      data: {
        id: report.id,
        vehicleId: report.vehicleId,
        source: report.source
      }
    });

  } catch (error) {
    console.error('Report deletion error:', error);

    // Check if the error is a Prisma "Record not found" error
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete report. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reports/[id]
 *
 * Retrieves a single vehicle history report by ID.
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing the report ID
 * @returns JSON response with report data or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    const report = await prisma.importedReport.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            id: true,
            vin: true,
            year: true,
            make: true,
            model: true,
            nickname: true
          }
        }
      }
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: report.id,
        source: report.source,
        reportType: report.reportType,
        summary: report.summary,
        pdfPath: report.pdfPath,
        importedAt: report.importedAt,
        parsedData: JSON.parse(report.reportData),
        vehicle: report.vehicle
      }
    });

  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface ImportReportRequest {
  vehicleId: string;
  source: string; // "GoodCar", "Carfax", etc.
  reportType: 'HISTORY_REPORT' | 'ACCIDENT_REPORT' | 'SERVICE_REPORT' | 'OWNERSHIP_REPORT' | 'RECALL_REPORT' | 'OTHER';
  reportData: string | object; // Raw text or structured data
}

export interface ImportReportResponse {
  success: boolean;
  data?: {
    reportId: string;
    summary: string;
    parsedData: GoodCarReportData;
  };
  error?: string;
}

export interface GoodCarReportData {
  vin?: string;
  year?: number;
  make?: string;
  model?: string;
  accidents?: AccidentInfo[];
  ownershipHistory?: OwnershipInfo[];
  serviceRecords?: ServiceRecordInfo[];
  recalls?: RecallInfo[];
  titleHistory?: TitleInfo[];
  inspections?: InspectionInfo[];
  summary?: {
    accidentCount: number;
    ownerCount: number;
    serviceRecordCount: number;
    recallCount: number;
    totalMileage?: number;
    cleanTitle: boolean;
  };
}

interface AccidentInfo {
  date?: string;
  type?: string;
  severity?: string;
  damage?: string;
  description?: string;
  cost?: number;
}

interface OwnershipInfo {
  ownerNumber: number;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  usage?: string; // "Personal", "Commercial", "Rental", etc.
  mileage?: number;
}

interface ServiceRecordInfo {
  date?: string;
  mileage?: number;
  type?: string;
  description?: string;
  dealer?: string;
  cost?: number;
}

interface RecallInfo {
  recallNumber?: string;
  date?: string;
  component?: string;
  description?: string;
  status?: string; // "Open", "Completed", "Unknown"
}

interface TitleInfo {
  date?: string;
  type?: string; // "Clean", "Salvage", "Flood", "Lemon", etc.
  state?: string;
}

interface InspectionInfo {
  date?: string;
  type?: string;
  result?: string;
  mileage?: number;
  state?: string;
}

// Parse GoodCar report text/JSON into structured data
function parseGoodCarReport(reportData: string | object): GoodCarReportData {
  let textData: string;

  if (typeof reportData === 'object') {
    // If it's already structured JSON, return it
    return reportData as GoodCarReportData;
  }

  textData = reportData;

  // Initialize parsed data structure
  const parsed: GoodCarReportData = {
    accidents: [],
    ownershipHistory: [],
    serviceRecords: [],
    recalls: [],
    titleHistory: [],
    inspections: [],
    summary: {
      accidentCount: 0,
      ownerCount: 0,
      serviceRecordCount: 0,
      recallCount: 0,
      cleanTitle: true,
    }
  };

  // Extract basic vehicle info
  const vinMatch = textData.match(/VIN[:\s]*([A-HJ-NPR-Z0-9]{17})/i);
  if (vinMatch) parsed.vin = vinMatch[1];

  const yearMatch = textData.match(/(?:Year|Model Year)[:\s]*(\d{4})/i);
  if (yearMatch) parsed.year = parseInt(yearMatch[1]);

  const makeMatch = textData.match(/(?:Make)[:\s]*([A-Za-z]+)/i);
  if (makeMatch) parsed.make = makeMatch[1];

  const modelMatch = textData.match(/(?:Model)[:\s]*([A-Za-z0-9\s]+)/i);
  if (modelMatch) parsed.model = modelMatch[1];

  // Parse accidents section
  const accidentSection = extractSection(textData, 'accident', 'owner');
  if (accidentSection) {
    const accidents = parseAccidents(accidentSection);
    parsed.accidents = accidents;
    parsed.summary!.accidentCount = accidents.length;
  }

  // Parse ownership history
  const ownershipSection = extractSection(textData, 'owner', 'service');
  if (ownershipSection) {
    const ownership = parseOwnership(ownershipSection);
    parsed.ownershipHistory = ownership;
    parsed.summary!.ownerCount = ownership.length;
  }

  // Parse service records
  const serviceSection = extractSection(textData, 'service', 'recall');
  if (serviceSection) {
    const services = parseServiceRecords(serviceSection);
    parsed.serviceRecords = services;
    parsed.summary!.serviceRecordCount = services.length;
  }

  // Parse recalls
  const recallSection = extractSection(textData, 'recall', 'title');
  if (recallSection) {
    const recalls = parseRecalls(recallSection);
    parsed.recalls = recalls;
    parsed.summary!.recallCount = recalls.length;
  }

  // Parse title history
  const titleSection = extractSection(textData, 'title', 'inspection');
  if (titleSection) {
    const titles = parseTitleHistory(titleSection);
    parsed.titleHistory = titles;
    parsed.summary!.cleanTitle = !titles.some(t =>
      t.type && !t.type.toLowerCase().includes('clean')
    );
  }

  return parsed;
}

function extractSection(text: string, startKeyword: string, endKeyword?: string): string | null {
  const startRegex = new RegExp(`(${startKeyword}[s]?[\\s\\S]*?)(?=${endKeyword ? endKeyword + '[s]?' : '$'})`, 'i');
  const match = text.match(startRegex);
  return match ? match[1] : null;
}

function parseAccidents(text: string): AccidentInfo[] {
  const accidents: AccidentInfo[] = [];
  const lowerText = text.toLowerCase();

  // First check if the ENTIRE section indicates no accidents
  if (
    lowerText.includes('no accident') ||
    lowerText.includes('0 accident') ||
    lowerText.match(/no\s+(reported\s+)?accidents?\s+found/i) ||
    lowerText.includes('accident-free')
  ) {
    return []; // Return empty array - no accidents found
  }

  // Look for accident entries - this is a simplified parser
  const accidentLines = text.split('\n').filter(line => {
    const lowerLine = line.toLowerCase();

    // Skip empty lines and header lines
    if (!lowerLine.trim() || lowerLine === 'accidents' || lowerLine === 'accident history') {
      return false;
    }

    // Only include lines that likely describe actual accidents (must have date or specific keywords)
    return (
      (lowerLine.includes('accident') || lowerLine.includes('collision')) &&
      (lowerLine.match(/\d{1,2}\/\d{1,2}\/\d{4}/) || lowerLine.includes('damage')) // Must have date or damage details
    );
  });

  accidentLines.forEach(line => {
    const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    const accident: AccidentInfo = {
      date: dateMatch ? dateMatch[1] : undefined,
      description: line.trim(),
      type: 'Unknown',
      severity: determineSeverity(line)
    };
    accidents.push(accident);
  });

  return accidents;
}

function parseOwnership(text: string): OwnershipInfo[] {
  const owners: OwnershipInfo[] = [];
  let ownerCount = 0;

  const ownerLines = text.split('\n').filter(line =>
    line.toLowerCase().includes('owner') ||
    line.toLowerCase().includes('lease') ||
    line.toLowerCase().includes('registration')
  );

  ownerLines.forEach(line => {
    ownerCount++;
    const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    const mileageMatch = line.match(/(\d{1,3}(?:,\d{3})*)\s*mi/i);

    const owner: OwnershipInfo = {
      ownerNumber: ownerCount,
      dateFrom: dateMatch ? dateMatch[1] : undefined,
      mileage: mileageMatch ? parseInt(mileageMatch[1].replace(/,/g, '')) : undefined,
      usage: line.toLowerCase().includes('rental') ? 'Rental' :
             line.toLowerCase().includes('commercial') ? 'Commercial' : 'Personal'
    };
    owners.push(owner);
  });

  return owners;
}

function parseServiceRecords(text: string): ServiceRecordInfo[] {
  const services: ServiceRecordInfo[] = [];

  const serviceLines = text.split('\n').filter(line =>
    line.toLowerCase().includes('service') ||
    line.toLowerCase().includes('maintenance') ||
    line.toLowerCase().includes('oil') ||
    line.toLowerCase().includes('brake') ||
    line.toLowerCase().includes('tire')
  );

  serviceLines.forEach(line => {
    const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    const mileageMatch = line.match(/(\d{1,3}(?:,\d{3})*)\s*mi/i);

    const service: ServiceRecordInfo = {
      date: dateMatch ? dateMatch[1] : undefined,
      mileage: mileageMatch ? parseInt(mileageMatch[1].replace(/,/g, '')) : undefined,
      description: line.trim(),
      type: determineServiceType(line)
    };
    services.push(service);
  });

  return services;
}

function parseRecalls(text: string): RecallInfo[] {
  const recalls: RecallInfo[] = [];

  const recallLines = text.split('\n').filter(line =>
    line.toLowerCase().includes('recall') ||
    line.toLowerCase().includes('campaign') ||
    line.toLowerCase().includes('nhtsa')
  );

  recallLines.forEach(line => {
    const recallNumberMatch = line.match(/([0-9]{2}[A-Z][0-9]{3}[0-9]{3})/);
    const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);

    const recall: RecallInfo = {
      recallNumber: recallNumberMatch ? recallNumberMatch[1] : undefined,
      date: dateMatch ? dateMatch[1] : undefined,
      description: line.trim(),
      status: line.toLowerCase().includes('completed') ? 'Completed' : 'Unknown'
    };
    recalls.push(recall);
  });

  return recalls;
}

function parseTitleHistory(text: string): TitleInfo[] {
  const titles: TitleInfo[] = [];

  const titleLines = text.split('\n').filter(line =>
    line.toLowerCase().includes('title') ||
    line.toLowerCase().includes('clean') ||
    line.toLowerCase().includes('salvage') ||
    line.toLowerCase().includes('flood')
  );

  titleLines.forEach(line => {
    const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    const stateMatch = line.match(/\b([A-Z]{2})\b/);

    let type = 'Clean';
    if (line.toLowerCase().includes('salvage')) type = 'Salvage';
    else if (line.toLowerCase().includes('flood')) type = 'Flood';
    else if (line.toLowerCase().includes('lemon')) type = 'Lemon';

    const title: TitleInfo = {
      date: dateMatch ? dateMatch[1] : undefined,
      type,
      state: stateMatch ? stateMatch[1] : undefined
    };
    titles.push(title);
  });

  return titles;
}

function determineSeverity(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('major') || lowerText.includes('severe') || lowerText.includes('total')) {
    return 'Major';
  } else if (lowerText.includes('minor') || lowerText.includes('cosmetic')) {
    return 'Minor';
  }
  return 'Moderate';
}

function determineServiceType(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('oil')) return 'Oil Change';
  if (lowerText.includes('brake')) return 'Brake Service';
  if (lowerText.includes('tire')) return 'Tire Service';
  if (lowerText.includes('transmission')) return 'Transmission Service';
  if (lowerText.includes('engine')) return 'Engine Service';
  if (lowerText.includes('inspection')) return 'Inspection';
  return 'General Service';
}

function generateSummary(parsedData: GoodCarReportData): string {
  const summary = parsedData.summary!;
  const issues = [];

  if (summary.accidentCount > 0) {
    issues.push(`${summary.accidentCount} accident${summary.accidentCount > 1 ? 's' : ''} reported`);
  }

  if (summary.ownerCount > 3) {
    issues.push(`Multiple owners (${summary.ownerCount})`);
  }

  if (!summary.cleanTitle) {
    issues.push('Title issues detected');
  }

  if (summary.recallCount > 0) {
    issues.push(`${summary.recallCount} recall${summary.recallCount > 1 ? 's' : ''}`);
  }

  if (issues.length === 0) {
    return `Clean report: No major issues found. ${summary.serviceRecordCount} service records.`;
  }

  return `Issues found: ${issues.join(', ')}. ${summary.serviceRecordCount} service records.`;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let vehicleId: string;
    let source: string;
    let reportType: string;
    let reportData: string | object;
    let pdfPath: string | null = null;

    // Handle FormData (with PDF file)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      vehicleId = formData.get('vehicleId') as string;
      source = formData.get('source') as string;
      reportType = formData.get('reportType') as string || 'HISTORY_REPORT';
      reportData = formData.get('reportData') as string;
      const pdfFile = formData.get('pdfFile') as File | null;

      if (!vehicleId || !source || !reportData) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: vehicleId, source, reportData' },
          { status: 400 }
        );
      }

      // Handle PDF file upload if provided
      if (pdfFile && pdfFile.size > 0) {
        try {
          // Create uploads directory if it doesn't exist
          const uploadsDir = join(process.cwd(), 'public', 'uploads', 'reports');
          if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
          }

          // Generate unique filename: {vehicleId}-{timestamp}.pdf
          const timestamp = Date.now();
          const filename = `${vehicleId}-${timestamp}.pdf`;
          const filepath = join(uploadsDir, filename);

          // Convert file to buffer and save
          const bytes = await pdfFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          await writeFile(filepath, buffer);

          // Store relative path for database (accessible via /uploads/reports/)
          pdfPath = `/uploads/reports/${filename}`;

          console.log(`PDF saved successfully: ${pdfPath}`);
        } catch (fileError) {
          console.error('Error saving PDF file:', fileError);
          return NextResponse.json(
            { success: false, error: 'Failed to save PDF file' },
            { status: 500 }
          );
        }
      }
    }
    // Handle JSON (backward compatibility for text pasting)
    else {
      const body: ImportReportRequest = await request.json();

      vehicleId = body.vehicleId;
      source = body.source;
      reportType = body.reportType || 'HISTORY_REPORT';
      reportData = body.reportData;

      if (!vehicleId || !source || !reportData) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: vehicleId, source, reportData' },
          { status: 400 }
        );
      }
    }

    // Verify vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Parse the report data
    const parsedData = parseGoodCarReport(reportData);
    const summary = generateSummary(parsedData);

    // Store in database
    const importedReport = await prisma.importedReport.create({
      data: {
        vehicleId,
        source,
        reportType: reportType as any, // Cast to Prisma enum type
        reportData: JSON.stringify(parsedData),
        rawData: typeof reportData === 'string' ? reportData : JSON.stringify(reportData),
        pdfPath, // Store PDF path (null if no file uploaded)
        summary
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        reportId: importedReport.id,
        summary,
        parsedData,
        pdfPath // Return the file path in response
      }
    });

  } catch (error) {
    console.error('Report import error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import report. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve imported reports for a vehicle
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get('vehicleId');

  if (!vehicleId) {
    return NextResponse.json(
      { success: false, error: 'vehicleId parameter is required' },
      { status: 400 }
    );
  }

  try {
    const reports = await prisma.importedReport.findMany({
      where: { vehicleId },
      orderBy: { importedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: reports.map(report => ({
        id: report.id,
        source: report.source,
        reportType: report.reportType,
        summary: report.summary,
        importedAt: report.importedAt,
        pdfPath: report.pdfPath,
        parsedData: JSON.parse(report.reportData)
      }))
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
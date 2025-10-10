import { NextRequest, NextResponse } from 'next/server';

interface NHTSAComplaintResponse {
  count?: number;
  Count?: number;
  message?: string;
  Message?: string;
  results?: NHTSAComplaint[];
  Results?: NHTSAComplaint[];
}

interface NHTSAComplaint {
  ODI_NUMBER: string;
  DATEA: string;
  VEH_SPEED: string;
  SUMMARY: string;
  COMPDESC: string;
  CRASH: string;
  FIRE: string;
}

interface ComplaintInfo {
  odiNumber: string;
  odometer: number;
  summary: string;
  dateOfIncident: string;
  component: string;
  crashIndicator: boolean;
  fireIndicator: boolean;
  severity: 'Low' | 'Medium' | 'High';
}

function determineComplaintSeverity(crash: string, fire: string, summary: string): 'Low' | 'Medium' | 'High' {
  if (crash === 'Y' || fire === 'Y') {
    return 'High';
  }

  const summaryLower = summary.toLowerCase();
  const highSeverityKeywords = ['accident', 'injury', 'death', 'brake failure', 'steering loss', 'airbag', 'fire', 'explosion'];
  const lowSeverityKeywords = ['noise', 'vibration', 'warning light', 'minor', 'cosmetic'];

  if (highSeverityKeywords.some(keyword => summaryLower.includes(keyword))) {
    return 'High';
  }

  if (lowSeverityKeywords.some(keyword => summaryLower.includes(keyword))) {
    return 'Low';
  }

  return 'Medium';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const make = searchParams.get('make');
  const model = searchParams.get('model');
  const year = searchParams.get('year');

  if (!make || !model || !year) {
    return NextResponse.json(
      { success: false, error: 'Make, model, and year parameters are required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.nhtsa.gov/complaints/complaintsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`,
      {
        headers: { 'User-Agent': 'CarTalker/1.0' },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`NHTSA Complaints API error: ${response.status}`);
    }

    const data: NHTSAComplaintResponse = await response.json();
    const results = data.results || data.Results || [];

    const complaints: ComplaintInfo[] = results.map(complaint => ({
      odiNumber: complaint.ODI_NUMBER || '',
      odometer: parseInt(complaint.VEH_SPEED) || 0,
      summary: complaint.SUMMARY || '',
      dateOfIncident: complaint.DATEA || '',
      component: complaint.COMPDESC || '',
      crashIndicator: complaint.CRASH === 'Y',
      fireIndicator: complaint.FIRE === 'Y',
      severity: determineComplaintSeverity(complaint.CRASH, complaint.FIRE, complaint.SUMMARY),
    })) || [];

    // Sort by severity (High first) and then by date
    const sortedComplaints = complaints.sort((a, b) => {
      const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return new Date(b.dateOfIncident).getTime() - new Date(a.dateOfIncident).getTime();
    });

    // Get some basic statistics
    const stats = {
      total: complaints.length,
      highSeverity: complaints.filter(c => c.severity === 'High').length,
      mediumSeverity: complaints.filter(c => c.severity === 'Medium').length,
      lowSeverity: complaints.filter(c => c.severity === 'Low').length,
      withCrash: complaints.filter(c => c.crashIndicator).length,
      withFire: complaints.filter(c => c.fireIndicator).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        make,
        model,
        year: parseInt(year),
        statistics: stats,
        complaints: sortedComplaints.slice(0, 100), // Limit to 100 most relevant complaints
      },
    });

  } catch (error) {
    console.error('NHTSA Complaints API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch complaint data. Please try again later.'
      },
      { status: 500 }
    );
  }
}
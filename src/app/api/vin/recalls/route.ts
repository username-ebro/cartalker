import { NextRequest, NextResponse } from 'next/server';

interface NHTSARecallResponse {
  count?: number;
  Count?: number;
  message?: string;
  Message?: string;
  results?: NHTSARecall[];
  Results?: NHTSARecall[];
}

interface NHTSARecall {
  Manufacturer: string;
  NHTSACampaignNumber: string;
  Component: string;
  Summary: string;
  Consequence: string;
  Remedy: string;
  ReportReceivedDate: string;
}

interface RecallInfo {
  recallNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  dateInitiated: string;
  severity: 'Low' | 'Medium' | 'High';
}

function determineSeverity(consequence: string): 'Low' | 'Medium' | 'High' {
  const lowSeverityKeywords = ['warning', 'light', 'noise', 'vibration', 'minor'];
  const highSeverityKeywords = ['crash', 'fire', 'death', 'injury', 'brake', 'steering', 'airbag'];

  const consequenceLower = consequence.toLowerCase();

  if (highSeverityKeywords.some(keyword => consequenceLower.includes(keyword))) {
    return 'High';
  }

  if (lowSeverityKeywords.some(keyword => consequenceLower.includes(keyword))) {
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
      `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`,
      {
        headers: { 'User-Agent': 'CarTalker/1.0' },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`NHTSA Recalls API error: ${response.status}`);
    }

    const data: NHTSARecallResponse = await response.json();
    const results = data.results || data.Results || [];

    const recalls: RecallInfo[] = results.map(recall => ({
      recallNumber: recall.NHTSACampaignNumber || '',
      component: recall.Component || '',
      summary: recall.Summary || '',
      consequence: recall.Consequence || '',
      remedy: recall.Remedy || '',
      dateInitiated: recall.ReportReceivedDate || '',
      severity: determineSeverity(recall.Consequence),
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        make,
        model,
        year: parseInt(year),
        recallCount: recalls.length,
        recalls: recalls.slice(0, 50), // Limit to 50 most recent recalls
      },
    });

  } catch (error) {
    console.error('NHTSA Recalls API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch recall data. Please try again later.'
      },
      { status: 500 }
    );
  }
}
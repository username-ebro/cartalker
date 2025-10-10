import { NextRequest, NextResponse } from 'next/server';
import { TheftSalvageInfo } from '../route';

export interface NICBCheckResponse {
  success: boolean;
  data?: {
    vin: string;
    nicbStatus: TheftSalvageInfo;
    instructions: {
      step1: string;
      step2: string;
      step3: string;
      step4: string;
      limitations: string[];
      tips: string[];
    };
    verificationForm: {
      fields: {
        name: string;
        type: 'boolean' | 'text' | 'date';
        label: string;
        required: boolean;
      }[];
    };
  };
  error?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vin = searchParams.get('vin');

  if (!vin) {
    return NextResponse.json(
      { success: false, error: 'VIN parameter is required' },
      { status: 400 }
    );
  }

  // Validate VIN format
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  if (!vinRegex.test(vin)) {
    return NextResponse.json(
      { success: false, error: 'Invalid VIN format' },
      { status: 400 }
    );
  }

  try {
    const nicbStatus: TheftSalvageInfo = {
      theftStatus: undefined,
      salvageStatus: undefined,
      lastChecked: undefined,
      nicbCheckUrl: `https://www.nicb.org/vincheck`,
      manualVerificationRequired: true,
      sources: ['NICB VINCheck'],
      confidence: 'Manual Verification Required'
    };

    const instructions = {
      step1: "Visit NICB VINCheck at https://www.nicb.org/vincheck",
      step2: "Accept the Terms of Service (required for each search)",
      step3: `Enter VIN: ${vin.toUpperCase()}`,
      step4: "Review results and update the form below",
      limitations: [
        "Limited to 5 searches per day per IP address",
        "Requires accepting terms of service for each search",
        "No API available - manual verification only",
        "Data based on insurance claims and police reports",
        "May not include all incidents or recent data"
      ],
      tips: [
        "Check from different devices/networks if you hit the daily limit",
        "NICB data is most reliable for major theft and total loss incidents",
        "Consider additional sources for comprehensive history",
        "Document your findings with screenshots for future reference"
      ]
    };

    const verificationForm = {
      fields: [
        {
          name: 'theftStatus',
          type: 'boolean' as const,
          label: 'Vehicle reported as stolen',
          required: true
        },
        {
          name: 'salvageStatus',
          type: 'boolean' as const,
          label: 'Vehicle reported as salvage/total loss',
          required: true
        },
        {
          name: 'checkDate',
          type: 'date' as const,
          label: 'Date of NICB check',
          required: true
        },
        {
          name: 'additionalNotes',
          type: 'text' as const,
          label: 'Additional notes from NICB report',
          required: false
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: {
        vin: vin.toUpperCase(),
        nicbStatus,
        instructions,
        verificationForm
      }
    });

  } catch (error) {
    console.error('NICB check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to prepare NICB check data'
      },
      { status: 500 }
    );
  }
}

// Handle manual update of NICB status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vin, theftStatus, salvageStatus, checkDate, additionalNotes } = body;

    if (!vin) {
      return NextResponse.json(
        { success: false, error: 'VIN is required' },
        { status: 400 }
      );
    }

    // Validate VIN format
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    if (!vinRegex.test(vin)) {
      return NextResponse.json(
        { success: false, error: 'Invalid VIN format' },
        { status: 400 }
      );
    }

    // Create updated NICB status
    const updatedStatus: TheftSalvageInfo = {
      theftStatus: theftStatus === true,
      salvageStatus: salvageStatus === true,
      lastChecked: checkDate || new Date().toISOString().split('T')[0],
      nicbCheckUrl: 'https://www.nicb.org/vincheck',
      manualVerificationRequired: false,
      sources: ['NICB VINCheck (Manual Verification Completed)'],
      confidence: theftStatus || salvageStatus ? 'High' : 'Medium'
    };

    // In a real implementation, you would save this to a database
    // For now, we'll just return the updated status

    return NextResponse.json({
      success: true,
      data: {
        vin: vin.toUpperCase(),
        nicbStatus: updatedStatus,
        message: 'NICB status updated successfully',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('NICB update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update NICB status'
      },
      { status: 500 }
    );
  }
}

// Handle invalid methods
export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
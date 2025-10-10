import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Use Gemini Pro Vision model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Extract ALL information from this automotive service receipt/document with 100% accuracy.
    Return ONLY a JSON object with these exact fields (use null if not found):
    {
      "documentType": "receipt|invoice|contract|estimate",
      "vendor": {
        "name": "",
        "address": "",
        "phone": "",
        "fax": ""
      },
      "customer": {
        "name": "",
        "customerId": ""
      },
      "vehicle": {
        "color": "",
        "year": "",
        "make": "",
        "model": "",
        "vin": "",
        "license": "",
        "mileageIn": "",
        "mileageOut": "",
        "tag": ""
      },
      "service": {
        "roNumber": "",
        "invoiceNumber": "",
        "poNumber": "",
        "date": "",
        "timeOpened": "",
        "timeReady": "",
        "promised": "",
        "serviceAdvisor": "",
        "technician": "",
        "laborRate": ""
      },
      "services": [
        {
          "code": "",
          "description": "",
          "laborHours": "",
          "laborCost": "",
          "partsCost": "",
          "totalCost": ""
        }
      ],
      "totals": {
        "parts": "",
        "labor": "",
        "sublet": "",
        "misc": "",
        "tax": "",
        "total": ""
      },
      "notes": ""
    }`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type,
          data: base64Image
        }
      },
      prompt
    ]);

    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (Gemini might add markdown formatting)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse Gemini response as JSON');
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: parsedData,
      raw: text // Include raw response for debugging
    });

  } catch (error) {
    console.error('Gemini OCR error:', error);
    return NextResponse.json(
      { error: 'Failed to process image with Gemini', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
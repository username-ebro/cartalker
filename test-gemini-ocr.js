const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyDc9DnX2ed4eyL0LcBnDT-Q9oaCCp7nUzg');

async function processReceipt(imagePath) {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Extract ALL information from this automotive service receipt with 100% accuracy.
  Pay special attention to:
  - Vehicle make/model (read EXACTLY what's printed)
  - VIN number (all 17 characters)
  - Mileage IN and OUT
  - All dates and times
  - Service codes and descriptions
  - All costs

  Return ONLY a JSON object with the extracted data.`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image
      }
    },
    prompt
  ]);

  const response = await result.response;
  return response.text();
}

async function processBothPages() {
  console.log('Processing Page 1...');
  const page1 = await processReceipt('/Users/evanstoudt/Documents/File Cabinet/Coding/cartalker/receipts/evan/i36960-1.JPG');
  console.log('Page 1 Results:');
  console.log(page1);

  console.log('\n\nProcessing Page 2...');
  const page2 = await processReceipt('/Users/evanstoudt/Documents/File Cabinet/Coding/cartalker/receipts/evan/i36960-2.JPG');
  console.log('Page 2 Results:');
  console.log(page2);
}

processBothPages().catch(console.error);